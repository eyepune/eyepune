import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Support both direct call ({ lead_id }) and entity automation payload ({ event, data })
        let lead_id = body.lead_id;
        
        if (!lead_id && body.data) {
            // Called from entity automation - check for lead_id directly in data
            lead_id = body.data.lead_id;
        }
        
        // If still no lead_id, try fetching from Activity by entity ID
        if (!lead_id && body.event?.entity_id) {
            try {
                const activities = await base44.asServiceRole.entities.Activity.filter({
                    id: body.event.entity_id
                });
                if (activities && activities.length > 0) {
                    lead_id = activities[0].lead_id;
                }
            } catch (e) {
                console.log('Could not fetch Activity by entity_id:', e.message);
            }
        }
        
        // If still no lead_id, try fetching from assessment using lead_email
        if (!lead_id && body.data?.lead_email) {
            try {
                const assessments = await base44.asServiceRole.entities.AI_Assessment.filter({
                    lead_email: body.data.lead_email
                });
                if (assessments && assessments.length > 0) {
                    lead_id = assessments[0].lead_id;
                }
            } catch (e) {
                console.log('Could not fetch Assessment by lead_email:', e.message);
            }
        }

        if (!lead_id) {
            console.error('Payload received:', JSON.stringify(body, null, 2));
            return Response.json({ error: 'lead_id is required' }, { status: 400 });
        }

        // Fetch lead
        const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
        if (!leads || leads.length === 0) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        const lead = leads[0];
        let score = 0;
        const scoreBreakdown = {
            base: 0,
            assessment: 0,
            engagement: 0,
            sentiment: 0,
            inactivity_penalty: 0,
            source: 0
        };

        // Base score from lead data
        if (lead.company) scoreBreakdown.base += 5;
        if (lead.industry) scoreBreakdown.base += 5;
        if (lead.phone) scoreBreakdown.base += 5;
        if (lead.revenue_potential && lead.revenue_potential > 50000) scoreBreakdown.base += 10;
        else if (lead.revenue_potential && lead.revenue_potential > 10000) scoreBreakdown.base += 5;

        // AI Assessment scoring (deeper integration)
        const assessments = await base44.asServiceRole.entities.AI_Assessment.filter({
            lead_email: lead.email
        });

        if (assessments && assessments.length > 0) {
            const assessment = assessments[0];
            
            // Growth score contributes significantly
            if (assessment.growth_score) {
                scoreBreakdown.assessment += Math.round(assessment.growth_score * 0.3); // Up to 30 points
            }

            // Revenue range scoring
            const revenueScores = {
                '5Cr+': 15,
                '1Cr-5Cr': 12,
                '50L-1Cr': 10,
                '10L-50L': 7,
                '0-10L': 3
            };
            scoreBreakdown.assessment += revenueScores[assessment.revenue_range] || 0;

            // Team size indicates growth capacity
            const teamScores = {
                '50+': 10,
                '26-50': 8,
                '11-25': 6,
                '6-10': 4,
                '1-5': 2
            };
            scoreBreakdown.assessment += teamScores[assessment.team_size] || 0;

            // Online presence maturity
            const presenceScores = {
                'full_digital': 8,
                'advanced_website': 6,
                'basic_website': 3,
                'no_website': 0
            };
            scoreBreakdown.assessment += presenceScores[assessment.online_presence] || 0;

            // CRM usage indicates sales maturity
            const crmScores = {
                'advanced_crm': 5,
                'basic_crm': 3,
                'spreadsheet': 1,
                'none': 0
            };
            scoreBreakdown.assessment += crmScores[assessment.crm_usage] || 0;
        }

        // Email engagement scoring
        const emailAnalytics = await base44.asServiceRole.entities.EmailAnalytics.filter({
            lead_email: lead.email
        });

        if (emailAnalytics && emailAnalytics.length > 0) {
            const opens = emailAnalytics.filter(e => e.opened).length;
            const clicks = emailAnalytics.filter(e => e.clicked).length;
            const replies = emailAnalytics.filter(e => e.replied).length;

            scoreBreakdown.engagement += Math.min(opens * 2, 10); // Up to 10 points for opens
            scoreBreakdown.engagement += Math.min(clicks * 5, 15); // Up to 15 points for clicks
            scoreBreakdown.engagement += replies * 8; // 8 points per reply
        }

        // Activity engagement
        const activities = await base44.asServiceRole.entities.Activity.filter({
            lead_id: lead_id
        });

        if (activities && activities.length > 0) {
            const recentActivities = activities.filter(a => {
                const daysSince = (Date.now() - new Date(a.created_date)) / (1000 * 60 * 60 * 24);
                return daysSince <= 30;
            });

            const calls = recentActivities.filter(a => a.activity_type === 'call').length;
            const meetings = recentActivities.filter(a => a.activity_type === 'meeting').length;
            
            scoreBreakdown.engagement += calls * 5; // 5 points per call
            scoreBreakdown.engagement += meetings * 10; // 10 points per meeting
        }

        // Sentiment analysis
        const sentimentActivities = activities?.filter(a => 
            a.activity_type === 'note' && a.metadata?.sentiment
        ) || [];

        if (sentimentActivities.length > 0) {
            const recentSentiments = sentimentActivities.slice(-5); // Last 5 sentiment records
            const sentimentScores = {
                positive: 5,
                neutral: 0,
                negative: -10,
                mixed: 2
            };

            recentSentiments.forEach(a => {
                const sentiment = a.metadata?.sentiment;
                scoreBreakdown.sentiment += sentimentScores[sentiment] || 0;
            });
        }

        // Inactivity penalty
        if (lead.last_contacted) {
            const daysSinceContact = (Date.now() - new Date(lead.last_contacted)) / (1000 * 60 * 60 * 24);
            
            if (daysSinceContact > 60) {
                scoreBreakdown.inactivity_penalty = -20;
            } else if (daysSinceContact > 30) {
                scoreBreakdown.inactivity_penalty = -10;
            } else if (daysSinceContact > 14) {
                scoreBreakdown.inactivity_penalty = -5;
            }
        }

        // Lead source quality
        const sourceScores = {
            'ai_assessment': 15,
            'booking': 12,
            'referral': 10,
            'website': 5,
            'social_media': 3,
            'other': 0
        };
        scoreBreakdown.source = sourceScores[lead.source] || 0;

        // Calculate total score
        score = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);
        score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

        // Update lead score
        await base44.asServiceRole.entities.Lead.update(lead_id, {
            lead_score: score
        });

        // Log score update activity
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead_id,
            activity_type: 'note',
            title: 'Lead Score Updated',
            description: `Score recalculated: ${lead.lead_score || 0} → ${score}`,
            performed_by: 'Automated Scoring System',
            metadata: {
                old_score: lead.lead_score || 0,
                new_score: score,
                breakdown: scoreBreakdown,
                calculation_date: new Date().toISOString()
            }
        });

        return Response.json({
            success: true,
            lead_id,
            old_score: lead.lead_score || 0,
            new_score: score,
            breakdown: scoreBreakdown
        });

    } catch (error) {
        console.error('Error calculating lead score:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});