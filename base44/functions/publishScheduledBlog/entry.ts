import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const today = new Date().toISOString();

        // Find scheduled posts that are ready to publish
        const scheduledPosts = await base44.entities.BlogPost.filter({
            status: 'scheduled',
            scheduled_date: { $lte: today }
        }, '-scheduled_date', 1);

        if (scheduledPosts.length > 0) {
            const post = scheduledPosts[0];
            
            // Generate featured image if missing
            let featuredImage = post.featured_image;
            if (!featuredImage) {
                try {
                    const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                        prompt: `Professional blog header image for article about: ${post.title}. Modern, clean, business-focused design.`
                    });
                    featuredImage = imageResult.url;
                } catch (error) {
                    console.error('Failed to generate image:', error);
                }
            }
            
            // Publish the post
            await base44.asServiceRole.entities.BlogPost.update(post.id, {
                status: 'published',
                published_date: today,
                ...(featuredImage && { featured_image: featuredImage })
            });

            return Response.json({
                success: true,
                message: 'Blog post published',
                post_id: post.id,
                title: post.title
            });
        }

        // If no scheduled posts, try to publish the oldest draft
        const draftPosts = await base44.entities.BlogPost.filter({
            status: 'draft'
        }, 'created_date', 1);

        if (draftPosts.length > 0) {
            const post = draftPosts[0];
            
            // Generate featured image if missing
            let featuredImage = post.featured_image;
            if (!featuredImage) {
                try {
                    const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                        prompt: `Professional blog header image for article about: ${post.title}. Modern, clean, business-focused design.`
                    });
                    featuredImage = imageResult.url;
                } catch (error) {
                    console.error('Failed to generate image:', error);
                }
            }
            
            await base44.asServiceRole.entities.BlogPost.update(post.id, {
                status: 'published',
                published_date: today,
                ...(featuredImage && { featured_image: featuredImage })
            });

            return Response.json({
                success: true,
                message: 'Draft blog post published',
                post_id: post.id,
                title: post.title
            });
        }

        return Response.json({
            success: false,
            message: 'No blog posts available to publish'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});