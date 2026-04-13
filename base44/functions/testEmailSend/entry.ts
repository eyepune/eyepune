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

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json().catch(() => ({}));
        const to = body.to || 'abovefaithcomplex@gmail.com';

        const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
        const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME');
        const accessToken = await getAccessToken();

        const response = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromAddress,
                toAddress: to,
                subject: '✅ Email Test — EyE PunE Automation Check',
                content: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
                    <h2 style="color:#ef4444">EyE PunE — Email Automation Test</h2>
                    <p>✅ Zoho Mail REST API (OAuth2) is <strong>working correctly</strong>.</p>
                    <p style="color:#666;font-size:13px">Sent: ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p>
                    <p style="color:#666;font-size:13px">— EyE PunE Team · connect@eyepune.com</p>
                </div>`,
                mailFormat: 'html'
            })
        });

        const result = await response.json();

        if (!response.ok || result.status?.code !== 200) {
            return Response.json({ error: 'Zoho API error', details: result }, { status: 500 });
        }

        return Response.json({ success: true, sent_to: to, messageId: result.data?.messageId });

    } catch (error) {
        console.error('Email test error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});