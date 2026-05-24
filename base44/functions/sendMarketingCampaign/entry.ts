import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { campaign_id } = await req.json();

        if (!campaign_id) {
            return Response.json({ error: 'campaign_id is required' }, { status: 400 });
        }

        // Get campaign details
        const campaign = await base44.asServiceRole.entities.Campaign.get(campaign_id);

        if (!campaign) {
            return Response.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Get leads based on target audience
        let leads = [];
        
        switch (campaign.target_audience) {
            case 'all_leads':
                leads = await base44.asServiceRole.entities.Lead.filter({});
                break;
            case 'new_leads':
                leads = await base44.asServiceRole.entities.Lead.filter({ status: 'new' });
                break;
            case 'qualified_leads':
                leads = await base44.asServiceRole.entities.Lead.filter({ status: 'qualified' });
                break;
            default:
                leads = await base44.asServiceRole.entities.Lead.filter({});
        }

        if (leads.length === 0) {
            return Response.json({ 
                success: false, 
                message: 'No leads found for target audience' 
            });
        }

        // Send emails via Zoho Mail
        const results = {
            sent: 0,
            failed: 0,
            errors: []
        };

        for (const lead of leads) {
            try {
                // Replace template variables
                let emailContent = campaign.content;
                let emailSubject = campaign.subject;

                emailContent = emailContent.replace(/{{name}}/g, lead.full_name || 'there');
                emailContent = emailContent.replace(/{{email}}/g, lead.email);
                emailContent = emailContent.replace(/{{company}}/g, lead.company || 'your company');
                
                emailSubject = emailSubject.replace(/{{name}}/g, lead.full_name || 'there');

                // Send via Zoho Mail function
                const response = await base44.asServiceRole.functions.invoke('sendZohoEmail', {
                    to: lead.email,
                    subject: emailSubject,
                    html: emailContent
                });

                if (response.success) {
                    results.sent++;
                } else {
                    results.failed++;
                    results.errors.push({ email: lead.email, error: response.error });
                }

                // Rate limiting - wait 100ms between emails
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                results.failed++;
                results.errors.push({ email: lead.email, error: error.message });
            }
        }

        // Update campaign stats
        await base44.asServiceRole.entities.Campaign.update(campaign_id, {
            sent_count: (campaign.sent_count || 0) + results.sent,
            status: 'completed'
        });

        return Response.json({ 
            success: true,
            results: results,
            total_leads: leads.length
        });

    } catch (error) {
        console.error('Error sending campaign:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});