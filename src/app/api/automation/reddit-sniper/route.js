import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SUBREDDITS = ['SaaS', 'marketing', 'Entrepreneur', 'webdev'];
const TARGET_KEYWORDS = ['need an agency', 'marketing not working', 'website is slow', 'how to get clients', 'seo help', 'conversion rate'];

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    // Allow bypass for local testing
    if (process.env.NODE_ENV !== 'development' && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Reddit Sniper] Initiating scan sequence...');
        const draftedResponses = [];

        // Pick a random subreddit to scrape to avoid rate limits
        const targetSub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
        console.log(`[Reddit Sniper] Scanning r/${targetSub}...`);

        const response = await fetch(`https://www.reddit.com/r/${targetSub}/new.json?limit=25`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });

        if (!response.ok) {
            console.warn(`[Reddit Sniper] Reddit API rate limited or blocked: ${response.status} ${response.statusText}`);
            return NextResponse.json({ 
                success: true, 
                targets_found: 0, 
                drafts: [],
                warning: 'Reddit API blocked the request (rate limit). Please try again later or use authenticated API.'
            });
        }
        
        const data = await response.json();
        const posts = data.data.children;

        for (const post of posts) {
            const { title, selftext, id, url, author } = post.data;
            const fullText = (title + " " + selftext).toLowerCase();

            // Check if post matches our target pain points
            const isTarget = TARGET_KEYWORDS.some(keyword => fullText.includes(keyword));

            if (isTarget) {
                console.log(`[Reddit Sniper] Target acquired: ${title}`);

                // Generate Sniper Response
                const prompt = `
You are an elite Digital Marketing and AI Growth consultant from 'EyE PunE'.
A user on Reddit just asked this question:
Title: "${title}"
Body: "${selftext}"

Write a highly valuable, highly technical 2-paragraph response. 
Rule 1: Give away extreme value immediately. Solve a part of their problem.
Rule 2: At the very end, subtly mention "If you need a system that does this automatically, we build these architectures at EyE PunE (eyepune.com). Happy to hop on a quick strategy call."
Rule 3: DO NOT sound like a bot. Sound like an exhausted senior developer giving raw advice.
`;

                const llmResponse = await fetch(LLM_API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${LLM_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.8
                    })
                });

                const llmData = await llmResponse.json();
                const draftedComment = llmData.choices?.[0]?.message?.content || "";

                draftedResponses.push({
                    subreddit: targetSub,
                    post_title: title,
                    post_url: `https://reddit.com${url}`,
                    draft: draftedComment
                });

                // Save to database for human review (Reddit shadowbans pure bots quickly)
                // Assuming an 'automation_logs' or 'reddit_drafts' table exists
                await supabase.from('activity_logs').insert([{
                    action: 'reddit_sniper_draft',
                    details: `Drafted response for: ${title}\nURL: ${url}\nDraft: ${draftedComment}`,
                    status: 'pending_review'
                }]).catch(e => console.warn('Supabase log failed', e));

                // Only draft 1-2 per run to stay under the radar
                if (draftedResponses.length >= 2) break;
            }
        }

        return NextResponse.json({ success: true, targets_found: draftedResponses.length, drafts: draftedResponses });

    } catch (error) {
        console.error('[Reddit Sniper] Failure:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
    }
}
