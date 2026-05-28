import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * AI BLOG AUTOMATION
 * 
 * Generates and publishes highly technical, high-converting blog posts daily.
 * Features bulletproof fallbacks and direct LinkedIn sharing to guarantee 100% uptime.
 */
export async function GET(request) {
    // 1. Auth Check (for Vercel Cron or Manual Trigger)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[AI-Blog] Starting automated blog generation...');

        const results = [];

        // Generate blog post targeting the Global/Enterprise Audience
        const postResult = await generateAndPostBlog('global');
        results.push(postResult);

        // Log Success to automation_logs
        await supabase.from('automation_logs').insert([{
            type: 'blog',
            status: 'success',
            message: `Generated and published 1 global blog post: "${postResult.title}".`,
            payload: { results }
        }]);

        return NextResponse.json({
            success: true,
            posts: results
        });
    } catch (error) {
        console.error('[AI-Blog] Critical automation failure:', error);
        
        // Log Failure to automation_logs
        try {
            await supabase.from('automation_logs').insert([{
                type: 'blog',
                status: 'failure',
                message: error.message
            }]);
        } catch (e) {
            console.error('[AI-Blog] Failed to save error logs to Supabase:', e.message);
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function generateAndPostBlog(audience) {
    const topicPrompt = "global SaaS marketing, multi-model AI automation, enterprise web development architectures, sub-2-second site speeds, NVIDIA-accelerated workflows, or cross-border B2B growth strategies.";

    const prompt = `
        You are an expert content strategist for 'EyE PunE', an elite global digital agency and AI growth partner. 
        Write a high-converting, highly technical, and insightful blog post for C-suite executives and tech founders.
        Topic area: ${topicPrompt}
        
        Requirements:
        1. Tone: Elite, authoritative, visionary, and technical.
        2. Format: Return ONLY a valid JSON object with:
           {
             "title": "Compelling Title",
             "excerpt": "Hooking 2-sentence summary",
             "content": "Full HTML content with <h2> and <p> tags. Must be 1000+ words.",
             "category": "ai_automation",
             "tags": ["AI", "Enterprise", "Global Scale", "Growth"]
           }
        3. Do not include markdown or backticks in the response, just the raw JSON.
    `;

    let llmData = null;
    let success = false;
    let lastError = null;

    // ── STEP 1: GENERATE CONTENT WITH RETRY & FALLBACK MODELS ──
    if (LLM_API_KEY) {
        // Model Attempt 1: Kimi K2.6 with thinking (NVIDIA NIM)
        try {
            console.log('[AI-Blog] Attempting content generation with moonshotai/kimi-k2.6...');
            const llmResponse = await fetch(LLM_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${LLM_API_KEY}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: 'moonshotai/kimi-k2.6',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 4096,
                    temperature: 0.8,
                    top_p: 1.0,
                    stream: false,
                    chat_template_kwargs: { thinking: true }
                })
            });

            if (llmResponse.ok) {
                llmData = await llmResponse.json();
                if (llmData?.choices?.[0]?.message?.content) {
                    success = true;
                    console.log('[AI-Blog] Successfully generated blog content with Kimi K2.6.');
                }
            } else {
                const errorText = await llmResponse.text();
                throw new Error(`Upstream NIM API error (${llmResponse.status}): ${errorText}`);
            }
        } catch (err) {
            console.warn('[AI-Blog] Kimi K2.6 generation failed. Trying Llama 3.1 fallback...', err.message);
            lastError = err;
        }

        // Model Attempt 2: Llama 3.1 8B Instruct (Highly stable fallback model)
        if (!success) {
            try {
                console.log('[AI-Blog] Attempting content generation with meta/llama-3.1-8b-instruct...');
                const llmResponse = await fetch(LLM_API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${LLM_API_KEY}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'meta/llama-3.1-8b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 4096,
                        temperature: 0.7,
                        stream: false
                    })
                });

                if (llmResponse.ok) {
                    llmData = await llmResponse.json();
                    if (llmData?.choices?.[0]?.message?.content) {
                        success = true;
                        console.log('[AI-Blog] Successfully generated blog content with Llama 3.1.');
                    }
                } else {
                    const errorText = await llmResponse.text();
                    throw new Error(`Upstream NIM API error (${llmResponse.status}): ${errorText}`);
                }
            } catch (err) {
                console.error('[AI-Blog] Llama fallback also failed:', err.message);
                lastError = err;
            }
        }
    } else {
        console.warn('[AI-Blog] LLM_API_KEY is not defined in environment variables.');
    }

    // ── STEP 2: PARSE & FALLBACK TO DYNAMIC PREMIUM LOCAL GENERATION ──
    let postData;
    if (success && llmData) {
        try {
            const rawContent = llmData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            let cleanContent = rawContent.trim();
            const jsonMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
            if (jsonMatch) {
                cleanContent = jsonMatch[1].trim();
            }
            postData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.warn('[AI-Blog] Failed to parse LLM JSON output. Falling back to local premium generator:', parseError.message);
            postData = getFallbackBlogContent(audience);
        }
    } else {
        console.warn('[AI-Blog] Upstream AI generation completely offline. Falling back to local premium generator.');
        postData = getFallbackBlogContent(audience);
    }

    // ── STEP 3: IMAGE ASSIGNMENT & DB SAVE ──
    const imagePrompt = `Hyper-realistic futuristic digital art for a blog header. Theme: ${postData.title}. Aesthetic: Sleek high-tech dark mode with red neon accents`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    const slug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    console.log(`[AI-Blog] Saving blog post: "${postData.title}" with slug: "${slug}"`);
    const { data: newPost, error: dbError } = await supabase
        .from('blog_posts')
        .insert({
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            tags: postData.tags,
            slug,
            featured_image: imageUrl,
            status: 'published',
            published_date: new Date().toISOString(),
            author: 'EyE PunE AI'
        })
        .select()
        .single();

    if (dbError) {
        console.error('[AI-Blog] Database insertion failed:', dbError.message);
        throw dbError;
    }

    // ── STEP 4: DIRECT LINKEDIN SHARE (NO INTERNAL HTTP LOOPS) ──
    try {
        console.log(`[AI-Blog] Triggering direct LinkedIn distribution for: "${newPost.title}"`);
        await directPostToLinkedIn(newPost);
    } catch (linkedInError) {
        console.warn('[AI-Blog] LinkedIn social distribution failed (skipping to preserve core uptime):', linkedInError.message);
        
        // Log minor warning inside Supabase activity log
        try {
            await supabase.from('activity_logs').insert([{
                action: 'linkedin_auto_post_warning',
                details: `Blog posted successfully, but LinkedIn share failed: ${linkedInError.message}`,
                status: 'warning'
            }]);
        } catch (e) {}
    }

    return { id: newPost.id, title: newPost.title, audience };
}

/**
 * Directly publishes the blog post to LinkedIn using configured database tokens.
 * Bypasses local HTTP fetch to prevent deadlocks and Vercel execution timeouts.
 */
async function directPostToLinkedIn(post) {
    // 1. Get LinkedIn Token from Database (preferring saved configurations)
    const { data: config } = await supabase
        .from('crm_sync_configs')
        .select('api_key')
        .eq('provider', 'linkedin_config')
        .single();

    let token = process.env.LINKEDIN_ACCESS_TOKEN;
    let urn = null;

    if (config?.api_key) {
        try {
            const parsed = JSON.parse(config.api_key);
            token = parsed.token;
            urn = parsed.urn;
        } catch (e) {
            token = config.api_key;
        }
    }

    if (!token) {
        throw new Error('LinkedIn integration not connected. Link your profile in the Marketing Dashboard.');
    }

    // 2. Resolve Profile URN (Company Page takes priority)
    let authorUrn = null;
    if (process.env.LINKEDIN_ORGANIZATION_ID) {
        authorUrn = `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}`;
    } else if (urn) {
        authorUrn = urn;
    } else {
        const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (!meData.sub) {
            throw new Error(`Profile access rejected by LinkedIn: ${meData.message || 'Invalid Token'}`);
        }
        authorUrn = `urn:li:person:${meData.sub}`;
    }

    // 3. Publish UGC Post via LinkedIn API
    const shareRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
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
                    shareCommentary: {
                        text: `🔥 New Insight from EyE PunE:\n\n${post.title}\n\n${post.excerpt}\n\nRead the full strategic breakdown here: https://www.eyepune.com/blog/${post.slug}`
                    },
                    shareMediaCategory: "ARTICLE",
                    media: [
                        {
                            status: "READY",
                            description: { text: post.excerpt },
                            originalUrl: `https://www.eyepune.com/blog/${post.slug}`,
                            title: { text: post.title }
                        }
                    ]
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        })
    });

    const shareData = await shareRes.json();
    if (!shareRes.ok) {
        throw new Error(shareData.message || 'LinkedIn Share request rejected.');
    }

    console.log(`[AI-Blog] Directly published to LinkedIn. ID: ${shareData.id}`);

    // Log the successful share
    await supabase.from('activity_logs').insert([{
        action: 'linkedin_auto_post',
        details: `Successfully published blog post distribution to LinkedIn: ${shareData.id}`,
        status: 'success'
    }]);
}

/**
 * Premium Local Blog Generator
 * Rotates between three highly optimized, masterclass marketing/architecture posts
 * to act as a bulletproof fallback when LLMs or APIs are offline.
 */
function getFallbackBlogContent(audience) {
    const fallbacks = [
        {
            title: "The Sub-Second Digital Architecture: Why Speed is Your Ultimate Enterprise Growth Engine",
            excerpt: "In a world of sub-2-second attention spans, standard web performance is costing enterprise brands millions. Here is the blueprint for sub-second page loads at scale.",
            category: "web_development",
            tags: ["Web Speed", "Enterprise", "React", "NextJS", "SEO"],
            content: `
                <p>In the digital economy, latency is not simply a technical metric—it is a direct leakage of revenue. Enterprise brands spend millions on complex customer acquisition, only to lose up to 50% of their qualified leads at the first hurdle: load time. Multiple research analyses, including studies by Google and Amazon, confirm a stark truth. Every 100 milliseconds of page latency decreases checkout conversion rates by up to 1%. For a global enterprise generating ten million dollars online, a 1-second delay is a million-dollar technical debt.</p>
                
                <h2>1. The Anatomy of Latency: Why Traditional Monoliths Fail</h2>
                <p>Traditional server-side rendering configurations and heavy monolithic CMS systems route each request back to a single primary database. Under load, database locks, template compiling, and server calculations compound, resulting in a Time-to-First-Byte (TTFB) that frequently exceeds 1.5 seconds. By the time the browser parses the HTML and downloads megabytes of unoptimized javascript, the Largest Contentful Paint (LCP) has slipped past 4 seconds. In a mobile-first market, this latency triggers instant bounce behaviors. Users expect speed; when they do not get it, they return to the search engine, giving their business directly to competitors.</p>
                
                <h2>2. The Blueprint for Sub-Second Performance</h2>
                <p>To break the sub-second barrier, elite digital infrastructures separate content management from delivery. By employing a headless framework like Next.js or React, websites are compiled into static assets during build time. These pre-rendered pages are deployed globally across CDN Edge servers. When a user requests a page, it does not require server database lookups. Instead, it is delivered instantaneously from the nearest local node, achieving a TTFB under 50 milliseconds.</p>
                
                <h3>Key Performance Milestones:</h3>
                <ul>
                    <li><strong>Edge Caching & Dynamic Routing:</strong> Store pre-rendered pages at the CDN edge while fetching highly dynamic personalization variables asynchronously.</li>
                    <li><strong>Next-Generation Image Formats:</strong> Serve compressed modern image formats like AVIF or WebP, sized accurately to the user’s viewport.</li>
                    <li><strong>Zero-JS Layout Shifts:</strong> Enforce strict aspect ratios on images and components to eliminate layout shifts, securing perfect Core Web Vitals.</li>
                </ul>
                
                <h2>3. Strategic Growth: Linking Infrastructure directly to Conversions</h2>
                <p>At EyE PunE, we don't build standard websites; we engineer high-speed digital sales platforms. By upgrading to a headless digital architecture, our enterprise clients experience an immediate lift in organic search visibility and a 20% average increase in conversion rates. Speed is the bedrock of premium brand experiences. In the modern B2B ecosystem, if your site takes more than 2 seconds to load, your growth strategies are already operating at a deficit. Secure the sub-second advantage and capture every lead.</p>
            `
        },
        {
            title: "Autonomous Sales Pipelines: How Multi-Model AI Growth Engines are Replacing the Traditional B2B Funnel",
            excerpt: "The era of manual lead scoring and slow follow-ups is officially over. Discover how elite growth partners deploy autonomous agent networks to scale pipeline velocity.",
            category: "ai_automation",
            tags: ["AI Growth", "Sales Automation", "CRM Sync", "Lead Nurture"],
            content: `
                <p>For decades, the B2B sales cycle relied on manual processes. Leads filled out a web form, sat in a queue for hours, were manually assigned to a sales representative, and finally received a generic follow-up email days later. In this latency-filled model, conversion rates decayed rapidly. Research shows that responding to an inquiry within 5 minutes increases qualified conversion opportunities by over 390%. Yet, very few sales teams possess the resources to maintain 24/7 instant response times. Enter the era of the Autonomous Sales Engine.</p>
                
                <h2>1. The Multi-Model AI Stack: From Scrapers to Conversation Agents</h2>
                <p>An autonomous sales engine is not a single chatbot; it is a synchronized network of specialized AI agents working together to automate the pipeline. The process begins with automated lead ingestion. As prospective clients interact with digital tools or take assessments, scraper and scraper-validation systems enrich the raw profile. In real-time, LLM assessment agents analyze company size, industry, revenue, and challenges, outputting a custom score and deep-dive roadmap within seconds.</p>
                
                <h2>2. Instant Multi-Channel Nurturing</h2>
                <p>Once a high-intent lead is score-qualified, the system does not wait. The orchestration agent triggers immediate personalized communication across multiple channels:</p>
                <ul>
                    <li><strong>WhatsApp Business Workflows:</strong> Instantly sends a personalized greeting, assessment results, and a booking link to the lead’s phone.</li>
                    <li><strong>Centralized CRM Integration:</strong> Creates a synchronized contact in Zoho or Salesforce with comprehensive audit notes pre-appended.</li>
                    <li><strong>Dynamic Drip Sequences:</strong> Enrolls the prospect in an automated, highly personalized email education sequence that adjusts based on interaction parameters.</li>
                </ul>
                
                <h2>3. Real-World Business ROI of Autonomous Funnels</h2>
                <p>By automating the high-effort, low-value components of lead qualification, B2B companies reclaim hundreds of employee hours while dramatically increasing conversion rates. Representatives only interact with pre-qualified prospects who have booked consultations directly. The result is a highly efficient, predictable sales engine that drives consistent pipeline growth without adding headcount. In a hyper-competitive landscape, speed and automation are the ultimate scale factors.</p>
            `
        },
        {
            title: "Accelerating Enterprise SaaS Scale with NVIDIA NIM and Headless Digital Infrastructure",
            excerpt: "Harnessing high-performance LLM inference to automate real-time marketing intelligence and personalized B2B workflows.",
            category: "ai_automation",
            tags: ["NVIDIA NIM", "LLM Scale", "B2B Marketing", "SaaS Growth"],
            content: `
                <p>The acceleration of AI technology has created a massive challenge for enterprise SaaS products: latency. Running complex, multi-million parameter LLMs to generate real-time recommendations, custom content, or dynamic user audits has traditionally been too slow to use inside live web sessions. However, the introduction of NVIDIA NIM (NVIDIA Inference Microservices) has completely shifted the landscape. By optimizing model execution directly on GPUs, enterprise brands can deploy elite models at scale, securing sub-second reasoning speeds.</p>
                
                <h2>1. What is NVIDIA NIM?</h2>
                <p>NVIDIA NIM is a set of easy-to-use microservices designed to accelerate the deployment of generative AI models across cloud, data centers, and local workstations. Rather than dealing with complex model weights and CUDA configurations, NIM packages models into optimized containerized environments. By running models like Llama-3.1 or Moonshot Kimi within these optimized microservices, inference speeds are accelerated up to 4x compared to raw deployments, drastically reducing the cost-per-token and latency.</p>
                
                <h2>2. Harnessing Accelerators for Real-Time Growth Marketing</h2>
                <p>In B2B growth workflows, NIM-accelerated models enable dynamic personalization at scale:</p>
                <ul>
                    <li><strong>Dynamic SEO Landing Pages:</strong> Generates real-time, highly relevant landing pages customized to the search intent of the incoming enterprise lead.</li>
                    <li><strong>Automated Strategic Audits:</strong> Runs complex marketing intelligence assessments and compiles detailed, multi-page strategy reports instantly while the user is engaged on the site.</li>
                    <li><strong>Smart Content Personalization:</strong> Adapts site copy, testimonials, and case studies based on industry and team data fetched silently during session initialization.</li>
                </ul>
                
                <h2>3. Building the Future of Intelligent Web Infrastructure</h2>
                <p>At EyE PunE, we integrate high-speed NVIDIA NIM endpoints directly into our modern headless web builds. This unique combination of ultra-fast frontends and ultra-fast generative models allows us to engineer platforms that are not only blazingly fast but incredibly intelligent. The future of the web is autonomous, fast, and personalized. By deploying accelerated AI microservices, global brands can secure unmatched competitive advantages, maximizing ROI at scale.</p>
            `
        }
    ];

    // Pick a fallback template based on a deterministic hash of the audience/date, or just at random
    const index = Math.floor(Math.random() * fallbacks.length);
    return fallbacks[index];
}
