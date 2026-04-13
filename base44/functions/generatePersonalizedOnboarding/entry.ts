import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { project_id, client_email } = await req.json();

        if (!project_id) {
            return Response.json({ error: 'project_id is required' }, { status: 400 });
        }

        // Get project details
        const project = await base44.asServiceRole.entities.ClientProject.get(project_id);
        
        // Try to get AI assessment for this client
        const assessments = await base44.asServiceRole.entities.AI_Assessment.filter({ 
            lead_email: client_email || project.client_email 
        });
        const assessment = assessments[0];

        // Generate personalized onboarding checklist using AI
        const prompt = `Generate a comprehensive onboarding checklist for a new client project.

Project Details:
- Project Type: ${project.project_type}
- Client Name: ${project.client_name}
- Project Name: ${project.project_name}

${assessment ? `Client Assessment Data:
- Business Type: ${assessment.business_type}
- Revenue Range: ${assessment.revenue_range}
- Team Size: ${assessment.team_size}
- Online Presence: ${assessment.online_presence}
- CRM Usage: ${assessment.crm_usage}
- Biggest Challenge: ${assessment.biggest_challenge}
- Growth Goals: ${assessment.growth_goals}
- Growth Score: ${assessment.growth_score}/100` : ''}

Create a personalized onboarding checklist with 8-12 actionable tasks tailored to:
1. The project type (${project.project_type})
2. The client's current digital maturity level
3. Their specific challenges and goals

Return ONLY a JSON array of tasks with this structure:
[
  {
    "title": "Task title (clear and actionable)",
    "description": "Detailed description of what needs to be done and why",
    "order": 1
  }
]

Make tasks specific, actionable, and relevant. Start with foundational tasks (account setup, documentation) and progress to project-specific items.
Focus on tasks the CLIENT needs to complete for a successful project launch.`;

        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                order: { type: "number" }
                            },
                            required: ["title", "description", "order"]
                        }
                    }
                },
                required: ["tasks"]
            }
        });

        const tasks = aiResponse.tasks || [];

        // Create onboarding tasks in database
        const createdTasks = [];
        for (const task of tasks) {
            const created = await base44.asServiceRole.entities.OnboardingTask.create({
                project_id: project_id,
                task_title: task.title,
                task_description: task.description,
                task_type: 'client',
                status: 'pending',
                order: task.order
            });
            createdTasks.push(created);
        }

        // Create initial onboarding progress record
        const existingProgress = await base44.asServiceRole.entities.OnboardingProgress.filter({
            user_email: project.client_email,
            project_id: project_id
        });

        if (existingProgress.length === 0) {
            await base44.asServiceRole.entities.OnboardingProgress.create({
                user_email: project.client_email,
                project_id: project_id,
                current_step: 0,
                completed_steps: [],
                wizard_completed: false
            });
        }

        // Send notification to client
        await base44.asServiceRole.entities.ClientNotification.create({
            user_email: project.client_email,
            notification_type: 'project_update',
            title: 'Welcome! Your Onboarding Checklist is Ready',
            message: `We've created a personalized onboarding checklist for ${project.project_name}. Complete these tasks to ensure a smooth project kickoff.`,
            project_id: project_id,
            is_read: false
        });

        return Response.json({ 
            success: true, 
            tasks: createdTasks,
            message: `Created ${createdTasks.length} personalized onboarding tasks`
        });

    } catch (error) {
        console.error('Error generating onboarding:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});