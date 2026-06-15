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
- Services: AI Automations, Web Architectures, Performance Marketing, Pitch Decks, Logos, Brochures, Visiting Cards, and Full Branding.
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
        `If your landing page takes more than 2 seconds to load, you're donating conversions to your competitors.\n\nIn digital business, site latency is a direct leak of revenue. A 100ms delay can slash your checkouts by 1%. \n\nMonolithic sites compile pages on each click, locking databases and slowing down responses. The future is headless: next-gen Jamstack frameworks pre-rendered globally across serverless edge networks.\n\nStop leaking growth. Optimize your Core Web Vitals to 100% and accelerate your pipeline velocity.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#WebPerformance #EnterpriseScale #B2BGrowth`,
        
        `Autonomous agents aren't science fiction—they are actively replacing traditional B2B sales funnels today.\n\nMost growth teams take hours to qualify and follow up with hot leads. By then, the prospect's interest has already decayed.\n\nElite growth networks use multi-model AI architectures. A prospect fills out an assessment, specialized agents score it instantly, Central CRM is synchronized, and custom roadmaps are delivered to their WhatsApp in under 3 minutes.\n\nScale your acquisitions, minimize friction, and let software handle the high-effort, low-value pipelines.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#AIAutomation #SalesOperations #PipelineVelocity`,

        `Data siloes are the silent killers of enterprise growth.\n\nWhen your marketing data doesn't seamlessly talk to your sales CRM, you are marketing blind. You are wasting ad spend on leads your sales team will disqualify.\n\nModern architectures use unified data lakes and event-driven webhooks. When a lead clicks an ad, their entire journey is instantly enriched and piped directly into the sales dashboard before the first call.\n\nEliminate the guesswork. Build a unified revenue engine.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#DataEngineering #RevenueOperations #B2BTech`,

        `Stop competing on price. Compete on digital experience.\n\nB2B buyers are consumers first. They expect the same fluid, instant, premium digital experiences they get from consumer apps.\n\nIf your website looks like a brochure from 2015, your brand equity is plummeting. Implementing high-end micro-animations, personalized content hubs, and dynamic rendering isn't "nice to have"—it's how you justify premium pricing.\n\nElevate your digital presence to match the quality of your service.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#DigitalExperience #BrandEquity #WebDevelopment`,

        `AI isn't just for writing emails; it's for completely restructuring your operational margins.\n\nFirms scaling past $5M/ARR aren't doing it by hiring twice as many people. They are doing it by deploying AI agents to handle level-1 support, dynamic pricing adjustments, and lead routing.\n\nYour operational bottleneck is human latency. Software doesn't sleep, doesn't need onboarding, and scales infinitely on demand.\n\nIdentify exactly where AI can replace manual labor in your firm.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#ArtificialIntelligence #BusinessScaling #OperationalEfficiency`,

        `You don't need more traffic. You need a better conversion architecture.\n\nDriving thousands of clicks to a static, unoptimized landing page is a waste of capital. \n\nBefore scaling ad spend, implement dynamic personalization, rigorous A/B testing infrastructure, and AI-driven exit-intent mechanisms. Fix the bucket before you turn on the hose.\n\nMaximize your Return on Ad Spend by fixing your funnel.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#ConversionOptimization #GrowthMarketing #DigitalStrategy`,

        `The "spray and pray" cold outreach method is dead.\n\nDecision-makers' inboxes are flooded with generic AI spam. If you want to stand out, you need hyper-personalized, data-backed intent signals.\n\nWe build automation pipelines that monitor your target accounts for specific triggers (hiring, funding, news), and dynamically generate highly relevant outreach that actually gets read.\n\nQuality over quantity, automated at scale.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#B2BSales #LeadGeneration #SalesTech`,

        `Your brand isn't what you say it is. It's what Google says it is.\n\nProgrammatic SEO is how modern tech companies dominate search results. Instead of writing 10 blog posts, they engineer systems that dynamically generate 10,000 highly-targeted, high-value pages based on user search intent.\n\nCapture the long-tail keywords your competitors are ignoring.\n\nDiscover the power of automated search engine dominance.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#SEO #ProgrammaticSEO #DigitalMarketing`,

        `Most business dashboards are completely useless.\n\nThey display vanity metrics—page views, likes, and impressions—instead of actionable revenue drivers.\n\nWe engineer custom executive dashboards that track Pipeline Velocity, Customer Acquisition Cost (CAC) by channel, and predicted Lifetime Value (LTV) using machine learning models.\n\nStop guessing. Start steering your company with hard data.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#DataAnalytics #BusinessIntelligence #FounderInsights`,

        `A CRM is only as good as the automations built on top of it.\n\nIf your sales team has to manually log calls, update deal stages, and schedule follow-ups, your CRM is just an expensive digital filing cabinet.\n\nTrue CRM implementation involves intelligent workflows that update records automatically based on prospect behavior and trigger next actions without human intervention.\n\nTurn your CRM into an active sales assistant.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#CRM #SalesAutomation #RevOps`
    ];

    const promotionalPosts = [
        `Why are standard digital agencies failing high-growth brands in 2026?\n\nBecause modern B2B growth demands a unified combination of speed, deep software automation, and creative performance marketing.\n\nAt EyE PunE, we don't build standard company websites. We engineer high-speed digital assets with sub-2-second loading guarantees and custom AI sales integrations.\n\nDiscover the hidden bottlenecks in your digital acquisition funnel.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#DigitalTransformation #SoftwareEngineering #SalesGrowth`,
        
        `How do you double your sales pipeline without doubling your sales team?\n\nThe answer is structural integration. When you connect your marketing platforms directly to autonomous lead enrichment engines, your sales representatives only meet with qualified, pre-warmed B2B prospects.\n\nStop managing databases with static spreadsheets. Centralize your operations, automate follow-ups, and elevate conversion rates across every channel.\n\nGet a complete analysis of your acquisition channels today.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#SalesEfficiency #CentralizedCRM #BusinessScaling`,

        `You are losing clients to competitors with inferior products but superior systems.\n\nIn 2026, the company that removes the most friction from the buying process wins. EyE PunE specializes in tearing down digital roadblocks and building seamless, high-conversion customer journeys.\n\nFrom automated onboarding to AI-driven customer success, we build the infrastructure that makes buying from you effortless.\n\nStop losing to inferior competitors.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#CustomerJourney #ConversionRate #BusinessStrategy`,

        `Is your current tech stack holding your business hostage?\n\nPatching together 15 different SaaS tools with fragile Zapier connections is a recipe for operational disaster. \n\nEyE PunE engineers custom, centralized digital ecosystems. We replace bloated subscriptions with custom Next.js and Supabase architectures tailored exactly to your unique workflows.\n\nOwn your data. Own your infrastructure. Scale without limits.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#CustomSoftware #TechStack #EnterpriseSolutions`,

        `We don't sell websites. We build automated revenue engines.\n\nIf your website isn't actively capturing leads, qualifying them via AI, and booking them directly into your sales team's calendar, it's just a digital brochure.\n\nEyE PunE transforms passive websites into aggressive customer acquisition machines designed for the modern B2B landscape.\n\nTurn your web presence into your best salesperson.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#LeadGen #WebDesign #RevenueGrowth`,

        `Scaling your business requires you to fire yourself from the day-to-day.\n\nAs a founder, your time should be spent on high-leverage strategy, not manual data entry or repetitive client updates.\n\nOur AI automation specialists at EyE PunE build custom autonomous workflows that handle the heavy lifting of your operations, giving you your time back.\n\nWork on your business, not in it.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#FounderLife #BusinessAutomation #TimeManagement`,

        `Paid Ads are getting more expensive every day. Your strategy must evolve.\n\nRelying solely on Meta or Google Ads without a highly optimized backend funnel is financial suicide. \n\nEyE PunE combines elite media buying with AI-driven retargeting and frictionless landing pages to squeeze maximum ROI out of every dollar you spend.\n\nStop burning ad spend. Start investing in a comprehensive growth system.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#PerformanceMarketing #MediaBuying #ROAS`,

        `Your competitors are already implementing AI. Are you?\n\nThe AI divide is widening. Companies leveraging generative AI for content, sales outreach, and customer service are operating at a speed and cost that traditional businesses cannot match.\n\nEyE PunE is your dedicated AI integration partner. We audit your workflows and deploy custom AI agents that drive immediate, measurable ROI.\n\nDon't get left behind in the AI revolution.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#AIIntegration #FutureOfWork #TechInnovation`,

        `Elite B2B brands don't blend in. They establish unquestionable authority.\n\nWe build digital experiences that command respect. From custom typography and 3D web experiences to authoritative copywriting, EyE PunE ensures your brand is perceived as the premium option in your market.\n\nWhen your digital presence exudes excellence, price resistance disappears.\n\nCommand your market. Elevate your brand.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#BrandAuthority #B2BBranding #PremiumDesign`,

        `Ready to break past your revenue plateau?\n\nIncremental changes lead to incremental results. To 10x your growth, you need a fundamental upgrade to your digital infrastructure and marketing systems.\n\nEyE PunE partners with ambitious founders to engineer scalable, high-performance growth systems that remove bottlenecks and accelerate acquisition.\n\nTake the first step toward exponential scaling.\n\nRun a Free AI Assessment at eyepune.com/AI-Assessment\n\n#ExponentialGrowth #BusinessScaling #GrowthPartner`
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
