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
        const project = data;

        if (!project?.client_email) return Response.json({ skipped: true });

        const typeLabels = { social_media: 'Social Media', web_app: 'Web App', ai_automation: 'AI Automation', branding: 'Branding', full_service: 'Full Service' };
        const typeName = typeLabels[project.project_type] || 'Project';

        await sendEmail(project.client_email, `🚀 Your ${typeName} Project Has Started — Welcome Aboard!`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:48px;" />
                    <h1 style="color:#fff; margin:20px 0 5px;">Project Kickoff! 🚀</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Hi <strong>${project.client_name?.split(' ')[0] || 'there'}</strong>,</p>
                    <p>Exciting news — your project <strong>"${project.project_name}"</strong> has officially kicked off! Welcome to the EyE PunE family. 🎉</p>
                    <div style="background:#f8f8f8; border-radius:12px; padding:20px; margin:20px 0;">
                        <p style="margin:6px 0;">📁 <strong>Project:</strong> ${project.project_name}</p>
                        <p style="margin:6px 0;">🏷️ <strong>Type:</strong> ${typeName}</p>
                        ${project.expected_completion_date ? `<p style="margin:6px 0;">🗓️ <strong>Expected Completion:</strong> ${project.expected_completion_date}</p>` : ''}
                    </div>
                    <p><strong>What to expect:</strong></p>
                    <ul style="line-height:2; color:#444;">
                        <li>Weekly progress updates via your Client Portal</li>
                        <li>Regular check-in calls to align on feedback</li>
                        <li>All deliverables tracked and shared in real-time</li>
                    </ul>
                    <div style="text-align:center; margin:25px 0;">
                        <a href="https://eyepune.com/Client_Portal" style="background:#dc2626; color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:bold;">Access Client Portal →</a>
                    </div>
                    <p style="color:#666; font-size:14px;">Your dedicated contact: <a href="mailto:connect@eyepune.com">connect@eyepune.com</a> | <a href="https://wa.me/919284712033">WhatsApp</a></p>
                </div>
                <div style="background:#f9f9f9; padding:20px; text-align:center; color:#999; font-size:12px;">
                    <p>EyE PunE · Pune, Maharashtra · connect@eyepune.com</p>
                </div>
            </div>
        `);

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});