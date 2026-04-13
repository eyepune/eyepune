import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        })
    });

    const data = await res.json();
    if (!data.access_token) {
        throw new Error('Failed to get access token: ' + JSON.stringify(data));
    }
    return data.access_token;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { to, subject, html, text, cc, bcc } = await req.json();

        if (!to || !subject || (!html && !text)) {
            return Response.json({ error: 'Missing required fields: to, subject, and either html or text' }, { status: 400 });
        }

        const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
        const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME');
        const accessToken = await getAccessToken();

        const toArray = Array.isArray(to) ? to : [to];

        const payload = {
            fromAddress,
            toAddress: toArray.join(','),
            subject,
            content: html || text,
            mailFormat: html ? 'html' : 'plaintext',
        };

        if (cc) payload.ccAddress = Array.isArray(cc) ? cc.join(',') : cc;
        if (bcc) payload.bccAddress = Array.isArray(bcc) ? bcc.join(',') : bcc;

        const response = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || result.status?.code !== 200) {
            console.error('Zoho API error:', JSON.stringify(result));
            return Response.json({ error: 'Zoho API error', details: result }, { status: 500 });
        }

        return Response.json({ success: true, messageId: result.data?.messageId, sent_to: toArray });

    } catch (error) {
        console.error('Error sending email:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});