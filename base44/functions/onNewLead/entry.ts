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
    if (!data.access_token) throw new Error('Token error: ' + JSON.stringify(data));
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
        const base44 = createClientFromRequest(req);
        const { event, data } = await req.json();
        const lead = data;

        if (!lead?.email) return Response.json({ skipped: true });

        // Welcome email to lead
        await sendEmail(lead.email, `Welcome to EyE PunE, ${lead.full_name?.split(' ')[0] || 'there'}! 🚀`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:48px;" />
                    <h1 style="color:#fff; margin:20px 0 5px; font-size:24px;">Welcome to EyE PunE!</h1>
                    <p style="color:rgba(255,255,255,0.85); margin:0;">Your growth journey starts here 🎉</p>
                </div>
                <div style="padding: 30px;">
                    <p>Hi <strong>${lead.full_name?.split(' ')[0] || 'there'}</strong>,</p>
                    <p>Thank you for reaching out! We've received your information and our team is already reviewing your profile.</p>
                    <p>Here's what happens next:</p>
                    <ol style="line-height:2;">
                        <li>Our team will review your business profile within <strong>24 hours</strong></li>
                        <li>We'll reach out to schedule a <strong>free consultation call</strong></li>
                        <li>We'll craft a <strong>custom growth strategy</strong> tailored to your business</li>
                    </ol>
                    <p>In the meantime, get a head start with our <strong>Free AI Business Assessment</strong>:</p>
                    <div style="text-align:center; margin:25px 0;">
                        <a href="https://eyepune.com/AI_Assessment" style="background:#dc2626; color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:bold; font-size:16px;">Take Free AI Assessment →</a>
                    </div>
                    <p style="color:#666; font-size:14px;">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919284712033">+91 9284712033</a></p>
                </div>
                <div style="background:#f9f9f9; padding:20px; text-align:center; color:#999; font-size:12px;">
                    <p>EyE PunE · Pune, Maharashtra, India · connect@eyepune.com</p>
                </div>
            </div>
        `);

        // Admin notification
        await sendEmail('connect@eyepune.com', `🔥 New Lead: ${lead.full_name} (${lead.source || 'website'})`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color:#dc2626;">New Lead Alert!</h2>
                <table style="width:100%; border-collapse:collapse;">
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Name</td><td style="padding:8px; border:1px solid #eee;">${lead.full_name}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #eee;">${lead.email}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Phone</td><td style="padding:8px; border:1px solid #eee;">${lead.phone || '-'}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Company</td><td style="padding:8px; border:1px solid #eee;">${lead.company || '-'}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Source</td><td style="padding:8px; border:1px solid #eee;">${lead.source || '-'}</td></tr>
                </table>
                <p><a href="https://eyepune.com/Admin_CRM" style="background:#dc2626; color:#fff; padding:10px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:16px;">View in CRM →</a></p>
            </div>
        `);

        // Log activity via service role
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead.id,
            activity_type: 'email',
            title: 'Welcome email sent',
            description: 'Automated welcome email sent to new lead',
            performed_by: 'system'
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});