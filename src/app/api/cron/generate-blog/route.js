import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client (bypasses RLS for server-side insertion)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const runtime = 'edge';

// We require an Authorization header to prevent random people from triggering this
export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Define a list of high-value topics for the AI to choose from
        const topics = [
            "B2B Lead Generation Automation",
            "AI Chatbots for Customer Service",
            "How to scale an agency with AI",
            "High Converting Sales Funnel Strategies",
            "Programmatic SEO for Local Businesses",
            "The Future of AI in Digital Marketing",
            "Automating WhatsApp Outreach for Sales",
            "Maximizing ROI on Meta Ads in 2026"
        ];
        
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        // Generate the Blog Content via direct NVIDIA API to avoid self-fetch timeouts
        const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
        const LLM_API_KEY = process.env.LLM_API_KEY || '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';
        
        const llmResponse = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [{
                    role: 'user',
                    content: `You are an elite digital marketing and AI growth consultant writing for the EyE PunE agency blog. 
Write a highly engaging, SEO-optimized, comprehensive 800-word blog post about "${selectedTopic}". 
Format it strictly in Markdown. Do not include any generic intros or outros like "Here is the post". Just output the raw Markdown content starting with the Title as an H1. Include subheadings (H2, H3) and bullet points. End with a strong call to action to book a free AI assessment at eyepune.com.`
                }],
                temperature: 0.7,
                max_tokens: 3000
            })
        });

        if (!llmResponse.ok) {
            throw new Error(`LLM API failed: ${llmResponse.statusText}`);
        }

        const llmData = await llmResponse.json();
        const rawMarkdown = llmData.choices?.[0]?.message?.content || '';

        // Extract title from first H1
        const titleMatch = rawMarkdown.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : selectedTopic;
        
        // Clean markdown by removing the H1 since we store title separately
        let content = rawMarkdown.replace(/^#\s+(.+)$/m, '').trim();

        // Generate a URL-friendly slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        // Insert into Supabase
        const { data, error } = await supabase.from('blog_posts').insert([
            {
                title,
                slug,
                content,
                author: 'EyE PunE AI',
                status: 'published',
                seo_title: `${title} | EyE PunE Blog`,
                seo_description: `Learn about ${selectedTopic.toLowerCase()} with insights from EyE PunE's AI experts.`,
                tags: ['AI', 'Growth', 'Automation'],
                published_at: new Date().toISOString()
            }
        ]);

        if (error) {
            // If slug already exists, supabase might throw a unique constraint error
            throw new Error(`Supabase insert failed: ${error.message}`);
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Blog post generated and published successfully',
            post: { title, slug }
        });

    } catch (err) {
        console.error('[Cron Generate Blog] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
