import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TOPICS = [
    "Latest trends in digital marketing for Indian businesses in 2026",
    "How AI automation is transforming small businesses in Pune",
    "Social media marketing strategies for Indian SMEs",
    "Why every Pune business needs a strong online presence",
    "WhatsApp marketing: How to convert leads for Indian businesses",
    "SEO tips for local businesses in Pune and Maharashtra",
    "How EyE PunE helps businesses grow with AI-powered CRM",
    "India's booming startup ecosystem: What businesses need to succeed",
    "Lead generation strategies that work for Indian businesses",
    "The rise of AI tools in Indian business operations",
    "Content marketing trends shaping Indian brands in 2026",
    "How to build a sales funnel that converts for Pune businesses",
    "Email marketing vs WhatsApp: Which works better in India?",
    "Branding strategies for Indian MSMEs to stand out",
    "Web development trends every Indian business should know",
    "Data-driven marketing: Using analytics to grow your business",
    "Customer retention strategies for Pune-based businesses",
    "How EyE PunE's growth bundle transforms businesses in 90 days",
    "Pune business news: Digital transformation driving local economy",
    "Video marketing for Indian businesses: Tips and best practices",
    "Building a strong brand identity for Indian startups",
    "AI chatbots and automation: The future of Indian customer service",
    "How Lex Pro is revolutionizing contract management in India",
    "Growth hacking strategies for Indian e-commerce businesses",
    "The importance of CRM systems for Indian sales teams",
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
            prompt: `Write a high-quality, engaging blog post for EyE PunE's website (a Pune-based digital growth agency offering sales, marketing, web development, AI automation, and CRM services).

Topic: "${topic}"

Requirements:
- Title: Catchy, SEO-friendly (include relevant keywords)
- Word count: 600-800 words
- Tone: Professional yet conversational, relatable for Indian business owners
- Structure: Intro, 3-4 subheadings with content, actionable tips, conclusion with a subtle CTA to contact EyE PunE
- Naturally mention EyE PunE 1-2 times where relevant
- Include relevant Indian business context, examples, or statistics where possible
- End with a call to action like "Ready to grow your business? Connect with EyE PunE today."
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
                prompt: post.image_prompt || `Professional digital marketing concept for Indian businesses, modern office setting, vibrant colors, high quality photography style`
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