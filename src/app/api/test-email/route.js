import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'abovefaithcomplex@gmail.com';

  console.log(`[TestEmail] Attempting to send test email to: ${email}`);

  try {
    const result = await sendEmail({
      to: email,
      subject: '🚀 EyE PunE System Test',
      html: `
        <div style="font-family: sans-serif; padding: 30px; border: 1px solid #ef4444; border-radius: 12px; background: #fafafa;">
          <h1 style="color: #ef4444; margin-top: 0;">System Test Successful</h1>
          <p>Hello,</p>
          <p>This is a test email from the <strong>EyE PunE</strong> automation system.</p>
          <p><strong>Status:</strong> Email Service is active.</p>
          <p><strong>Provider:</strong> Zoho Mail (Primary) / Resend (Fallback)</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!', 
      details: result 
    });
  } catch (error) {
    console.error('[TestEmail] Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: 'Check if ZOHO_REFRESH_TOKEN or RESEND_API_KEY is missing in .env'
    }, { status: 500 });
  }
}
