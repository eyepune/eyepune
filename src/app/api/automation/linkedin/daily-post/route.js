import { NextResponse } from 'next/server';
import { generateAndPostToLinkedin } from '@/lib/linkedin-automation';

/**
 * Daily LinkedIn Automation Endpoint
 * Hits this endpoint 2x a day to rotate educational and promotional content.
 */
export async function POST(request) {
    // 1. Verify Authorization (Optional: check for a secret header if using Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        
        // Determine type based on time or payload
        // If no type provided, we pick based on current hour
        let type = body.type;
        if (!type) {
            const hour = new Date().getHours();
            // Morning post (before 12 PM): Educational
            // Evening post (after 12 PM): Promotional
            type = hour < 12 ? 'educational' : 'promotional';
        }

        const result = await generateAndPostToLinkedin(type);

        const { supabase } = await import('@/integrations/supabase/client');
        if (!result.success) {
            await supabase.from('automation_logs').insert([{
                type: 'linkedin',
                status: 'failure',
                message: result.error,
                payload: { type }
            }]);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        await supabase.from('automation_logs').insert([{
            type: 'linkedin',
            status: 'success',
            message: `Published ${type} post to LinkedIn.`,
            payload: { type, postId: result.postId }
        }]);

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'educational';
    
    const result = await generateAndPostToLinkedin(type);
    return NextResponse.json(result);
}
