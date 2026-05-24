import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { action, data } = await req.json();

        if (action === 'categorizeFeedback') {
            const { feedback_id, feedback_text, rating } = data;

            const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Analyze this client feedback and categorize it:
                
Rating: ${rating}/5
Feedback: ${feedback_text}

Provide:
1. Primary category (quality, timeliness, communication, overall)
2. Sentiment (positive, neutral, negative)
3. Key themes/tags (max 5 keywords)
4. Priority level for review (low, medium, high, urgent)
5. Suggested action`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        category: { type: "string" },
                        sentiment: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        priority: { type: "string" },
                        suggested_action: { type: "string" }
                    }
                }
            });

            // Update feedback with AI analysis
            await base44.asServiceRole.entities.ClientFeedback.update(feedback_id, {
                category: result.category,
                status: result.priority === 'urgent' ? 'pending_review' : 'reviewed'
            });

            return Response.json({ success: true, analysis: result });
        }

        if (action === 'generateProjectHealthReport') {
            const { project_ids } = data;
            
            const projects = await base44.asServiceRole.entities.ClientProject.list();
            const tasks = await base44.asServiceRole.entities.ProjectTask.list();
            const timeLogs = await base44.asServiceRole.entities.TimeLog.list();

            const projectsToAnalyze = projects.filter(p => project_ids.includes(p.id));
            
            const projectData = projectsToAnalyze.map(project => {
                const projectTasks = tasks.filter(t => t.project_id === project.id);
                const overdueTasks = projectTasks.filter(t => 
                    t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()
                );
                const totalHours = timeLogs
                    .filter(log => log.project_id === project.id)
                    .reduce((sum, log) => sum + log.hours, 0);

                return {
                    project_name: project.project_name,
                    status: project.status,
                    progress: project.progress_percentage,
                    total_tasks: projectTasks.length,
                    completed_tasks: projectTasks.filter(t => t.status === 'completed').length,
                    overdue_tasks: overdueTasks.length,
                    blocked_tasks: projectTasks.filter(t => t.status === 'blocked').length,
                    total_hours: totalHours
                };
            });

            const report = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate an executive summary report for these projects:

${JSON.stringify(projectData, null, 2)}

Provide:
1. Overall health status summary
2. Key risks and concerns
3. Top performing projects
4. Projects needing attention
5. Actionable recommendations`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_health: { type: "string" },
                        key_risks: { type: "array", items: { type: "string" } },
                        top_performing: { type: "array", items: { type: "string" } },
                        needs_attention: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } }
                    }
                }
            });

            return Response.json({ success: true, report });
        }

        if (action === 'suggestTeamMember') {
            const { task_description, required_skills, project_id } = data;

            const teamMembers = await base44.asServiceRole.entities.User.list();
            const skills = await base44.asServiceRole.entities.TeamMemberSkill.list();
            const allocations = await base44.asServiceRole.entities.ResourceAllocation.list();
            const currentTasks = await base44.asServiceRole.entities.ProjectTask.filter({
                status: { $in: ['todo', 'in_progress'] }
            });

            const memberData = teamMembers.filter(m => m.role === 'admin').map(member => {
                const memberSkills = skills.filter(s => s.user_email === member.email);
                const memberAllocations = allocations.filter(a => a.user_email === member.email);
                const memberTasks = currentTasks.filter(t => t.assigned_to === member.email);
                const totalAllocation = memberAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0);

                return {
                    name: member.full_name,
                    email: member.email,
                    skills: memberSkills.map(s => `${s.skill_name} (${s.proficiency_level})`).join(', '),
                    current_allocation: totalAllocation,
                    active_tasks: memberTasks.length
                };
            });

            const suggestion = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Suggest the best team member for this task:

Task: ${task_description}
Required Skills: ${required_skills?.join(', ') || 'Not specified'}

Available Team Members:
${JSON.stringify(memberData, null, 2)}

Provide:
1. Top 3 recommended team members with reasoning
2. Availability assessment for each
3. Risk factors to consider`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    reasoning: { type: "string" },
                                    availability_score: { type: "number" }
                                }
                            }
                        },
                        risk_factors: { type: "array", items: { type: "string" } }
                    }
                }
            });

            return Response.json({ success: true, suggestion });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('AI Admin Assistant error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});