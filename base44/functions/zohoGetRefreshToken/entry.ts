import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { code } = await req.json();

    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            redirect_uri: 'https://www.zoho.in',
            code: code,
        })
    });

    const data = await res.json();
    return Response.json(data);
});