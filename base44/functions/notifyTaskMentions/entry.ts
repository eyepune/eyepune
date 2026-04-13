import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, event } = await req.json();
        
        // Only process create events for TaskComment
        if (event.type !== 'create' || event.entity_name !== 'TaskComment') {
            return Response.json({ success: true, message: 'Skipped - not a comment creation' });
        }

        const comment = data;
        
        // Check if there are mentioned users
        if (!comment.mentioned_users || comment.mentioned_users.length === 0) {
            return Response.json({ success: true, message: 'No mentions to notify' });
        }

        // Get task details
        const task = await base44.asServiceRole.entities.ProjectTask.get(comment.task_id);
        
        // Send notification to each mentioned user
        const notifications = comment.mentioned_users.map(async (userEmail) => {
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: userEmail,
                    subject: `You were mentioned in a task comment`,
                    body: `
You were mentioned in a comment on task: ${task.task_name}

Comment from ${comment.created_by}:
${comment.comment_text}

View the task and discussion in the project management dashboard.
                    `.trim()
                });
            } catch (error) {
                console.error(`Failed to notify ${userEmail}:`, error);
            }
        });

        await Promise.all(notifications);

        return Response.json({ 
            success: true, 
            message: `Notified ${comment.mentioned_users.length} users` 
        });
    } catch (error) {
        console.error('Error in notifyTaskMentions:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});