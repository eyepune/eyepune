import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TOPICS = [
    "Latest trends in digital marketing for global enterprises in 2026",
    "How multi-model AI automation is transforming B2B lead generation",
    "Scaling B2B sales funnels: The ultimate guide for tech startups",
    "Why high-converting sub-2-second websites matter for global brands",
    "WhatsApp CRM automation: How to close international leads instantly",
    "Top technical SEO strategies for dominating global search results",
    "How EyE PunE helps global visionaries scale with NVIDIA-accelerated AI",
    "The future of AI agents in B2B customer retention",
    "Lead generation strategies that guarantee 5X ROI",
    "The rise of Anthropic and OpenAI tools in enterprise workflows",
    "Content marketing frameworks for high-ticket service businesses",
    "How to build an automated sales engine that converts while you sleep",
    "Cold Outreach vs Inbound Funnels: The ultimate B2B strategy",
    "Brand positioning strategies for startups to look like industry titans",
    "Headless CMS and Next.js: The future of enterprise web development",
    "Predictive analytics: Using AI to accurately forecast your sales",
    "Customer retention automation for global SaaS companies",
    "How EyE PunE's Growth Core transforms digital infrastructure in 90 days",
    "The undeniable ROI of professional UI/UX in software applications",
    "Video marketing algorithms: How to capture C-suite attention",
    "Building an undeniable brand identity in a saturated global market",
    "Custom AI chatbots: Replacing generic customer service with intelligence",
    "How to optimize your ad spend for maximum Return on Ad Spend (ROAS)",
    "Growth hacking architectures for rapid e-commerce scaling",
    "Integrating OpenAI into your existing CRM system for seamless workflows",
];

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function pickTopic() {
    const day = new Date().getDay() + new Date().getDate();
    return TOPICS[day % TOPICS.length];
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // For scheduled automations, use service role
        const topic = pickTopic();
        const today = new Date().toISOString().split('T')[0];

        // Generate blog post using AI
        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Write a high-quality, engaging, and highly technical blog post for EyE PunE's website (an elite global AI growth partner and digital agency offering multi-model AI automation, enterprise web development, and performance marketing).

Topic: "${topic}"

Requirements:
- Title: Catchy, highly professional, SEO-friendly (include relevant global B2B keywords)
- Word count: 800-1200 words
- Tone: Elite, authoritative, insightful, and targeted toward Founders, C-Suite, and startup visionaries.
- Structure: Intro, 3-4 subheadings with deep content, actionable high-level strategies, conclusion with a subtle CTA to contact EyE PunE for a free AI Assessment.
- Naturally mention EyE PunE 1-2 times as a global authority in AI and web architecture.
- Include relevant global business context, tech industry examples (e.g. OpenAI, Vercel, NVIDIA), or high-level statistics where possible.
- End with a call to action like "Ready to scale your global infrastructure? Run a free AI Assessment with EyE PunE today."
- Insert the placeholder text [AD_SLOT_1] after the first subheading section
- Insert the placeholder text [AD_SLOT_2] before the conclusion

Return JSON with these fields:
- title: Blog post title
- slug: URL-friendly slug (lowercase, hyphens)
- excerpt: 2-sentence summary (for SEO meta description)
- content: Full blog post in markdown format (with [AD_SLOT_1] and [AD_SLOT_2] placeholders)
- meta_title: SEO meta title (max 60 chars)
- meta_description: SEO meta description (max 160 chars)
- category: one of [social_media, web_development, ai_automation, branding, business_growth, case_studies]
- tags: array of 4-5 relevant tags
- image_prompt: A detailed prompt for generating a relevant featured image for this post (describe scene, style, colors — no text/logos in image)`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    excerpt: { type: "string" },
                    content: { type: "string" },
                    meta_title: { type: "string" },
                    meta_description: { type: "string" },
                    category: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    image_prompt: { type: "string" }
                }
            }
        });

        const post = aiResult;

        // Generate featured image using AI
        let featuredImageUrl = '';
        try {
            const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: post.image_prompt || `Premium minimal corporate workspace, high-end technology, AI automation concept, glowing blue and crimson accents, highly cinematic and elite aesthetic, 8k resolution, photorealistic`
            });
            featuredImageUrl = imgResult.url || '';
        } catch (imgErr) {
            console.log('Image generation failed (non-critical):', imgErr.message);
        }

        // Google Ads script block to inject into content
        const googleAdBlock = `\n\n<div class="google-ad-slot" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="auto" style="display:block;text-align:center;margin:24px 0;">\n<!-- Google AdSense Responsive Ad -->\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>\n</div>\n\n`;

        // Replace ad slot placeholders with actual ad blocks
        const contentWithAds = (post.content || '')
            .replace('[AD_SLOT_1]', googleAdBlock)
            .replace('[AD_SLOT_2]', googleAdBlock);

        // Create the blog post as published
        const newPost = await base44.asServiceRole.entities.BlogPost.create({
            title: post.title,
            slug: post.slug || slugify(post.title) + '-' + today,
            excerpt: post.excerpt,
            content: contentWithAds,
            featured_image: featuredImageUrl,
            meta_title: post.meta_title || post.title.substring(0, 60),
            meta_description: post.meta_description || post.excerpt,
            category: post.category || 'business_growth',
            tags: post.tags || [],
            status: 'published',
            published_date: new Date().toISOString(),
            author_name: 'EyE PunE Team',
            author_email: 'connect@eyepune.com',
            allow_comments: true,
        });

        // Notify admin via email
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: 'connect@eyepune.com',
                subject: `📝 New Blog Published: ${post.title}`,
                body: `
<h2>Daily Blog Auto-Published ✅</h2>
<p><strong>Title:</strong> ${post.title}</p>
<p><strong>Category:</strong> ${post.category}</p>
<p><strong>Excerpt:</strong> ${post.excerpt}</p>
<p><strong>Published at:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
${featuredImageUrl ? `<p><strong>Featured Image:</strong> <a href="${featuredImageUrl}">View Image</a></p>` : ''}
<p><strong>Ads:</strong> 2 Google AdSense slots embedded in post</p>
<br/>
<p>The blog post has been automatically published on the EyE PunE website with a featured image and Google Ads.</p>
<p>Log in to the admin panel to review or edit the post.</p>
                `
            });
        } catch (emailErr) {
            console.log('Email notification failed (non-critical):', emailErr.message);
        }

        return Response.json({
            success: true,
            post_id: newPost.id,
            title: post.title,
            slug: post.slug,
            message: 'Blog post published successfully'
        });

    } catch (error) {
        console.error('Daily blog generator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});