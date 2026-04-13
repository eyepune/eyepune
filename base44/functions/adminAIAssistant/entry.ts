import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { action, context } = await req.json();

        let prompt = '';
        let response_json_schema = null;

        switch (action) {
            case 'draft_inquiry_response':
                prompt = `You are a professional business consultant for EyE PunE (Connect - Engage - Grow), a company specializing in social media marketing, web/app development, AI automation, and branding services.

Client Inquiry:
Name: ${context.client_name}
Email: ${context.client_email}
Message: ${context.message}

Generate a warm, professional response that:
1. Thanks them for reaching out
2. Acknowledges their specific needs
3. Highlights how EyE PunE can help
4. Suggests next steps (consultation call, detailed proposal)
5. Include contact details: connect@eyepune.com, +91 9284712033

Keep it concise, friendly, and professional.`;
                break;

            case 'summarize_project':
                prompt = `Summarize this project progress report in a concise executive summary format.

Project: ${context.project_name}
Client: ${context.client_name}
Status: ${context.status}
Progress: ${context.progress_percentage}%
Start Date: ${context.start_date}
Expected Completion: ${context.expected_completion_date}

${context.milestones ? `Milestones:\n${context.milestones.map(m => `- ${m.title}: ${m.status}`).join('\n')}` : ''}

${context.tasks ? `Recent Tasks:\n${context.tasks.slice(0, 5).map(t => `- ${t.task_name}: ${t.status}`).join('\n')}` : ''}

Provide:
1. Overall Status Summary (2-3 sentences)
2. Key Achievements
3. Upcoming Milestones
4. Any Concerns or Blockers
5. Next Steps`;
                break;

            case 'suggest_template':
                prompt = `Based on the project details, suggest the most appropriate template type and provide guidance.

Project Details:
- Name: ${context.project_name}
- Type: ${context.project_type}
- Budget: ${context.budget || 'Not specified'}
- Description: ${context.description || 'Not provided'}
- Client: ${context.client_name}

Available project types:
- social_media: Social media marketing and management
- web_app: Website and application development
- ai_automation: AI tools and automation solutions
- branding: Brand identity and design
- full_service: Comprehensive business solutions

Provide structured recommendations with reasoning.`;
                
                response_json_schema = {
                    type: "object",
                    properties: {
                        recommended_template: {
                            type: "string",
                            description: "The recommended project type template"
                        },
                        reasoning: {
                            type: "string",
                            description: "Why this template is recommended"
                        },
                        proposal_highlights: {
                            type: "array",
                            items: { type: "string" },
                            description: "Key points to include in proposal"
                        },
                        suggested_services: {
                            type: "array",
                            items: { type: "string" },
                            description: "Specific services to offer"
                        },
                        estimated_timeline: {
                            type: "string",
                            description: "Suggested project timeline"
                        },
                        agreement_clauses: {
                            type: "array",
                            items: { type: "string" },
                            description: "Important clauses for the agreement"
                        }
                    }
                };
                break;

            case 'analyze_leads':
                prompt = `Analyze these leads and provide insights for prioritization and follow-up strategy.

Total Leads: ${context.leads.length}

Recent Leads:
${context.leads.slice(0, 10).map(l => `
- ${l.full_name} (${l.company || 'No company'})
  Source: ${l.source}
  Status: ${l.status}
  Interest: ${l.notes || 'Not specified'}
`).join('\n')}

Provide:
1. Lead Quality Assessment
2. Priority Ranking Strategy
3. Follow-up Recommendations
4. Conversion Optimization Tips`;
                break;

            case 'generate_milestone_tasks':
                prompt = `Generate a list of tasks for this project milestone.

Milestone: ${context.milestone_title}
Description: ${context.milestone_description}
Project Type: ${context.project_type}

Generate 5-8 specific, actionable tasks that need to be completed for this milestone. Each task should be clear and measurable.`;
                
                response_json_schema = {
                    type: "object",
                    properties: {
                        tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_name: { type: "string" },
                                    description: { type: "string" },
                                    priority: {
                                        type: "string",
                                        enum: ["low", "medium", "high", "urgent"]
                                    },
                                    estimated_hours: { type: "number" }
                                }
                            }
                        }
                    }
                };
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema
        });

        return Response.json({ 
            success: true, 
            result 
        });

    } catch (error) {
        console.error('AI Assistant error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});