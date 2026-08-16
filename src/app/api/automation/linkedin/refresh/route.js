import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        return NextResponse.json({ error: 'Missing LinkedIn Developer Credentials' }, { status: 400 });
    }

    try {
        // Exchange refresh token for a new access token
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
        });

        const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            throw new Error(data.error_description || 'Failed to refresh token');
        }

        const newAccessToken = data.access_token;
        const expiresIn = data.expires_in; // Usually 5184000 (60 days)

        // Save new access token to Supabase
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            cookies: { getAll() { return []; }, setAll() { } }
        });

        // Upsert the system setting
        const { error: dbError } = await supabase
            .from('system_settings')
            .upsert({
                key: 'linkedin_config',
                value: {
                    token: newAccessToken,
                    expiresAt: Date.now() + (expiresIn * 1000)
                },
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, message: 'LinkedIn access token refreshed successfully.' });
    } catch (error) {
        console.error('[LinkedIn-Refresh] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
