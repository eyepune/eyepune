import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { triggerAutomation } from '@/lib/automation-service';
import { notifyNewInquiry } from '@/lib/admin-notifier';
import { triggerWhatsAppSequence } from '@/lib/whatsapp-service';

// In-memory rate limiter (mitigates burst attacks on the same serverless instance)
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000 * 5; // 5 minutes
const RATE_LIMIT_MAX = 3; // Max 3 submissions per 5 minutes

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
    
    // In production, block direct API requests that don't come from our domain
    if (!isLocalDev) {
        const allowedDomain = 'eyepune.com';
        const isValidOrigin = origin && origin.includes(allowedDomain);
        const isValidReferer = referer && referer.includes(allowedDomain);
        
        if (!isValidOrigin && !isValidReferer) {
            console.warn(`[Leads API] Blocked cross-origin request from Origin: ${origin}, Referer: ${referer}`);
            return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
        }
    }

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      console.warn(`[Leads API] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json({ success: true, bot: true }); // Ghost the spammer
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      service_interest,
      message,
      source = 'website',
      hp_verification
    } = body;

    // Honeypot check for bots
    if (hp_verification) {
      console.warn('[Leads API] Bot detected by honeypot');
      return NextResponse.json({ success: true, bot: true });
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // ── ADVANCED SPAM & BOT DETECTION ──
    const isBot = (() => {
        // 1. Check for gibberish name (no spaces, weird capitalization, or super long without vowels)
        if (name.length > 10 && !name.includes(' ')) {
            const upperCount = (name.match(/[A-Z]/g) || []).length;
            const lowerCount = (name.match(/[a-z]/g) || []).length;
            // If it's a mix of random caps like "qeIMhqODmdVrllY"
            if (upperCount > 3 && lowerCount > 3) return true;
        }

        // 2. Check for "dot trick" in Gmail (e.g., j.oy.bek.09@gmail.com)
        if (email.toLowerCase().endsWith('@gmail.com')) {
            const localPart = email.split('@')[0];
            const dotCount = (localPart.match(/\./g) || []).length;
            if (dotCount >= 2) return true; // High probability of spam alias
        }

        // 3. Block submissions containing links (Bots drop SEO spam links)
        if (message) {
            const urlPattern = /(http:\/\/|https:\/\/|www\.)/i;
            const htmlPattern = /(<a\s+href=|<script>|\[url=)/i;
            if (urlPattern.test(message) || htmlPattern.test(message)) return true;
            
            // 4. Block Cyrillic/Russian characters (Massive source of form spam)
            const cyrillicPattern = /[\u0400-\u04FF]/;
            if (cyrillicPattern.test(message) || cyrillicPattern.test(name)) return true;
        }

        return false;
    })();

    if (isBot) {
        console.warn(`[Leads API] Advanced Bot Detected - Blocked submission from: ${name} (${email})`);
        // Return success so the bot thinks it worked and doesn't try a different method
        return NextResponse.json({ success: true, bot: true });
    }

    // 1. Save lead to CRM (bypassing RLS with service_role)
    const { error: leadError } = await supabaseAdmin.from('leads').insert([{
      full_name: name,
      email: email,
      phone: phone || '',
      company: company || '',
      source: source,
      status: 'new',
      notes: `Service Interest: ${service_interest}\nMessage: ${message}`
    }]);

    if (leadError) {
      console.error('[Leads API] Error inserting lead:', leadError);
      return NextResponse.json({ error: 'Database error saving lead' }, { status: 500 });
    }

    // 1.1 Save to inquiries table for admin visibility
    const { error: inquiryError } = await supabaseAdmin.from('inquiries').insert([{
      full_name: name,
      email: email,
      phone: phone || '',
      company: company || '',
      service_interest: service_interest || 'General Inquiry',
      message: message || '',
      source: source,
      status: 'new'
    }]);

    if (inquiryError) {
      console.warn('[Leads API] Error inserting inquiry (non-fatal):', inquiryError);
    }

    // Trigger Client Email (Automations) directly
    try {
      await triggerAutomation('new_inquiry', { 
        name, 
        email, 
        phone, 
        company: company || 'their business', 
        service: service_interest || 'General Inquiry' 
      });
    } catch (err) {
      console.warn('[Leads API] Automation trigger failed:', err.message);
    }

    // Automatically generate and email the PDF Blueprint if this is a Lead Magnet request
    if (source === 'SEO Blueprint Lead Magnet') {
      try {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        await fetch(`${baseUrl}/api/automation/blueprint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, keyword: service_interest, name: name })
        });
        console.log('[Leads API] Blueprint generated and sent successfully.');
      } catch (err) {
        console.warn('[Leads API] Blueprint automation trigger failed:', err.message);
      }
    }

    // Admin Notification directly
    try {
      await notifyNewInquiry({ 
        name, 
        email, 
        service: service_interest || 'General Inquiry', 
        message 
      });
    } catch (err) {
      console.warn('[Leads API] Admin notification trigger failed:', err.message);
    }

    // WhatsApp Sequence Trigger (send template to lead if they provided a phone number)
    if (phone) {
      triggerWhatsAppSequence({
        triggerType: 'new_inquiry',
        recipientPhone: phone,
        recipientName: name
      }).catch(err => console.warn('[Leads API] WhatsApp sequence trigger failed:', err.message));
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Leads API] Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
