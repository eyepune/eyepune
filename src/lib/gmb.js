export async function autoPostToGMB(post) {
    console.log('[GMB Syndication] Starting Google Business Profile auto-post for:', post.title);

    const GMB_ACCOUNT_ID = process.env.GMB_ACCOUNT_ID;
    const GMB_LOCATION_ID = process.env.GMB_LOCATION_ID;
    const GMB_ACCESS_TOKEN = process.env.GMB_ACCESS_TOKEN;

    if (!GMB_ACCOUNT_ID || !GMB_LOCATION_ID || !GMB_ACCESS_TOKEN) {
        console.warn('[GMB Syndication] Missing GMB credentials. Skipping GMB post.');
        return false;
    }

    try {
        const canonicalUrl = `https://www.eyepune.com/blog/${post.slug}`;
        
        // GMB API endpoint for creating a local post
        const gmbApiUrl = `https://mybusiness.googleapis.com/v4/accounts/${GMB_ACCOUNT_ID}/locations/${GMB_LOCATION_ID}/localPosts`;

        // We construct a "Learn More" update post
        const gmbPayload = {
            languageCode: 'en-US',
            summary: `🚀 New Insight from EyE PunE: \n\n${post.title}\n\n${post.excerpt}`,
            callToAction: {
                actionType: 'LEARN_MORE',
                url: canonicalUrl
            },
            // If the post has a featured image, attach it
            media: post.featured_image ? [
                {
                    mediaFormat: 'PHOTO',
                    sourceUrl: post.featured_image
                }
            ] : []
        };

        const response = await fetch(gmbApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GMB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gmbPayload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`GMB API Error (${response.status}): ${errorData}`);
        }

        console.log('[GMB Syndication] Successfully published Update to Google Business Profile.');
        return true;
    } catch (e) {
        console.error('[GMB Syndication] Failed to post to Google Maps/Search:', e.message);
        return false;
    }
}
