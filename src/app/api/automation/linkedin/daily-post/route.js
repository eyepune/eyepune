import { NextResponse } from 'next/server';
import { generateAndPostToLinkedin } from '@/lib/linkedin-automation';

export const maxDuration = 60;

/**
 * Daily LinkedIn Automation Endpoint
 * Hits this endpoint 2x a day to rotate educational and promotional content.
 */
export async function POST(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        
        // Determine type based on time or payload
        // If no type provided, we pick based on current hour
        let type = body.type;
        if (!type) {
            const hour = new Date().getUTCHours();
            // Morning post (4 AM UTC / 9:30 AM IST): Educational
            // Afternoon post (10 AM UTC / 3:30 PM IST): Promotional
            type = hour < 9 ? 'educational' : 'promotional';
        }

        const result = await generateAndPostToLinkedin(type);

        const { supabase } = await import('@/integrations/supabase/client');
        if (!result.success) {
            try {
                await supabase.from('automation_logs').insert([{
                    type: 'linkedin',
                    status: 'failure',
                    message: result.error,
                    payload: { type }
                }]);
            } catch (e) { console.warn('Could not log failure:', e.message); }
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        try {
            await supabase.from('automation_logs').insert([{
                type: 'linkedin',
                status: 'success',
                message: `Published ${type} post to LinkedIn.`,
                payload: { type, postId: result.postId }
            }]);
        } catch (e) { console.warn('Could not log success:', e.message); }

        return NextResponse.json({
            success: true,
            message: `LinkedIn ${type} post published successfully`,
            postId: result.postId
        });
    } catch (error) {
        console.error('[LinkedIn-Cron] Error:', error);
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase.from('automation_logs').insert([{
                type: 'linkedin',
                status: 'failure',
                message: error.message
            }]);
        } catch (e) {}
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Support GET for easy manual testing
export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(request.url);
    const manualBypass = searchParams.get('manual_trigger') === 'true';

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !manualBypass) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = searchParams.get('type') || 'educational';
    
    const result = await generateAndPostToLinkedin(type);
    return NextResponse.json(result);
}
