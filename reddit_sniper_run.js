import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SUBREDDITS = ['SaaS', 'marketing', 'Entrepreneur', 'webdev', 'startups'];
const TARGET_KEYWORDS = ['need an agency', 'marketing not working', 'website is slow', 'how to get clients', 'seo help', 'conversion rate', 'looking for a dev', 'need a website', 'marketing advice'];

async function runSniper() {
    console.log('\n🎯 [Reddit Sniper] Initializing target acquisition sequence...\n');
    const draftedResponses = [];

    // Scan top 3 subreddits
    const targetSubs = ['SaaS', 'marketing', 'Entrepreneur'];
    
    for (const targetSub of targetSubs) {
        console.log(`📡 Scanning r/${targetSub}...`);

        try {
            const response = await fetch(`https://www.reddit.com/r/${targetSub}/new.json?limit=30`, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });

            if (!response.ok) {
                console.warn(`⚠️ Reddit API rate limited or blocked for r/${targetSub}: ${response.status} ${response.statusText}`);
                continue;
            }
            
            const data = await response.json();
            const posts = data.data?.children || [];

            for (const post of posts) {
                const { title, selftext, id, url, author } = post.data;
                const fullText = (title + " " + selftext).toLowerCase();

                // Check if post matches our target pain points
                const isTarget = TARGET_KEYWORDS.some(keyword => fullText.includes(keyword));

                if (isTarget) {
                    console.log(`\n======================================================`);
                    console.log(`🔥 TARGET ACQUIRED: "${title}"`);
                    console.log(`🔗 URL: https://reddit.com${url}`);
                    console.log(`⚙️ Generating tactical response via LLM...`);

                    const prompt = `
You are an elite Digital Marketing and AI Growth consultant from 'EyE PunE'.
A user on Reddit just asked this question:
Title: "${title}"
Body: "${selftext.substring(0, 500)}..."

Write a highly valuable, highly technical 2-paragraph response. 
Rule 1: Give away extreme value immediately. Solve a part of their problem.
Rule 2: At the very end, subtly mention "If you need a system that does this automatically, we build these architectures at EyE PunE (eyepune.com). Happy to hop on a quick strategy call."
Rule 3: DO NOT sound like a bot. Sound like an exhausted senior developer/marketer giving raw, honest advice.
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
                    const draftedComment = llmData.choices?.[0]?.message?.content || "Error generating response.";

                    console.log(`\n📝 DRAFTED RESPONSE:\n\n${draftedComment}\n`);
                    console.log(`======================================================\n`);

                    draftedResponses.push({
                        subreddit: targetSub,
                        post_title: title,
                        post_url: `https://reddit.com${url}`,
                        draft: draftedComment
                    });

                    // Only draft 1 per subreddit to save time in this live run
                    break;
                }
            }
        } catch (err) {
            console.error(`Error scanning r/${targetSub}:`, err.message);
        }
    }

    console.log(`\n✅ [Reddit Sniper] Scan complete. Targets found: ${draftedResponses.length}\n`);
}

runSniper();
