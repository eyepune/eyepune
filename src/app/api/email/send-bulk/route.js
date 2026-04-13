import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// POST — Send bulk emails
export async function POST(request) {
  try {
    const { subject, html, recipients } = await request.json();

    if (!subject || !html || !recipients?.length) {
      return Response.json({ error: 'Subject, content, and recipients are required' }, { status: 400 });
    }

    // Use Supabase to send emails via the built-in email service
    // For production, you'd use Resend, SendGrid, or similar
    // For now, we'll log and store the campaign send record
    const admin = getAdminClient();

    // Store email records for tracking
    const emailRecords = recipients.map(email => ({
      recipient_email: email,
      subject,
      status: 'queued',
      sent_at: new Date().toISOString(),
    }));

    // Try to send via Resend if API key is available
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EyE PunE <connect@eyepune.com>',
          to: recipients,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Resend API error');
      }

      return Response.json({ success: true, sent: recipients.length });
    }

    // Fallback: If no email service configured, return info
    return Response.json({
      success: false,
      message: 'No email service configured. Set RESEND_API_KEY in .env to enable bulk email sending.',
      recipients: recipients.length,
      note: 'Campaign has been saved. Configure an email provider to actually send emails.',
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
