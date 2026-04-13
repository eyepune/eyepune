import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, template_id } = await req.json();

        // Get template
        const template = await base44.asServiceRole.entities.ProjectTemplate.get(template_id);
        const project = await base44.asServiceRole.entities.ClientProject.get(project_id);

        if (!template || !project) {
            return Response.json({ error: 'Template or project not found' }, { status: 404 });
        }

        const results = {
            milestones: [],
            tasks: [],
            documents: []
        };

        // Create milestones
        if (template.milestones && template.milestones.length > 0) {
            const startDate = new Date(project.start_date || new Date());
            
            for (const milestone of template.milestones) {
                const dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + (milestone.days_offset || 0));

                const created = await base44.asServiceRole.entities.ClientMilestone.create({
                    project_id: project.id,
                    title: milestone.title,
                    description: milestone.description,
                    due_date: dueDate.toISOString().split('T')[0],
                    status: 'pending'
                });
                results.milestones.push(created);
            }
        }

        // Create tasks
        if (template.tasks && template.tasks.length > 0) {
            for (const task of template.tasks) {
                const created = await base44.asServiceRole.entities.ProjectTask.create({
                    project_id: project.id,
                    task_name: task.task_name,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours,
                    status: 'todo'
                });
                results.tasks.push(created);
            }
        }

        // Create documents
        if (template.documents && template.documents.length > 0) {
            for (const doc of template.documents) {
                const created = await base44.asServiceRole.entities.SharedDocument.create({
                    project_id: project.id,
                    document_title: doc.document_title,
                    document_type: doc.document_type,
                    document_content: doc.template_content || '',
                    last_edited_by: user.email
                });
                results.documents.push(created);
            }
        }

        return Response.json({
            success: true,
            results
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});