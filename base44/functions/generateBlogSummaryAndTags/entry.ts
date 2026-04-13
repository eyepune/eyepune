import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { blogPostId } = await req.json();

        if (!blogPostId) {
            return Response.json({ error: 'blogPostId is required' }, { status: 400 });
        }

        const blogPost = await base44.asServiceRole.entities.BlogPost.get(blogPostId);

        if (!blogPost) {
            return Response.json({ error: 'Blog post not found' }, { status: 404 });
        }

        // Generate summary and tags using AI
        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are an expert content analyst. Analyze the following blog post and provide:
1. A concise 2-3 sentence summary capturing the main value proposition
2. 5-7 relevant tags for categorization

Blog Post Title: ${blogPost.title}
Blog Post Content: ${blogPost.content.substring(0, 3000)}

Respond in JSON format with ONLY these two fields:
{
  "summary": "Your 2-3 sentence summary here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
            response_json_schema: {
                type: 'object',
                properties: {
                    summary: { type: 'string' },
                    tags: { 
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                required: ['summary', 'tags']
            },
            add_context_from_internet: false
        });

        // Update the blog post with generated summary and tags
        await base44.asServiceRole.entities.BlogPost.update(blogPostId, {
            excerpt: aiResponse.summary,
            tags: aiResponse.tags
        });

        return Response.json({
            success: true,
            message: 'Summary and tags generated successfully',
            summary: aiResponse.summary,
            tags: aiResponse.tags
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});