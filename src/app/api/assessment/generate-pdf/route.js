import { generateStrategyPDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/email-service';

export async function POST(request) {
    try {
        const data = await request.json();
        
        if (!data.name || !data.report) {
            return new Response(JSON.stringify({ error: 'Missing required data' }), { status: 400 });
        }

        const pdfBuffer = await generateStrategyPDF(data);
        const filename = `EyE_PunE_Strategy_${data.name.replace(/\s+/g, '_')}.pdf`;

        // Send Email Automatically if email is provided
        if (data.email) {
            try {
                // Determine which email to use; if user is doing URL audit, they may not have entered email
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #ef4444;">Your Strategic Blueprint is Ready.</h2>
                        <p>Hi ${data.name},</p>
                        <p>Thank you for taking the EyE PunE AI Assessment. We have analyzed your digital infrastructure and compiled a personalized 90-day growth roadmap specifically for your business.</p>
                        <p><strong>Your custom PDF report is attached to this email.</strong></p>
                        <p>If you are ready to implement these systems and scale your revenue autonomously, let's talk.</p>
                        <a href="https://eyepune.com/Booking" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 15px;">Book Your Strategy Call</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #888;">
                            EyE PunE · Connect. Engage. Grow.<br>
                            Pune, Maharashtra
                        </p>
                    </div>
                `;

                // Convert ArrayBuffer to Base64 for Email Service
                const base64Buffer = Buffer.from(pdfBuffer).toString('base64');

                await sendEmail({
                    to: data.email,
                    subject: 'Your Custom AI Strategic Blueprint - EyE PunE',
                    html: emailHtml,
                    attachments: [{
                        filename: filename,
                        content: base64Buffer, // the email service expects base64
                        type: 'application/pdf'
                    }]
                });
                console.log(`[PDF-API] Successfully emailed PDF to ${data.email}`);
            } catch (emailError) {
                console.error(`[PDF-API] Failed to email PDF to ${data.email}:`, emailError.message);
                // We don't throw here; we still want them to be able to download the PDF
            }
        }

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('[PDF-API] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
