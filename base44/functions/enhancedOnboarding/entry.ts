import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, project_id, client_responses } = await req.json();

        if (action === 'generateDynamicChecklist') {
            const project = await base44.asServiceRole.entities.ClientProject.filter({ id: project_id })[0];

            const checklist = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate a personalized onboarding checklist for this project:

Project Type: ${project.project_type}
Client Responses: ${JSON.stringify(client_responses)}

Create a dynamic checklist with:
1. Client tasks (what they need to complete)
2. Internal team tasks (what we need to do)
3. Task dependencies and order
4. Estimated timeline for each task`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        client_tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    order: { type: "number" },
                                    estimated_hours: { type: "number" }
                                }
                            }
                        },
                        internal_tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    order: { type: "number" },
                                    assigned_role: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            // Create tasks in database
            for (const task of checklist.client_tasks) {
                await base44.asServiceRole.entities.OnboardingTask.create({
                    project_id,
                    task_title: task.title,
                    task_description: task.description,
                    task_type: 'client',
                    order: task.order,
                    status: 'pending'
                });
            }

            for (const task of checklist.internal_tasks) {
                await base44.asServiceRole.entities.OnboardingTask.create({
                    project_id,
                    task_title: task.title,
                    task_description: task.description,
                    task_type: 'internal',
                    order: task.order,
                    status: 'pending'
                });
            }

            return Response.json({ success: true, checklist });
        }

        if (action === 'generatePersonalizedMessage') {
            const { recipient_name, project_name, milestone_name, channel } = await req.json();

            const message = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate a personalized ${channel} message for client onboarding:

Client Name: ${recipient_name}
Project: ${project_name}
Context: ${milestone_name || 'Welcome message'}

Requirements:
- Warm and professional tone
- ${channel === 'whatsapp' ? 'Brief (2-3 sentences)' : 'Detailed but concise'}
- Encourage engagement
- Clear next steps`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subject: { type: "string" },
                        message: { type: "string" }
                    }
                }
            });

            return Response.json({ success: true, message });
        }

        if (action === 'scheduleFollowUpTasks') {
            const tasks = await base44.asServiceRole.entities.OnboardingTask.filter({ 
                project_id,
                task_type: 'client'
            });

            const completedTasks = tasks.filter(t => t.status === 'completed');
            const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

            const followUps = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Based on onboarding progress (${progress}% complete), suggest follow-up tasks for the internal team:

Completed Tasks: ${completedTasks.map(t => t.task_title).join(', ')}
Pending Tasks: ${tasks.filter(t => t.status === 'pending').map(t => t.task_title).join(', ')}

Suggest:
1. Next steps for the team
2. Who should be responsible
3. When to do it (timing)
4. Priority level`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        follow_ups: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_name: { type: "string" },
                                    assigned_to: { type: "string" },
                                    due_in_days: { type: "number" },
                                    priority: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            // Create follow-up tasks
            for (const followUp of followUps.follow_ups) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + followUp.due_in_days);

                await base44.asServiceRole.entities.ProjectTask.create({
                    project_id,
                    task_name: followUp.task_name,
                    assigned_to: followUp.assigned_to,
                    status: 'todo',
                    priority: followUp.priority,
                    due_date: dueDate.toISOString().split('T')[0]
                });
            }

            return Response.json({ success: true, follow_ups: followUps.follow_ups });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Enhanced onboarding error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});