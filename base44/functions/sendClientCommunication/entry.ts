import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event_type, project_id, milestone_id, recipient_email, recipient_name } = await req.json();

        // Fetch active templates for this event type
        const templates = await base44.asServiceRole.entities.CommunicationTemplate.filter({
            trigger_event: event_type,
            active: true
        });

        if (templates.length === 0) {
            return Response.json({ message: 'No active templates found' });
        }

        const template = templates[0];
        
        // Fetch project details for personalization
        const project = project_id ? await base44.asServiceRole.entities.ClientProject.filter({ id: project_id })[0] : null;
        const milestone = milestone_id ? await base44.asServiceRole.entities.ClientMilestone.filter({ id: milestone_id })[0] : null;

        // Replace placeholders
        const replacePlaceholders = (text) => {
            if (!text) return '';
            return text
                .replace(/\{client_name\}/g, recipient_name || 'Valued Client')
                .replace(/\{project_name\}/g, project?.project_name || 'Your Project')
                .replace(/\{milestone_name\}/g, milestone?.title || '')
                .replace(/\{company_name\}/g, 'EyE PunE');
        };

        // Send email if configured
        if (template.channel === 'email' || template.channel === 'both') {
            await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'EyE PunE Team',
                to: recipient_email,
                subject: replacePlaceholders(template.email_subject),
                body: replacePlaceholders(template.email_body)
            });
        }

        // Send WhatsApp if configured (placeholder - requires WhatsApp Business API)
        if (template.channel === 'whatsapp' || template.channel === 'both') {
            console.log('WhatsApp message queued:', replacePlaceholders(template.whatsapp_message));
            // Actual WhatsApp integration would go here
        }

        // Create notification for client
        await base44.asServiceRole.entities.ClientNotification.create({
            user_email: recipient_email,
            notification_type: event_type === 'new_message' ? 'new_message' : 
                             event_type === 'milestone_completed' ? 'milestone_completed' : 
                             event_type === 'deliverable_ready' ? 'deliverable_ready' : 'project_update',
            title: event_type === 'new_message' ? 'New Message' :
                   event_type === 'milestone_completed' ? 'Milestone Completed!' :
                   event_type === 'deliverable_ready' ? 'New Deliverable Ready' : 'Project Update',
            message: replacePlaceholders(template.email_subject) || 'You have a new update',
            project_id: project_id
        });

        return Response.json({ 
            success: true, 
            message: 'Communication sent successfully',
            channel: template.channel
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});