import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Helper to interact with NVIDIA NIM LLM
async function generateNewChallenger(currentTitle, currentDescription, pageUrl) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are an elite SEO optimizer. 
We have a page (${pageUrl}) currently using the following metadata:
Title: "${currentTitle}"
Description: "${currentDescription}"

This variant has been performing well, but we want to A/B test a new 'challenger' variant to see if we can improve click-through rates.
Generate a new, highly optimized title (max 60 chars) and meta description (max 155 chars) that takes a slightly different angle (e.g. more urgent, more benefit-driven, or more mysterious) while maintaining core keywords.
    
Respond ONLY with a JSON object in this format:
{ "title": "new title here", "description": "new description here" }`;

    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return JSON.parse(data.choices[0].message.content);
        }
        return null;
    } catch (e) {
        console.error("LLM Generation failed", e);
        return null;
    }
}

export async function GET(request) {
    // 1. Verify cron secret to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !request.url.includes('manual=true')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: { getAll() { return []; }, setAll() { } }
    });

    try {
        // 2. Fetch all pages that have active experiments
        const { data: experiments, error } = await supabase
            .from('seo_experiments')
            .select('*');

        if (error || !experiments) throw error;

        // Group by page
        const pages = {};
        experiments.forEach(exp => {
            if (!pages[exp.page_url]) pages[exp.page_url] = [];
            pages[exp.page_url].push(exp);
        });

        let results = [];

        // 3. Evaluate each page
        for (const [url, variants] of Object.entries(pages)) {
            const champion = variants.find(v => v.variant_type === 'champion');
            const challengers = variants.filter(v => v.variant_type === 'challenger');

            if (!champion) continue;

            for (const challenger of challengers) {
                // If challenger has enough data and beats champion
                if (challenger.pageviews > 100 && challenger.pageviews > champion.pageviews) {
                    
                    // Challenger wins: It becomes the new champion
                    await supabase.from('seo_experiments').update({ variant_type: 'champion' }).eq('id', challenger.id);
                    
                    // Old champion is deleted or archived (we'll delete for simplicity)
                    await supabase.from('seo_experiments').delete().eq('id', champion.id);
                    
                    // Generate new challenger based on the new champion
                    const newVariant = await generateNewChallenger(challenger.title, challenger.description, url);
                    
                    if (newVariant) {
                        await supabase.from('seo_experiments').insert({
                            page_url: url,
                            variant_type: 'challenger',
                            title: newVariant.title,
                            description: newVariant.description,
                            pageviews: 0
                        });
                    }

                    results.push(`Updated ${url}: New champion crowned.`);
                } else if (champion.pageviews > 100 && champion.pageviews >= (challenger.pageviews * 1.5)) {
                    // Champion decisively wins: Delete the failing challenger and generate a new one
                    await supabase.from('seo_experiments').delete().eq('id', challenger.id);
                    
                    const newVariant = await generateNewChallenger(champion.title, champion.description, url);
                    if (newVariant) {
                        await supabase.from('seo_experiments').insert({
                            page_url: url,
                            variant_type: 'challenger',
                            title: newVariant.title,
                            description: newVariant.description,
                            pageviews: 0
                        });
                    }
                    results.push(`Updated ${url}: Challenger defeated, new challenger generated.`);
                }
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (error) {
        console.error('SEO Optimizer Error:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
