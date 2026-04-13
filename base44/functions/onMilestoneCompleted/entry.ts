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
        const base44 = createClientFromRequest(req);
        const { data } = await req.json();
        const milestone = data;

        if (!milestone?.project_id) return Response.json({ skipped: true });

        // Fetch the project to get client details
        const projects = await base44.asServiceRole.entities.ClientProject.filter({ id: milestone.project_id });
        const project = projects[0];
        if (!project?.client_email) return Response.json({ skipped: 'no project found' });

        await sendEmail(project.client_email, `✅ Milestone Completed: "${milestone.title}"`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 24px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:40px;" />
                    <h2 style="color:#fff; margin:16px 0 4px;">Milestone Achieved! ✅</h2>
                </div>
                <div style="padding: 30px;">
                    <p>Hi <strong>${project.client_name?.split(' ')[0] || 'there'}</strong>,</p>
                    <p>Great progress! We've just completed a key milestone on your project:</p>
                    <div style="background:#f0fdf4; border-left:4px solid #16a34a; padding:16px; margin:20px 0; border-radius:4px;">
                        <p style="font-size:18px; font-weight:bold; margin:0; color:#15803d;">🎯 ${milestone.title}</p>
                        ${milestone.description ? `<p style="margin:8px 0 0; color:#555;">${milestone.description}</p>` : ''}
                    </div>
                    <p>Your project <strong>"${project.project_name}"</strong> is progressing well. Check your Client Portal to see all updates and upcoming milestones.</p>
                    <div style="text-align:center; margin:25px 0;">
                        <a href="https://eyepune.com/Client_Portal" style="background:#dc2626; color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:bold;">View Project Progress →</a>
                    </div>
                    <p style="color:#666; font-size:14px;">Questions? <a href="mailto:connect@eyepune.com">connect@eyepune.com</a></p>
                </div>
            </div>
        `);

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});