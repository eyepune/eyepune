import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[LinkedIn Commenter] Analyzing recent feed for engagement targets...');

        // 1. In a production scenario, you would use the LinkedIn Social API to fetch the feed
        // Currently, LinkedIn heavily restricts feed reading via API without the w_member_social scope
        // This is a placeholder for the logic once the agency app gets approved for feed reading.

        // 2. Fetch System Config for LinkedIn Token
        const { data: config } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'linkedin_config')
            .single();

        const token = config?.value?.token || process.env.LINKEDIN_ACCESS_TOKEN;
        
        if (!token) {
            return NextResponse.json({ error: 'No LinkedIn Token found. Connect account first.' }, { status: 400 });
        }

        // 3. Mock Target Post (To be replaced with actual LinkedIn feed fetch)
        const targetPosts = [
            { id: "urn:li:share:7472133861141962752", author: "Industry Leader", content: "AI is changing how we do B2B sales. What's your strategy for 2026?" }
        ];

        let commentsLeft = 0;

        for (const post of targetPosts) {
            // Generate contextual AI comment
            const prompt = `You are the Founder of EyE PunE, an elite AI Growth Agency.
            A leader on LinkedIn just posted this: "${post.content}"
            Write a highly insightful, professional 2-sentence comment adding value to this discussion.
            Rule: Do NOT pitch directly. Just be smart and authoritative.`;

            const llmResponse = await fetch(process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${process.env.LLM_API_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 250,
                    temperature: 0.7
                })
            });

            if (llmResponse.ok) {
                const llmData = await llmResponse.json();
                const aiComment = llmData.choices?.[0]?.message?.content || "";

                // Publish comment using LinkedIn UGC API (Requires specific endpoint access)
                // This will fail until w_member_social is approved by LinkedIn, but the architecture is ready.
                console.log(`[LinkedIn Commenter] Drafted comment for post ${post.id}: ${aiComment}`);
                
                await supabase.from('activity_logs').insert([{
                    action: 'linkedin_auto_comment',
                    details: `Drafted comment on post ${post.id}: ${aiComment}`,
                    status: 'pending_linkedin_approval'
                }]);
                
                commentsLeft++;
            }
        }

        return NextResponse.json({ success: true, targets_engaged: commentsLeft });

    } catch (error) {
        console.error('[LinkedIn Commenter] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
