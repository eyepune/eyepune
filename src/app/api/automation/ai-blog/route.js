import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const MODAL_IMAGE_URL = process.env.MODAL_LLM_URL || 'https://api.us-west-2.modal.direct/v1/images/generations';
const MODAL_API_KEY = process.env.MODAL_LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * AI BLOG AUTOMATION
 * 
 * Generates and publishes two blog posts daily:
 * 1. Targeted at the Indian Market
 * 2. Targeted at the Global Market
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

        // Pass 1: Indian Audience
        results.push(await generateAndPostBlog('indian'));

        // Pass 2: Global Audience
        results.push(await generateAndPostBlog('global'));

        return NextResponse.json({
            success: true,
            posts: results
        });
    } catch (error) {
        console.error('[AI-Blog] Critical automation failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function generateAndPostBlog(audience) {
    const topicPrompt = audience === 'indian' 
        ? "digital marketing trends in India, AI for Indian SMBs, scaling business in Mumbai/Pune/Bangalore, or India's 2026 tech landscape."
        : "global SaaS marketing, international branding for tech startups, AI automation for US/EU enterprises, or cross-border business growth strategies.";

    const prompt = `
        You are an expert content strategist for 'EyE PunE', a premium digital agency. 
        Write a high-converting, insightful blog post for a ${audience} audience.
        Topic area: ${topicPrompt}
        
        Requirements:
        1. Tone: Professional, authoritative, yet visionary.
        2. Format: Return ONLY a valid JSON object with:
           {
             "title": "Compelling Title",
             "excerpt": "Hooking 2-sentence summary",
             "content": "Full HTML content with <h2> and <p> tags. Must be 800+ words.",
             "category": "ai_automation",
             "tags": ["AI", "Growth", "${audience === 'indian' ? 'India' : 'Global'}"],
             "meta_title": "SEO Optimized Title",
             "meta_description": "SEO Description"
           }
        3. Do not include markdown or backticks in the response, just the raw JSON.
    `;

    // 1. Generate Content
    const llmResponse = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LLM_API_KEY}` },
        body: JSON.stringify({
            model: 'qwen/qwen3.5-122b-a10b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8
        })
    });

    const llmData = await llmResponse.json();
    let postData;
    try {
        const rawContent = llmData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        postData = JSON.parse(rawContent);
    } catch (e) {
        throw new Error(`Failed to parse AI content: ${e.message}`);
    }

    // 2. Generate Image
    const imageResponse = await fetch(MODAL_IMAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MODAL_API_KEY}` },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Hyper-realistic, futuristic digital art for a blog header. Theme: ${postData.title}. Aesthetic: Sleek, high-tech, dark mode with red neon accents (EyE PunE brand colors).`,
            n: 1, size: '1024x1024'
        })
    });
    const imageData = await imageResponse.json();
    const imageUrl = imageData.data?.[0]?.url || '';

    // 3. Save to Database
    const slug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    const { data: newPost, error } = await supabase
        .from('blog_posts')
        .insert({
            ...postData,
            slug,
            featured_image: imageUrl,
            status: 'published',
            author_name: 'EyE PunE AI',
            author_email: 'ai@eyepune.com',
            published_date: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;

    return { id: newPost.id, title: newPost.title, audience };
}
