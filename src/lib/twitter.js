import { supabaseAdmin } from './supabase-admin.js';

export async function generateAndPostTwitterThread(post) {
    console.log('[Twitter] Starting thread generation for:', post.title);

    // Fetch database configuration
    let dbTwitter = null;
    try {
        const { data } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'twitter_config')
            .single();
        if (data && data.value) {
            dbTwitter = data.value;
        }
    } catch (e) {
        console.warn('[Twitter] Could not fetch DB config for Twitter, falling back to ENV.');
    }

    const API_KEY = dbTwitter?.apiKey || process.env.TWITTER_API_KEY;
    const API_SECRET = dbTwitter?.apiSecret || process.env.TWITTER_API_SECRET;
    const ACCESS_TOKEN = dbTwitter?.accessToken || process.env.TWITTER_ACCESS_TOKEN;
    const ACCESS_SECRET = dbTwitter?.accessSecret || process.env.TWITTER_ACCESS_SECRET;
    
    if (!API_KEY || !ACCESS_TOKEN) {
        console.warn('[Twitter] Missing Twitter API keys in DB and ENV. Skipping Twitter thread.');
        return false;
    }

    // 1. Ask the AI to condense the blog into a 5-part Twitter thread
    const prompt = `
You are a viral X (Twitter) ghostwriter for a B2B tech/marketing agency.
Convert the following blog post into an engaging, high-value 5-part Twitter thread.

Blog Title: ${post.title}
Blog Excerpt: ${post.excerpt}
Blog Content: ${post.content}

Rules:
1. Return EXACTLY a JSON array of 5 strings (the 5 tweets).
2. Tweet 1: Hook the reader (C-suite/Founders).
3. Tweet 2, 3, 4: High-value insights, data points, or bold claims.
4. Tweet 5: Call to action, linking to the full article: https://www.eyepune.com/blog/${post.slug}
5. Each tweet must be under 280 characters.
6. Return ONLY the JSON array (e.g., ["tweet 1", "tweet 2", "tweet 3", "tweet 4", "tweet 5"]). Do not include markdown blocks.
`;

    let thread = [];
    try {
        const llmResponse = await fetch(process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const llmData = await llmResponse.json();
        const rawContent = llmData.choices?.[0]?.message?.content || "[]";
        
        // Parse the JSON array
        const cleanJson = rawContent.replace(/```(?:json)?\s*([\s\S]*?)```/i, '$1').trim();
        thread = JSON.parse(cleanJson);

        if (!Array.isArray(thread) || thread.length === 0) {
            throw new Error("AI did not return a valid thread array.");
        }
    } catch (e) {
        console.warn('[Twitter] AI Thread Generation failed:', e.message);
        return false;
    }

    console.log('[Twitter] Successfully generated thread. Attempting to post...');

    // 2. Post the thread using twitter-api-v2
    try {
        // Dynamically import the twitter client to prevent crashes if it's not installed yet
        const { TwitterApi } = await import('twitter-api-v2');
        
        const client = new TwitterApi({
            appKey: API_KEY,
            appSecret: API_SECRET,
            accessToken: ACCESS_TOKEN,
            accessSecret: ACCESS_SECRET,
        });

        // The v2 API allows posting threads easily
        const rwClient = client.readWrite;
        
        // Post the thread
        const tweetedThread = await rwClient.v2.tweetThread(thread);
        console.log(`[Twitter] Thread successfully posted! First Tweet ID: ${tweetedThread[0].data.id}`);
        return true;
    } catch (e) {
        console.error('[Twitter] Failed to post thread to Twitter API:', e.message);
        return false;
    }
}
