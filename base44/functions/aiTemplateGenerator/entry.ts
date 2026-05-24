import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { action, template_type, document_type, custom_requirements, existing_template } = await req.json();

        if (action === 'generate') {
            const prompt = `Generate a professional ${document_type} template with the following specifications:

Document Type: ${document_type}
Template Type: ${template_type}
Custom Requirements: ${custom_requirements || 'Standard professional template'}

Please provide:
1. A comprehensive scope of work section
2. Detailed deliverables list
3. Payment terms appropriate for this type
4. Complete terms and conditions
5. Any specific clauses relevant to ${template_type}

Format the response as JSON with these fields:
{
    "default_scope": "detailed scope text",
    "default_deliverables": "line-separated deliverables",
    "default_payment_terms": "payment terms text",
    "default_terms": "complete terms and conditions",
    "recommended_clauses": ["clause1", "clause2"]
}`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        default_scope: { type: "string" },
                        default_deliverables: { type: "string" },
                        default_payment_terms: { type: "string" },
                        default_terms: { type: "string" },
                        recommended_clauses: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            return Response.json({
                success: true,
                template_data: response
            });

        } else if (action === 'modify') {
            const prompt = `Modify the following ${document_type} template based on these requirements:

Current Template: ${JSON.stringify(existing_template, null, 2)}

Modification Requirements: ${custom_requirements}

Please provide the modified template maintaining the same JSON structure with improved content based on the requirements.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        default_scope: { type: "string" },
                        default_deliverables: { type: "string" },
                        default_payment_terms: { type: "string" },
                        default_terms: { type: "string" },
                        recommended_clauses: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            return Response.json({
                success: true,
                template_data: response
            });

        } else if (action === 'suggest_improvements') {
            const prompt = `Analyze this ${document_type} template and suggest improvements:

${JSON.stringify(existing_template, null, 2)}

Provide specific suggestions for:
1. Legal completeness
2. Clarity and readability
3. Missing clauses or sections
4. Industry best practices

Return as JSON with suggestions array.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    suggestion: { type: "string" },
                                    priority: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            return Response.json({
                success: true,
                suggestions: response.suggestions
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in AI template generator:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});