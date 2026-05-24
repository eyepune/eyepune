import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all leads without scores or recent scores
        const leads = await base44.asServiceRole.entities.Lead.filter({});

        let scoredLeads = 0;
        let sequencesTriggered = 0;

        for (const lead of leads) {
            try {
                // Calculate Lead Score (0-100)
                let score = 0;

                // Engagement scoring (40 points max)
                if (lead.email_opens) score += Math.min(20, lead.email_opens * 2);
                if (lead.email_clicks) score += Math.min(20, lead.email_clicks * 3);

                // Activity scoring (30 points max)
                if (lead.visited_pricing_page) score += 15;
                if (lead.downloaded_resources) score += Math.min(15, (lead.downloaded_resources || 0) * 3);

                // Business fit scoring (30 points max)
                if (lead.company_size) {
                    const sizeScores = {
                        '1-10': 10,
                        '11-50': 15,
                        '51-200': 20,
                        '201-500': 20,
                        '500+': 20
                    };
                    score += sizeScores[lead.company_size] || 0;
                }

                if (lead.industry === 'technology' || lead.industry === 'saas' || lead.industry === 'professional_services') {
                    score += 10;
                }

                // Urgency scoring (based on recency)
                if (lead.updated_date) {
                    const daysSinceUpdate = Math.floor((new Date() - new Date(lead.updated_date)) / (1000 * 60 * 60 * 24));
                    if (daysSinceUpdate <= 7) score += 10;
                }

                score = Math.min(100, Math.max(0, score));

                // Update lead with score
                await base44.asServiceRole.entities.Lead.update(lead.id, {
                    lead_score: score,
                    last_scored_date: new Date().toISOString()
                });

                scoredLeads++;

                // Trigger appropriate sequences based on score
                if (score >= 80 && !lead.high_priority_sequence_sent) {
                    // High priority - intensive nurture
                    await base44.asServiceRole.entities.Lead.update(lead.id, {
                        high_priority_sequence_sent: true
                    });
                    sequencesTriggered++;
                } else if (score >= 60 && !lead.standard_sequence_sent) {
                    // Medium priority - standard nurture
                    await base44.asServiceRole.entities.Lead.update(lead.id, {
                        standard_sequence_sent: true
                    });
                    sequencesTriggered++;
                }

                // Trigger action-based sequences
                if (lead.visited_pricing_page && !lead.pricing_nurture_sent) {
                    await base44.asServiceRole.entities.Lead.update(lead.id, {
                        pricing_nurture_sent: true
                    });
                    sequencesTriggered++;
                }

            } catch (error) {
                console.error(`Error processing lead ${lead.id}:`, error.message);
            }
        }

        return Response.json({
            success: true,
            message: 'Lead scoring and nurturing completed',
            stats: {
                leads_scored: scoredLeads,
                sequences_triggered: sequencesTriggered,
                processed_at: new Date().toISOString()
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});