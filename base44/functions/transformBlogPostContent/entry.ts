import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Admin-only function
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { blogPostId } = await req.json();

        if (!blogPostId) {
            return Response.json({ error: 'blogPostId is required' }, { status: 400 });
        }

        // Fetch the blog post
        const blogPost = await base44.asServiceRole.entities.BlogPost.get(blogPostId);

        if (!blogPost) {
            return Response.json({ error: 'Blog post not found' }, { status: 404 });
        }

        // Use LLM to transform content into structured markdown
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are an expert content formatter. Transform the following blog post content into a well-structured markdown format. 

IMPORTANT FORMATTING RULES:
1. Use ## H2 headings to break content into clear sections
2. Use ### H3 for subsections when needed
3. Convert key points into bulleted lists using - syntax
4. Use numbered lists (1. 2. 3.) for steps or sequences
5. For important callouts or highlight boxes, wrap content in this pattern:
   :::highlight
   Important message or key insight here
   :::
6. Create markdown tables for any data with multiple columns
7. Use **bold** for emphasis on important terms
8. Ensure proper spacing between sections (blank lines)
9. Maintain professional tone throughout

Here is the blog post content to format:

Title: ${blogPost.title}
Excerpt: ${blogPost.excerpt || ''}
Content:
${blogPost.content}

Return ONLY the formatted markdown content WITHOUT any code block wrapping (no \`\`\`). Just the raw markdown text.`,
            add_context_from_internet: false
        });

        // Clean up any markdown code block wrappers if present
        const transformedContent = typeof result === 'string' 
            ? result.replace(/^```markdown?\n?/, '').replace(/\n?```$/, '').trim()
            : result;

        // Update the blog post with formatted content
        await base44.asServiceRole.entities.BlogPost.update(blogPostId, {
            content: transformedContent
        });

        return Response.json({
            success: true,
            message: 'Blog post content transformed successfully',
            blogPostId: blogPostId
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});