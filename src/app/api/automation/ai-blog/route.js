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

        // Pass 1: Global Enterprise Audience
        results.push(await generateAndPostBlog('global'));

        // Log Success
        await supabase.from('automation_logs').insert([{
            type: 'blog',
            status: 'success',
            message: `Generated and published 1 global blog post.`,
            payload: { results }
        }]);

        return NextResponse.json({
            success: true,
            posts: results
        });
    } catch (error) {
        console.error('[AI-Blog] Critical automation failure:', error);
        
        // Log Failure
        try {
            await supabase.from('automation_logs').insert([{
                type: 'blog',
                status: 'failure',
                message: error.message
            }]);
        } catch (e) {}

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
             "tags": ["AI", "Enterprise", "Global Scale", "Growth"],
             "meta_title": "SEO Optimized Title",
             "meta_description": "SEO Description"
           }
        3. Do not include markdown or backticks in the response, just the raw JSON.
    `;

    // 1. Generate Content
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
            max_tokens: 16384,
            temperature: 0.8,
            top_p: 1.0,
            stream: false,
            chat_template_kwargs: { thinking: true }
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

    // 2. Generate Image (Using Pollinations AI - No API Key Required!)
    const imagePrompt = `Hyper-realistic futuristic digital art for a blog header. Theme: ${postData.title}. Aesthetic: Sleek high-tech dark mode with red neon accents`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`;


    // 3. Save to Database
    const slug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    const { data: newPost, error } = await supabase
        .from('blog_posts')
        .insert({
            ...postData,
            slug,
            featured_image: imageUrl,
            status: 'published',
            published_date: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;

    // 4. Auto-Post to LinkedIn (Social Distribution)
    try {
        console.log(`[AI-Blog] Triggering LinkedIn post for: ${newPost.title}`);
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/automation/linkedin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: newPost.id })
        });
    } catch (linkedInError) {
        console.warn('[AI-Blog] LinkedIn auto-post failed (skipping):', linkedInError.message);
    }

    return { id: newPost.id, title: newPost.title, audience };
}
