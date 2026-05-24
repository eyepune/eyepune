import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Entity automation payload: { event, data } — direct call: { sequenceId, triggerData }
        let sequenceId = body.sequenceId;
        let triggerData = body.triggerData;

        // If called from entity automation on Lead create
        if (!sequenceId && body.event?.entity_name === 'Lead' && body.data) {
            const lead = body.data;
            // Find active sequence for new_lead trigger
            const sequences = await base44.asServiceRole.entities.EmailSequence.filter({
                trigger_type: 'new_lead',
                is_active: true
            });
            if (!sequences || sequences.length === 0) {
                return Response.json({ success: false, message: 'No active new_lead sequence found' });
            }
            sequenceId = sequences[0].id;
            triggerData = {
                recipient: { email: lead.email, name: lead.full_name },
                variables: { company: lead.company, source: lead.source },
                lead_id: lead.id
            };
        } else if (!sequenceId) {
            // Direct call — require admin and sequenceId
            const user = await base44.auth.me();
            if (user?.role !== 'admin') {
                return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
            if (!sequenceId) {
                console.error('Payload received:', JSON.stringify(body, null, 2));
                return Response.json({ error: 'sequenceId is required for direct calls' }, { status: 400 });
            }
        }

        // Get sequence
        const sequence = await base44.asServiceRole.entities.EmailSequence.get(sequenceId);

        if (!sequence || !sequence.is_active) {
            return Response.json({ error: 'Sequence not found or inactive' }, { status: 404 });
        }

        // Get recipients based on target segment
        let recipients = [];
        
        if (sequence.target_segment === 'leads') {
            const leads = await base44.asServiceRole.entities.Lead.list();
            recipients = leads.map(l => ({ email: l.email, name: l.name }));
        } else if (sequence.target_segment === 'clients') {
            const users = await base44.asServiceRole.entities.User.list();
            recipients = users.filter(u => u.role === 'user').map(u => ({ 
                email: u.email, 
                name: u.full_name 
            }));
        } else if (triggerData?.recipient) {
            // Single recipient from trigger
            recipients = [triggerData.recipient];
        }

        // Schedule emails in sequence
        const scheduled = [];
        for (const email of sequence.emails || []) {
            const delayMs = ((email.delay_days || 0) * 24 * 60 * 60 * 1000) + 
                           ((email.delay_hours || 0) * 60 * 60 * 1000);

            for (const recipient of recipients) {
                // Schedule email (in production, use a job queue)
                if (delayMs === 0) {
                    // Send immediately
                    await base44.asServiceRole.functions.invoke('sendMarketingEmail', {
                        templateId: email.template_id,
                        recipientEmail: recipient.email,
                        recipientName: recipient.name,
                        sequenceId: sequenceId,
                        variables: {
                            name: recipient.name,
                            ...triggerData?.variables
                        }
                    });
                    scheduled.push({ recipient: recipient.email, delay: 0 });
                } else {
                    // Log for delayed sending (would need automation/cron for real scheduling)
                    scheduled.push({ 
                        recipient: recipient.email, 
                        delay: delayMs,
                        template_id: email.template_id,
                        scheduled_for: new Date(Date.now() + delayMs).toISOString()
                    });
                }
            }
        }

        return Response.json({ 
            success: true, 
            sequence: sequence.sequence_name,
            scheduled: scheduled
        });
    } catch (error) {
        console.error('Email sequence error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});