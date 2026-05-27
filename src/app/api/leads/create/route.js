import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
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

    // Try to trigger internal webhooks asynchronously so we don't block the response
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    fetch(`${baseUrl}/api/automation/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'new_inquiry',
        payload: { name, email, phone, company: company || 'their business', service: service_interest || 'General Inquiry' }
      })
    }).catch(err => console.warn('[Leads API] Automation trigger failed:', err.message));

    // Automatically generate and email the PDF Blueprint if this is a Lead Magnet request
    if (name === 'SEO Blueprint Lead') {
      fetch(`${baseUrl}/api/automation/blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keyword: service_interest, name: company })
      }).catch(err => console.warn('[Leads API] Blueprint automation trigger failed:', err.message));
    }

    fetch(`${baseUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inquiry',
        payload: { name, email, service: service_interest || 'General Inquiry', message }
      })
    }).catch(err => console.warn('[Leads API] Admin notification trigger failed:', err.message));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Leads API] Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
