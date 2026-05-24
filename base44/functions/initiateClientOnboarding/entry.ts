import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { projectId } = await req.json();

        const project = await base44.asServiceRole.entities.ClientProject.get(projectId);

        // Use AI to generate personalized onboarding checklist
        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Generate a personalized client onboarding checklist for this project:
            
Project Name: ${project.project_name}
Project Type: ${project.project_type}
Client: ${project.client_name}
Description: ${project.description || 'Not provided'}

Project types context:
- social_media: Social media marketing and content management
- web_app: Website and application development
- ai_automation: AI tools and automation solutions
- branding: Brand identity and design work
- full_service: Comprehensive business solutions

Generate 6-8 specific onboarding tasks (mix of client and internal tasks) that are relevant to this project type. Include both client-facing tasks and internal setup tasks.`,
            response_json_schema: {
                type: "object",
                properties: {
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                task_title: { type: "string" },
                                task_description: { type: "string" },
                                task_type: { 
                                    type: "string",
                                    enum: ["client", "internal"]
                                },
                                order: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        // Create AI-generated tasks
        for (const task of aiResponse.tasks) {
            await base44.asServiceRole.entities.OnboardingTask.create({
                project_id: projectId,
                ...task
            });
        }

        // Generate personalized welcome email using AI
        const welcomeEmail = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Generate a warm, professional welcome email for a new client.

Client Details:
- Name: ${project.client_name}
- Project: ${project.project_name}
- Project Type: ${project.project_type}

The email should:
1. Welcome them enthusiastically
2. Express excitement about their specific project
3. Outline the first 3-4 steps from their personalized checklist
4. Mention they can access their dashboard at the provided link
5. Provide contact details: connect@eyepune.com, +91 9284712033
6. Keep it warm but professional

Generate HTML email content with proper formatting.`,
            response_json_schema: {
                type: "object",
                properties: {
                    subject: { type: "string" },
                    html_body: { type: "string" }
                }
            }
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'EyE PunE Team',
            to: project.client_email,
            subject: welcomeEmail.subject,
            body: welcomeEmail.html_body
        });

        // Send WhatsApp message
        try {
            if (project.client_phone) {
                await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Generate a professional WhatsApp welcome message for a new client. Client name: ${project.client_name}, Project: ${project.project_name}. Keep it brief, welcoming, and include that they'll receive onboarding details via email. Maximum 2-3 sentences.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            message: { type: "string" }
                        }
                    }
                });
                // Note: Actual WhatsApp sending would require WhatsApp Business API integration
                console.log(`WhatsApp notification queued for ${project.client_phone}`);
            }
        } catch (error) {
            console.error('WhatsApp notification error:', error);
        }

        // Update project status
        await base44.asServiceRole.entities.ClientProject.update(projectId, {
            status: 'onboarding'
        });

        return Response.json({ success: true, message: 'Onboarding initiated' });
    } catch (error) {
        console.error('Onboarding error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});