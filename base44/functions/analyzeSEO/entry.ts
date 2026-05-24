import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { page_url, content, title } = await req.json();

        // Use AI to analyze SEO and suggest improvements
        const prompt = `You are an SEO expert. Analyze the following content and provide actionable SEO recommendations:

Title: ${title}
URL: ${page_url}
Content: ${content}

Provide a detailed SEO analysis including:
1. Optimal keywords (primary and secondary)
2. Meta description suggestion
3. Title tag optimization
4. Content structure recommendations
5. Internal linking opportunities
6. Keyword density analysis
7. Readability score
8. Mobile optimization tips
9. Page speed recommendations
10. Schema markup suggestions

Format your response as JSON with these keys:
{
    "seo_score": number (0-100),
    "primary_keywords": ["keyword1", "keyword2"],
    "secondary_keywords": ["keyword1", "keyword2"],
    "meta_description": "suggested meta description",
    "optimized_title": "suggested title",
    "recommendations": ["recommendation1", "recommendation2"],
    "content_structure": ["suggestion1", "suggestion2"],
    "internal_links": ["page1", "page2"],
    "technical_seo": ["tip1", "tip2"]
}`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    seo_score: { type: "number" },
                    primary_keywords: { type: "array", items: { type: "string" } },
                    secondary_keywords: { type: "array", items: { type: "string" } },
                    meta_description: { type: "string" },
                    optimized_title: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } },
                    content_structure: { type: "array", items: { type: "string" } },
                    internal_links: { type: "array", items: { type: "string" } },
                    technical_seo: { type: "array", items: { type: "string" } }
                }
            }
        });

        return Response.json({
            success: true,
            analysis: response
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});