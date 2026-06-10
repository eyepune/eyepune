/**
 * LinkedIn Automation Service
 * Handles AI-powered content generation and publishing to LinkedIn.
 * Engineered to run safely inside Serverless and Cron workflows with full fallback setups.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

/**
 * Generates and publishes a LinkedIn post using AI.
 * @param {string} type - 'educational', 'promotional', 'news', or 'random'
 */
export async function generateAndPostToLinkedin(type = 'random') {
    console.log(`[LinkedIn-Automation] Starting ${type} post generation...`);

    try {
        // 1. Get LinkedIn Config from Database
        const { data: config } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'linkedin_config')
            .single();

        let token = process.env.LINKEDIN_ACCESS_TOKEN;
        let urn = null;

        if (config?.value) {
            token = config.value.token || token;
            urn = config.value.urn || null;
        }

        if (!token) {
            throw new Error('LinkedIn integration not connected. Please provide an Access Token in the Marketing Dashboard.');
        }

        // 2. Generate Content via LLM Prompt
        const prompt = `Act as an elite Global Social Media Manager for "EyE PunE", an enterprise AI Growth Partner.
Generate a high-impact, viral-optimized LinkedIn post of type: ${type.toUpperCase()}.

Agency Context:
- Services: Multi-Model AI Automations, Enterprise Web Architectures, Performance Marketing.
- Value Prop: We build sub-2-second loading digital infrastructure and AI-driven sales engines to scale global B2B brands.
- Target: Founders, C-Suite executives, and Enterprise Directors.

Elite Copywriting Rules:
1. THE HOOK: Start with a bold, scroll-stopping one-liner (no emojis in the first line).
2. THE BODY: Use short, punchy paragraphs (1-2 sentences max). Use clean line breaks.
3. THE TONE: Professional, authoritative, visionary, and highly technical. Speak directly to founders.
4. THE FORMAT: Use bullet points or numbered lists if explaining a concept. Minimal, strategic emojis only.
5. THE CTA: Always end with a powerful call to action: "Run a Free AI Assessment at eyepune.com/AI-Assessment"
6. NO PLACEHOLDERS: Do not use [Link] or [Company Name]. Always use "EyE PunE".
7. HASHTAGS: Include exactly 3 highly targeted hashtags at the very bottom.

Return ONLY the raw text string for the LinkedIn post. Do not include introductory text.`;

        let postContent = null;
        let success = false;

        // Perform direct server-to-server call to Nvidia NIM API (bypasses HTTP self-fetch deadlock on Vercel)
        if (LLM_API_KEY) {
            try {
                console.log('[LinkedIn-Automation] Calling NVIDIA NIM directly for content...');
                const llmResponse = await fetch(LLM_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${LLM_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'meta/llama-3.1-8b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 1024,
                        temperature: 0.8,
                        stream: false
                    })
                });

                if (llmResponse.ok) {
                    const llmData = await llmResponse.json();
                    postContent = llmData.choices?.[0]?.message?.content || '';
                    if (postContent) {
                        postContent = postContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                        postContent = postContent.replace(/^["']|["']$/g, '').trim();
                        success = true;
                        console.log('[LinkedIn-Automation] Content generated successfully via Llama 3.1.');
                    }
                } else {
                    const errText = await llmResponse.text();
                    console.warn(`[LinkedIn-Automation] NIM API returned non-OK status: ${llmResponse.status} - ${errText}`);
                }
            } catch (llmErr) {
                console.warn('[LinkedIn-Automation] Direct LLM fetch failed. Falling back to local premium templates:', llmErr.message);
            }
        }

        // If LLM or API Key fails, use premium local copywriting templates
        if (!success || !postContent) {
            console.log('[LinkedIn-Automation] Activating local premium copywriting engine.');
            postContent = getLocalPremiumLinkedinPost(type);
        }

        // 3. Resolve Author URN (Company Page takes priority)
        let authorUrn = null;
        let personUrn = null;
        
        try {
            const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const meData = await meRes.json();
            if (meData.sub) personUrn = `urn:li:person:${meData.sub}`;
        } catch (e) {
            console.warn('[LinkedIn-Automation] Could not fetch user profile details:', e.message);
        }

        if (process.env.LINKEDIN_ORGANIZATION_ID) {
            authorUrn = `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}`;
        } else if (urn) {
            authorUrn = urn;
        } else {
            authorUrn = personUrn;
        }

        if (!authorUrn) throw new Error('Could not resolve LinkedIn Author URN. Make sure your profile token is active.');

        // 4. Publish to LinkedIn with Retry Logic
        console.log(`[LinkedIn-Automation] Publishing post content to LinkedIn for author ${authorUrn}...`);
        
        let publishRes;
        let publishText;
        let publishData = {};
        const maxRetries = 3;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            publishRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                body: JSON.stringify({
                    author: authorUrn,
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            shareCommentary: { text: postContent },
                            shareMediaCategory: "NONE"
                        }
                    },
                    visibility: {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                })
            });

            publishText = await publishRes.text();
            try { publishData = JSON.parse(publishText); } catch(e) { publishData = {}; }
            
            if (publishRes.ok) break; // Success, exit retry loop
            
            if (attempt < maxRetries) {
                console.warn(`[LinkedIn-Automation] Publish attempt ${attempt} failed: ${publishRes.status}. Retrying in 2 seconds...`);
                
                if (publishRes.status === 403 && personUrn && authorUrn !== personUrn) {
                    console.log(`[LinkedIn-Automation] 403 Forbidden. Falling back from ${authorUrn} to personal profile URN: ${personUrn}`);
                    authorUrn = personUrn;
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
            }
        }

        if (!publishRes.ok) {
            const errStr = publishData.message || publishText || 'LinkedIn UGC API rejected share request.';
            throw new Error(`LinkedIn API Error (${publishRes.status}): ${errStr.substring(0, 200)}`);
        }

        // 5. Log Success in activity_logs
        await supabase.from('activity_logs').insert([{
            action: 'linkedin_auto_post',
            details: `Successfully published ${type} post to LinkedIn. URN: ${publishData.id}`,
            status: 'success'
        }]);

        return { success: true, postId: publishData.id, content: postContent };

    } catch (error) {
        console.error('[LinkedIn-Automation] Critical Failure:', error.message);
        
        // Log failure in activity_logs
        try {
            await supabase.from('activity_logs').insert([{
                action: 'linkedin_auto_post_failed',
                details: error.message,
                status: 'error'
            }]);
        } catch (e) {}

        return { success: false, error: error.message };
    }
}

/**
 * Premium Local LinkedIn Post Copywriter
 * Selects pre-written, highly persuasive B2B sales copy tailored to our services.
 */
function getLocalPremiumLinkedinPost(type) {
    const educationalPosts = [
        `If your landing page takes more than 2 seconds to load, you're donating conversions to your competitors.

In digital business, site latency is a direct leak of revenue. A 100ms delay can slash your checkouts by 1%. 

Monolithic sites compile pages on each click, locking databases and slowing down responses. The future is headless: next-gen Jamstack frameworks pre-rendered globally across serverless edge networks.

Stop leaking growth. Optimize your Core Web Vitals to 100% and accelerate your pipeline velocity.

Run a Free AI Assessment at eyepune.com/AI-Assessment

#WebPerformance #EnterpriseScale #B2BGrowth`,
        `Autonomous agents aren't science fiction—they are actively replacing traditional B2B sales funnels today.

Most growth teams take hours to qualify and follow up with hot leads. By then, the prospect's interest has already decayed.

Elite growth networks use multi-model AI architectures. A prospect fills out an assessment, specialized agents score it instantly, Central CRM is synchronized, and custom roadmaps are delivered to their WhatsApp in under 3 minutes.

Scale your acquisitions, minimize friction, and let software handle the high-effort, low-value pipelines.

Run a Free AI Assessment at eyepune.com/AI-Assessment

#AIAutomation #SalesOperations #PipelineVelocity`
    ];

    const promotionalPosts = [
        `Why are standard digital agencies failing high-growth brands in 2026?

Because modern B2B growth demands a unified combination of speed, deep software automation, and creative performance marketing.

At EyE PunE, we don't build standard company websites. We engineer high-speed digital assets with sub-2-second loading guarantees and custom AI sales integrations.

Discover the hidden bottlenecks in your digital acquisition funnel.

Run a Free AI Assessment at eyepune.com/AI-Assessment

#DigitalTransformation #SoftwareEngineering #SalesGrowth`,
        `How do you double your sales pipeline without doubling your sales team?

The answer is structural integration. When you connect your marketing platforms directly to autonomous lead enrichment engines, your sales representatives only meet with qualified, pre-warmed B2B prospects.

Stop managing databases with static spreadsheets. centralize your operations, automate follow-ups, and elevate conversion rates across every channel.

Get a complete analysis of your acquisition channels today.

Run a Free AI Assessment at eyepune.com/AI-Assessment

#SalesEfficiency #CentralizedCRM #BusinessScaling`
    ];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (type === 'educational') {
        return pickRandom(educationalPosts);
    } else if (type === 'promotional') {
        return pickRandom(promotionalPosts);
    } else {
        const combined = [...educationalPosts, ...promotionalPosts];
        return pickRandom(combined);
    }
}
