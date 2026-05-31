import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

        // 2. We can either fetch pre-approved posts from the database OR generate one with AI right now
        // For a fully autonomous system, let's pretend we fetch the top pending post
        const { data: pendingPost, error } = await supabaseAdmin
            .from('linkedin_posts')
            .select('*')
            .eq('status', 'draft')
            .order('scheduled_for', { ascending: true })
            .limit(1)
            .maybeSingle();

        let postContent = "";

        if (pendingPost) {
            postContent = pendingPost.content;
        } else {
            // Fallback: Autonomous AI Generation if no drafts exist
            // In a real scenario, you would call OpenAI here: await openai.chat.completions.create(...)
            const topics = [
                "AI is completely changing how B2B companies scale. At EyE PunE, we're seeing startups 10x their growth using automated systems.",
                "Stop wasting time on manual outreach. The future of lead generation is AI-driven, intent-based scraping. #Growth #EyEPunE",
                "Most founders spend 80% of their time prospecting instead of closing. We built EyE PunE to flip that ratio. #Startups"
            ];
            postContent = topics[Math.floor(Math.random() * topics.length)];
            console.log("🤖 [EyE PunE AI] Generated fresh post:", postContent);
        }

        // 3. Post to LinkedIn Official API
        // You will need to add these to your Vercel Environment Variables
        const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
        const LINKEDIN_AUTHOR_URN = process.env.LINKEDIN_PERSON_URN || process.env.LINKEDIN_COMPANY_URN;

        if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_AUTHOR_URN) {
            console.log("⚠️ Missing LinkedIn API Keys. Skipping actual post.");
            return NextResponse.json({ error: 'Missing LinkedIn API keys in .env' }, { status: 500 });
        }

        const linkedinUrl = 'https://api.linkedin.com/v2/ugcPosts';
        const postData = {
            author: LINKEDIN_AUTHOR_URN,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: postContent },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };

        const response = await fetch(linkedinUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`LinkedIn API rejected the post: ${err}`);
        }

        // 4. If it was from the DB, mark it as published
        if (pendingPost) {
            await supabaseAdmin.from('linkedin_posts').update({ status: 'published' }).eq('id', pendingPost.id);
        }

        console.log("✅ [EyE PunE Auto-Poster] Successfully published to LinkedIn!");

        return NextResponse.json({ success: true, message: 'Autonomous post published!' });

    } catch (error) {
        console.error('[LinkedIn Cron Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
