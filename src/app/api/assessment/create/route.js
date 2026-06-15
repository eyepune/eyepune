import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// In-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000 * 5; // 5 minutes
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimiter.set(ip, { timestamp: now, count: 1 });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

export async function POST(request) {
  try {
    // ── ORIGIN / CORS ENFORCEMENT ──
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const isLocalDev = process.env.NODE_ENV === 'development';
    
    if (!isLocalDev) {
        const allowedDomain = 'eyepune.com';
        const isValidOrigin = origin && origin.includes(allowedDomain);
        const isValidReferer = referer && referer.includes(allowedDomain);
        
        if (!isValidOrigin && !isValidReferer) {
            console.warn(`[Assessment API] Blocked cross-origin request from Origin: ${origin}`);
            return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
        }
    }

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      console.warn(`[Assessment API] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json({ success: true, bot: true });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      business_type,
      revenue_range,
      lead_generation_method,
      sales_process,
      marketing_channels,
      team_size,
      online_presence,
      crm_usage,
      biggest_challenge,
      growth_goals,
      score,
      ai_report,
      hp_verification
    } = body;

    // Honeypot check for bots
    if (hp_verification) {
      console.warn('[Assessment API] Bot detected by honeypot');
      return NextResponse.json({ success: true, bot: true });
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // ── ADVANCED SPAM & BOT DETECTION ──
    const isBot = (() => {
        if (name.length > 10 && !name.includes(' ')) {
            const upperCount = (name.match(/[A-Z]/g) || []).length;
            const lowerCount = (name.match(/[a-z]/g) || []).length;
            if (upperCount > 3 && lowerCount > 3) return true;
        }

        if (email.toLowerCase().endsWith('@gmail.com')) {
            const localPart = email.split('@')[0];
            const dotCount = (localPart.match(/\./g) || []).length;
            if (dotCount >= 2) return true;
        }

        if (biggest_challenge) {
            const urlPattern = /(http:\/\/|https:\/\/|www\.)/i;
            const htmlPattern = /(<a\s+href=|<script>|\[url=)/i;
            if (urlPattern.test(biggest_challenge) || htmlPattern.test(biggest_challenge)) return true;
            
            const cyrillicPattern = /[\u0400-\u04FF]/;
            if (cyrillicPattern.test(biggest_challenge) || cyrillicPattern.test(name)) return true;
        }

        return false;
    })();

    if (isBot) {
        console.warn(`[Assessment API] Advanced Bot Detected - Blocked submission from: ${name} (${email})`);
        return NextResponse.json({ success: true, bot: true });
    }

    // 1. Save Assessment (bypassing RLS with service_role)
    const { data: savedAssessment, error: assessmentError } = await supabaseAdmin
        .from('ai_assessments')
        .insert([{
            full_name: name,
            email: email,
            business_name: company || '',
            business_type: business_type || '',
            revenue_range: revenue_range || '',
            lead_generation_method: lead_generation_method || '',
            sales_process: sales_process || '',
            marketing_channels: marketing_channels || '',
            team_size: team_size || '',
            online_presence: online_presence || '',
            crm_usage: crm_usage || '',
            biggest_challenge: biggest_challenge || '',
            growth_goals: growth_goals || '',
            score: score || 0,
            ai_report: ai_report || '',
            converted_to_lead: false
        }])
        .select()
        .single();

    if (assessmentError) {
      console.error('[Assessment API] Error inserting assessment:', assessmentError);
      return NextResponse.json({ error: 'Database error saving assessment' }, { status: 500 });
    }

    // 2. Save to leads table
    const { data: savedLead, error: leadError } = await supabaseAdmin
        .from('leads')
        .insert([{
            full_name: name,
            email: email,
            phone: phone || '',
            company: company || '',
            source: 'ai_assessment',
            status: 'new',
            score: score, // Usually the CRM score but we'll use the assessment score or a fallback
            notes: `Growth Score: ${score}/100. Challenge: ${biggest_challenge}`
        }])
        .select()
        .single();

    if (leadError) {
      console.warn('[Assessment API] Error inserting lead (non-fatal):', leadError);
    } else if (savedAssessment && savedLead) {
        // Link assessment to lead
        await supabaseAdmin
            .from('ai_assessments')
            .update({ converted_to_lead: true, lead_id: savedLead.id })
            .eq('id', savedAssessment.id)
            .catch(err => console.warn('[Assessment API] Failed to link assessment:', err));
    }

    // Try to trigger internal webhooks asynchronously so we don't block the response
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    fetch(`${baseUrl}/api/automation/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'new_assessment',
        payload: { name, email, phone, business: company || 'their business', score, report: ai_report }
      })
    }).catch(err => console.warn('[Assessment API] Automation trigger failed:', err.message));

    fetch(`${baseUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'assessment',
        payload: { name, business: company || 'their business', score, challenge: biggest_challenge }
      })
    }).catch(err => console.warn('[Assessment API] Admin notification trigger failed:', err.message));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Assessment API] Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
