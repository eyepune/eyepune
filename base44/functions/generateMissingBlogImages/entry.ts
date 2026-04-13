import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all blog posts without featured images
        const allPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
        const postsWithoutImages = allPosts.filter(post => !post.featured_image);

        if (postsWithoutImages.length === 0) {
            return Response.json({
                success: true,
                message: 'All blog posts already have images',
                updated_count: 0
            });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const post of postsWithoutImages) {
            try {
                // Generate image based on post title and category
                const imagePrompt = `Professional blog header image for article about: ${post.title}. Category: ${post.category}. Modern, clean, business-focused design with relevant imagery.`;
                
                const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                    prompt: imagePrompt
                });

                // Update the post with the generated image
                await base44.asServiceRole.entities.BlogPost.update(post.id, {
                    featured_image: imageResult.url
                });

                results.push({
                    post_id: post.id,
                    title: post.title,
                    success: true,
                    image_url: imageResult.url
                });
                successCount++;

                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Error generating image for post ${post.id}:`, error);
                results.push({
                    post_id: post.id,
                    title: post.title,
                    success: false,
                    error: error.message
                });
                errorCount++;
            }
        }

        return Response.json({
            success: true,
            message: `Generated images for ${successCount} blog posts`,
            total_processed: postsWithoutImages.length,
            success_count: successCount,
            error_count: errorCount,
            results
        });

    } catch (error) {
        console.error('Error in bulk image generation:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});