import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: { getAll() { return []; }, setAll() { } }
        });

        const { data: config } = await supabase
            .from('system_settings')
            .select('value, updated_at')
            .eq('key', 'linkedin_config')
            .single();

        // Calculate days since the refresh token was presumably set up
        // (Assuming the token was set up the first time this row was created or last updated)
        const setupDate = new Date(config?.updated_at || Date.now());
        const daysElapsed = Math.floor((Date.now() - setupDate.getTime()) / (1000 * 60 * 60 * 24));

        // If it's been more than 350 days, send an alert! (Expires at 365)
        if (daysElapsed >= 350) {
            await sendEmail(
                process.env.ZOHO_MAIL_USERNAME || 'connect@eyepune.com', // To admin
                'URGENT: LinkedIn Automation Token Expiring Soon',
                `Your LinkedIn Refresh Token is approaching its 1-year expiration date (${365 - daysElapsed} days remaining).\n\nIf it expires, your automated LinkedIn posts will stop working. Please log in to the LinkedIn Developer Portal to generate a new refresh token and update your environment variables.`
            );
            return NextResponse.json({ success: true, message: 'Alert sent' });
        }

        return NextResponse.json({ success: true, message: `Token is healthy. ${daysElapsed} days elapsed.` });
    } catch (error) {
        console.error('[LinkedIn-Expiry-Check] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
