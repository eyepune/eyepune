import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token error');
    return data.access_token;
}

async function sendEmail(to, subject, html) {
    const accessToken = await getAccessToken();
    const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
    const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';
    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAddress, toAddress: to, subject, content: html, mailFormat: 'html' })
    });
    return res.json();
}

Deno.serve(async (req) => {
    try {
        const { data } = await req.json();
        const inquiry = data;

        if (!inquiry?.email) return Response.json({ skipped: true });

        const serviceLabels = {
            social_media: 'Social Media Management',
            web_app: 'Website / Web App Development',
            ai_automation: 'AI & Automation',
            branding: 'Branding & Design',
            growth_bundle: 'Growth Bundle',
            custom: 'Custom Solution'
        };
        const serviceName = serviceLabels[inquiry.service_interest] || 'Digital Growth';

        // Auto-reply to inquirer
        await sendEmail(inquiry.email, `We received your inquiry, ${inquiry.name?.split(' ')[0] || 'there'}! ✅`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:48px;" />
                </div>
                <div style="padding: 30px;">
                    <h2>Hi ${inquiry.name?.split(' ')[0] || 'there'}, we've got your message! 🎯</h2>
                    <p>Thank you for your interest in <strong>${serviceName}</strong>. Our team has been notified and will respond within <strong>4-8 business hours</strong>.</p>
                    <div style="background:#fff5f5; border-left:4px solid #dc2626; padding:16px; margin:20px 0; border-radius:4px;">
                        <p style="margin:0; font-style:italic; color:#555;">"${inquiry.message || 'Your message has been received.'}"</p>
                    </div>
                    <p>While you wait, book a <strong>free 30-min strategy call</strong>:</p>
                    <div style="text-align:center; margin:25px 0;">
                        <a href="https://eyepune.com/Booking" style="background:#dc2626; color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:bold;">Book Free Consultation →</a>
                    </div>
                    <p style="color:#666; font-size:14px;">Need urgent help? WhatsApp: <a href="https://wa.me/919284712033">+91 9284712033</a></p>
                </div>
                <div style="background:#f9f9f9; padding:20px; text-align:center; color:#999; font-size:12px;">
                    <p>EyE PunE · connect@eyepune.com · +91 9284712033</p>
                </div>
            </div>
        `);

        // Admin notification
        await sendEmail('connect@eyepune.com', `📩 New Inquiry: ${inquiry.name} — ${serviceName}`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color:#dc2626;">New Inquiry Received!</h2>
                <table style="width:100%; border-collapse:collapse;">
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Name</td><td style="padding:8px; border:1px solid #eee;">${inquiry.name}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #eee;">${inquiry.email}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Phone</td><td style="padding:8px; border:1px solid #eee;">${inquiry.phone || '-'}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Company</td><td style="padding:8px; border:1px solid #eee;">${inquiry.company || '-'}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Service Interest</td><td style="padding:8px; border:1px solid #eee;">${serviceName}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Message</td><td style="padding:8px; border:1px solid #eee;">${inquiry.message || '-'}</td></tr>
                </table>
                <p><a href="https://eyepune.com/Admin_CRM" style="background:#dc2626; color:#fff; padding:10px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:16px;">View in CRM →</a></p>
            </div>
        `);

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});