import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Get access token
    const tokenRes = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch accounts list
    const accountsRes = await fetch('https://mail.zoho.in/api/accounts', {
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` }
    });
    const accountsData = await accountsRes.json();
    const accounts = accountsData.data?.map(a => ({ accountId: a.accountId, email: a.incomingUserName, primary: a.isDefaultAccount }));

    return Response.json({ accounts });
});