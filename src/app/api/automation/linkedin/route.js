import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
    try {
        const { postId } = await request.json();

        // 1. Get Blog Post
        const { data: post, error: postError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (postError || !post) throw new Error('Post not found');

        // 2. Get LinkedIn Token from Database
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

        if (!token) throw new Error('LinkedIn integration not configured. Please link your account in the Marketing Dashboard.');

        // 3. Get LinkedIn User URN (if not provided in config)
        let authorUrn = urn;
        if (!authorUrn) {
            const meRes = await fetch('https://api.linkedin.com/v2/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const meData = await meRes.json();
            if (!meData.id) throw new Error('Invalid LinkedIn token or profile not accessible.');
            authorUrn = `urn:li:person:${meData.id}`;
        }

        // 4. Create the Post
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
                            text: `${post.title}\n\n${post.excerpt}\n\nRead more at: https://www.eyepune.com/blog/${post.slug}`
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

        if (!shareRes.ok) throw new Error(shareData.message || 'LinkedIn Share failed');

        return NextResponse.json({ success: true, linkedInPostId: shareData.id });
    } catch (error) {
        console.error('[LinkedIn-Post] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
