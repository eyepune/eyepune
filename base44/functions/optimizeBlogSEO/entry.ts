import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { post_id } = await req.json();

        if (post_id) {
            // Optimize a single post
            const post = await base44.asServiceRole.entities.BlogPost.filter({ id: post_id });
            if (!post || post.length === 0) {
                return Response.json({ error: 'Post not found' }, { status: 404 });
            }

            const optimizedPost = await optimizeSinglePost(base44, post[0]);
            return Response.json({
                success: true,
                message: 'Blog post SEO optimized',
                post: optimizedPost
            });
        } else {
            // Optimize all posts without proper SEO
            const allPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
            const postsNeedingSEO = allPosts.filter(post => 
                !post.meta_title || !post.meta_description || !post.slug
            );

            if (postsNeedingSEO.length === 0) {
                return Response.json({
                    success: true,
                    message: 'All blog posts already have SEO optimization',
                    updated_count: 0
                });
            }

            const results = [];
            let successCount = 0;

            for (const post of postsNeedingSEO) {
                try {
                    const optimized = await optimizeSinglePost(base44, post);
                    results.push({
                        post_id: post.id,
                        title: post.title,
                        success: true,
                        updates: optimized
                    });
                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    results.push({
                        post_id: post.id,
                        title: post.title,
                        success: false,
                        error: error.message
                    });
                }
            }

            return Response.json({
                success: true,
                message: `Optimized SEO for ${successCount} blog posts`,
                total_processed: postsNeedingSEO.length,
                success_count: successCount,
                results
            });
        }
    } catch (error) {
        console.error('Error optimizing blog SEO:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function optimizeSinglePost(base44, post) {
    const seoData = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze this blog post and generate SEO optimization data:

Title: ${post.title}
Category: ${post.category}
Content: ${post.content.substring(0, 1000)}...

Generate:
1. An SEO-optimized meta title (50-60 characters, includes primary keyword)
2. A compelling meta description (150-160 characters, includes call-to-action)
3. A list of 5-10 relevant keywords/phrases for this post
4. An SEO-friendly URL slug (lowercase, hyphens, no special characters)

Make it specific to the content and optimized for search engines.`,
        response_json_schema: {
            type: "object",
            properties: {
                meta_title: { type: "string" },
                meta_description: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                optimized_slug: { type: "string" }
            }
        }
    });

    const updateData = {};
    
    if (!post.meta_title) {
        updateData.meta_title = seoData.meta_title;
    }
    
    if (!post.meta_description) {
        updateData.meta_description = seoData.meta_description;
    }
    
    if (!post.slug || post.slug === '') {
        updateData.slug = seoData.optimized_slug;
    }
    
    if (!post.tags || post.tags.length === 0) {
        updateData.tags = seoData.keywords;
    }

    await base44.asServiceRole.entities.BlogPost.update(post.id, updateData);

    return {
        ...updateData,
        suggested_keywords: seoData.keywords
    };
}