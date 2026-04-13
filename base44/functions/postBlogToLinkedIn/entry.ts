import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { event, data, old_data } = body;

        // Only post to LinkedIn when a blog is published
        if (!data || data.status !== 'published') {
            return Response.json({ success: true, message: 'Post not published, skipping LinkedIn share' });
        }

        // Skip if it was already published before (update case where it was already published)
        if (event.type === 'update' && old_data?.status === 'published') {
            return Response.json({ success: true, message: 'Already shared, skipping' });
        }

        const post = data;

        // Get LinkedIn access token and organization ID
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
        const organizationId = Deno.env.get('LINKEDIN_ORGANIZATION_ID');

        if (!organizationId) {
            throw new Error('LINKEDIN_ORGANIZATION_ID not set');
        }

        const authorUrn = `urn:li:organization:${organizationId}`;

        // Prepare post content
        const siteUrl = Deno.env.get('SITE_URL') || 'https://www.eyepune.com';
        const postUrl = `${siteUrl}/Blog_Post?slug=${post.slug || post.id}`;
        const postText = `${post.title}\n\n${post.excerpt || post.content.substring(0, 200)}...\n\nRead more: ${postUrl}`;

        // Create LinkedIn organization post
        const linkedInPost = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: postText
                    },
                    shareMediaCategory: post.featured_image ? 'IMAGE' : 'NONE',
                    ...(post.featured_image && {
                        media: [{
                            status: 'READY',
                            description: {
                                text: post.excerpt || post.title
                            },
                            originalUrl: post.featured_image,
                            title: {
                                text: post.title
                            }
                        }]
                    })
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(linkedInPost)
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error('LinkedIn API Error:', errorText);
            console.error('Request Body:', JSON.stringify(linkedInPost, null, 2));
            throw new Error(`LinkedIn API returned ${postResponse.status}: ${errorText}`);
        }

        const result = await postResponse.json();

        return Response.json({
            success: true,
            message: 'Blog post shared to LinkedIn',
            linkedin_post_id: result.id,
            post_url: postUrl
        });

    } catch (error) {
        console.error('Error posting to LinkedIn:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            details: 'Check function logs for more details'
        }, { status: 500 });
    }
});