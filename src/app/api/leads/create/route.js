import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { triggerAutomation } from '@/lib/automation-service';
import { notifyNewInquiry } from '@/lib/admin-notifier';
import { triggerWhatsAppSequence } from '@/lib/whatsapp-service';

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
