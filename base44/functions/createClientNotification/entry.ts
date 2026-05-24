import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { userEmail, notificationType, title, message, projectId, actionUrl, metadata } = await req.json();

        const notification = await base44.asServiceRole.entities.ClientNotification.create({
            user_email: userEmail,
            notification_type: notificationType,
            title: title,
            message: message,
            project_id: projectId,
            action_url: actionUrl,
            metadata: metadata
        });

        return Response.json({ success: true, notification });
    } catch (error) {
        console.error('Notification creation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});