import { sendEmail } from '@/lib/email-service';

// POST — Send bulk emails
export async function POST(request) {
  try {
    const { subject, html, recipients } = await request.json();

    if (!subject || !html || !recipients?.length) {
      return Response.json({ error: 'Subject, content, and recipients are required' }, { status: 400 });
    }

    // Standard Zoho API usually takes one recipient or a comma separated list.
    // For large bulk, it's recommended to send individually or use Zoho Campaigns.
    // Here we wrap it in the unified send service.
    
    // Note: Most SMTP/API providers have a limit for recipients in a single call.
    // For reliability, we send via the unified service.
    
    const result = await sendEmail({
      to: recipients,
      subject,
      html
    });

    return Response.json({ success: true, result });

  } catch (error) {
    console.error('Bulk email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
