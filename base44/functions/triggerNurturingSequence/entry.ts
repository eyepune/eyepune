import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { leadId, triggerId, variables } = await req.json();

        if (!leadId || !triggerId) {
            return Response.json({ error: 'Missing required fields: leadId, triggerId' }, { status: 400 });
        }

        // Get the lead
        const lead = await base44.asServiceRole.entities.Lead.get(leadId);

        if (!lead) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Get the email sequence for this trigger
        const sequences = await base44.asServiceRole.entities.EmailSequence.filter({
            trigger_type: triggerId
        });

        if (sequences.length === 0) {
            return Response.json({
                success: false,
                message: 'No sequence configured for this trigger'
            });
        }

        const sequence = sequences[0];
        let emailsSent = 0;

        // Schedule each email in the sequence
        for (const emailConfig of sequence.emails) {
            try {
                // Calculate send time
                const sendDate = new Date();
                sendDate.setDate(sendDate.getDate() + emailConfig.delay_days);
                sendDate.setHours(sendDate.getHours() + emailConfig.delay_hours);

                // Create analytics record for tracking
                const emailAnalytics = await base44.asServiceRole.entities.EmailAnalytics.create({
                    campaign_id: sequence.id,
                    sequence_id: sequence.id,
                    recipient_email: lead.email,
                    recipient_name: lead.name,
                    subject_line: 'Scheduled email',
                    sent_date: sendDate.toISOString(),
                    opened: false,
                    clicked: false,
                    bounced: false,
                    unsubscribed: false
                });

                emailsSent++;

            } catch (error) {
                console.error(`Error scheduling email:`, error.message);
            }
        }

        // Update lead to mark sequence as sent
        await base44.asServiceRole.entities.Lead.update(leadId, {
            last_sequence_triggered: triggerId,
            last_sequence_date: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: `Nurturing sequence triggered for lead`,
            sequence_name: sequence.sequence_name,
            emails_scheduled: emailsSent
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});