import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all active leads
        const allLeads = await base44.asServiceRole.entities.Lead.filter({
            status: { $nin: ['closed_won', 'closed_lost'] }
        });

        const updates = [];
        const now = Date.now();

        for (const lead of allLeads) {
            // Skip if no contact date
            if (!lead.last_contacted && !lead.created_date) continue;

            const lastContact = lead.last_contacted || lead.created_date;
            const daysSinceContact = (now - new Date(lastContact)) / (1000 * 60 * 60 * 24);

            let shouldUpdate = false;
            let scoreChange = 0;

            // Apply inactivity penalties
            if (daysSinceContact > 90) {
                scoreChange = -25;
                shouldUpdate = true;
            } else if (daysSinceContact > 60) {
                scoreChange = -15;
                shouldUpdate = true;
            } else if (daysSinceContact > 30) {
                scoreChange = -8;
                shouldUpdate = true;
            }

            if (shouldUpdate && lead.lead_score) {
                const newScore = Math.max(0, lead.lead_score + scoreChange);
                
                await base44.asServiceRole.entities.Lead.update(lead.id, {
                    lead_score: newScore
                });

                await base44.asServiceRole.entities.Activity.create({
                    lead_id: lead.id,
                    activity_type: 'note',
                    title: 'Inactivity Score Penalty Applied',
                    description: `Lead score reduced due to ${Math.round(daysSinceContact)} days of inactivity`,
                    performed_by: 'Automated Scoring System',
                    metadata: {
                        old_score: lead.lead_score,
                        new_score: newScore,
                        days_inactive: Math.round(daysSinceContact),
                        penalty: scoreChange
                    }
                });

                updates.push({
                    lead_id: lead.id,
                    name: lead.full_name,
                    days_inactive: Math.round(daysSinceContact),
                    score_change: scoreChange
                });
            }
        }

        return Response.json({
            success: true,
            leads_updated: updates.length,
            updates
        });

    } catch (error) {
        console.error('Error checking lead inactivity:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});