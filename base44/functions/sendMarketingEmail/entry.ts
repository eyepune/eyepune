import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { templateId, recipientEmail, recipientName, campaignId, sequenceId, variables } = await req.json();

        // Get template
        const template = await base44.asServiceRole.entities.EmailTemplate.get(templateId);

        if (!template || !template.is_active) {
            return Response.json({ error: 'Template not found or inactive' }, { status: 404 });
        }

        // Replace variables in subject and body
        let subject = template.subject_line;
        let body = template.email_body_html;

        if (variables) {
            Object.keys(variables).forEach(key => {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), variables[key] || '');
                body = body.replace(new RegExp(placeholder, 'g'), variables[key] || '');
            });
        }

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'EyE PunE Marketing',
            to: recipientEmail,
            subject: subject,
            body: body
        });

        // Track analytics
        await base44.asServiceRole.entities.EmailAnalytics.create({
            campaign_id: campaignId,
            template_id: templateId,
            sequence_id: sequenceId,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject_line: subject,
            sent_date: new Date().toISOString()
        });

        return Response.json({ 
            success: true, 
            message: 'Email sent successfully',
            recipient: recipientEmail 
        });
    } catch (error) {
        console.error('Marketing email error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});