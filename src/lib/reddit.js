/**
 * Rewrites a corporate blog post into a high-converting, native-feeling Reddit post.
 */
async function generateRedditVersion(blogContent, websiteUrl) {
    try {
        const prompt = `
        You are a highly successful tech founder posting on Reddit (r/SaaS or r/Entrepreneur).
        Take the following formal blog post and rewrite it as an engaging, authentic, value-driven Reddit post.
        
        RULES FOR REDDIT:
        1. NO corporate jargon or marketing speak. Sound like a real human sharing a hard-learned lesson.
        2. Start with a hook (e.g., "I spent X months doing Y, here is what I learned...").
        3. Break up large walls of text. Use bullet points.
        4. Provide massive upfront value. Do not hold back the "secret sauce".
        5. At the very end, include a natural, low-pressure link to the website: ${websiteUrl}
        
        BLOG POST TO REWRITE:
        ${blogContent}
        `;

        const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'moonshotai/kimi-k2.6',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.8
            })
        });

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("[Reddit] Error generating Reddit content:", error);
        return null;
    }
}

/**
 * Posts content to a specific Subreddit using the Reddit API.
 */
export async function postToReddit(blogContent) {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    const subreddit = process.env.REDDIT_SUBREDDIT || 'Entrepreneur'; // Default fallback

    if (!clientId || !clientSecret || !username || !password) {
        console.error("[Reddit] Missing Reddit API credentials in environment variables.");
        return { success: false, error: 'Missing Reddit credentials' };
    }

    try {
        console.log(`[Reddit] Rewriting blog post for Reddit audience...`);
        const targetUrl = 'https://eyepune.com'; // Replace with actual domain
        const redditContent = await generateRedditVersion(blogContent, targetUrl);

        if (!redditContent) throw new Error("Failed to generate Reddit content");

        console.log(`[Reddit] Authenticating with Reddit API...`);
        
        // 1. Get Access Token
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'EyE-PunE-Auto-Poster/1.0.0'
            },
            body: new URLSearchParams({
                grant_type: 'password',
                username: username,
                password: password
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error(`Authentication failed: ${JSON.stringify(tokenData)}`);
        }

        const accessToken = tokenData.access_token;

        // Extract a catchy title from the generated content (first line)
        const lines = redditContent.split('\n').filter(l => l.trim().length > 0);
        let title = lines[0].replace(/[*#]/g, '').trim(); // Remove markdown
        if (title.length > 300) title = title.substring(0, 297) + '...'; // Reddit title limit

        // The body is everything after the title
        const text = lines.slice(1).join('\n').trim();

        console.log(`[Reddit] Submitting post to r/${subreddit}...`);

        // 2. Submit Post
        const submitResponse = await fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'EyE-PunE-Auto-Poster/1.0.0'
            },
            body: new URLSearchParams({
                sr: subreddit,
                kind: 'self', // 'self' means text post
                title: title,
                text: text,
                resubmit: true
            })
        });

        const submitData = await submitResponse.json();

        if (!submitData.success) {
            throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
        }

        const postUrl = submitData.jquery[10][3][0];
        console.log(`[Reddit] ✅ Successfully posted to Reddit! URL: ${postUrl}`);

        return { success: true, url: postUrl };

    } catch (error) {
        console.error("[Reddit] Critical Error:", error.message);
        return { success: false, error: error.message };
    }
}
