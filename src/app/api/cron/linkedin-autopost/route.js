import { NextResponse } from 'next/server';
import { generateAndPostToLinkedin } from '@/lib/linkedin-automation';

export const dynamic = 'force-dynamic';

// Vercel Cron Job Endpoint
// This endpoint will be triggered automatically every day by Vercel
export async function GET(request) {
    try {
        // 1. Verify Vercel Cron Security (Optional but recommended in production)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log("🤖 [EyE PunE Auto-Poster] Waking up...");

        const result = await generateAndPostToLinkedin();

        if (!result.success) {
            console.error("⚠️ LinkedIn Auto-Poster failed:", result.error);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        console.log("✅ [EyE PunE Auto-Poster] Successfully published to LinkedIn!");

        return NextResponse.json({ success: true, message: 'Autonomous post published!', postId: result.postId });

    } catch (error) {
        console.error('[LinkedIn Cron Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
