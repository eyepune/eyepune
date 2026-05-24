import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { period = 'month' } = await req.json();

        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
        else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

        // Fetch all data in parallel
        const [leads, assessments, bookings, orders, activities, packages, conversations] = await Promise.all([
            base44.asServiceRole.entities.Lead.list(),
            base44.asServiceRole.entities.AI_Assessment.list(),
            base44.asServiceRole.entities.Booking.list(),
            base44.asServiceRole.entities.Order.list(),
            base44.asServiceRole.entities.Activity.list('-created_date', 100),
            base44.asServiceRole.entities.Pricing_Plan.filter({ is_active: true }),
            base44.asServiceRole.agents.listConversations({ agent_name: 'salesAssistant' })
        ]);

        // Filter by date range
        const filterByDate = (items) => items.filter(item => new Date(item.created_date) >= startDate);
        
        const recentLeads = filterByDate(leads);
        const recentAssessments = filterByDate(assessments);
        const recentBookings = filterByDate(bookings);
        const recentOrders = filterByDate(orders);

        // Sales Performance Metrics
        const totalLeads = recentLeads.length;
        const qualifiedLeads = recentLeads.filter(l => l.status === 'qualified' || l.status === 'proposal_sent').length;
        const convertedLeads = recentLeads.filter(l => l.status === 'closed_won').length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
        
        const totalBookings = recentBookings.length;
        const completedBookings = recentBookings.filter(b => b.status === 'completed').length;
        
        const totalRevenue = recentOrders
            .filter(o => o.payment_status === 'completed')
            .reduce((sum, o) => sum + (o.amount || 0), 0);
        
        const avgDealSize = convertedLeads > 0 ? (totalRevenue / convertedLeads) : 0;

        // Lead status breakdown
        const leadsByStatus = {
            new: recentLeads.filter(l => l.status === 'new').length,
            contacted: recentLeads.filter(l => l.status === 'contacted').length,
            qualified: recentLeads.filter(l => l.status === 'qualified').length,
            proposal_sent: recentLeads.filter(l => l.status === 'proposal_sent').length,
            closed_won: convertedLeads,
            closed_lost: recentLeads.filter(l => l.status === 'closed_lost').length
        };

        // AI Assessment Insights
        const totalAssessments = recentAssessments.length;
        const avgScore = recentAssessments.length > 0 
            ? (recentAssessments.reduce((sum, a) => sum + (a.growth_score || 0), 0) / recentAssessments.length).toFixed(1)
            : 0;
        
        const highScoreLeads = recentAssessments.filter(a => a.growth_score >= 70).length;
        const assessmentToLeadConversion = recentAssessments.filter(a => a.converted_to_lead).length;
        const assessmentConversionRate = totalAssessments > 0 
            ? ((assessmentToLeadConversion / totalAssessments) * 100).toFixed(1)
            : 0;

        // Common challenges from assessments
        const challengesMap = {};
        recentAssessments.forEach(a => {
            if (a.biggest_challenge) {
                const challenge = a.biggest_challenge.substring(0, 50).toLowerCase();
                const key = challenge.includes('lead') ? 'Lead Generation' :
                           challenge.includes('sale') ? 'Sales Process' :
                           challenge.includes('market') ? 'Marketing' :
                           challenge.includes('website') || challenge.includes('online') ? 'Online Presence' :
                           challenge.includes('automat') ? 'Automation' :
                           'Other';
                challengesMap[key] = (challengesMap[key] || 0) + 1;
            }
        });
        
        const topChallenges = Object.entries(challengesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Revenue by source
        const revenueBySource = {
            assessment: recentOrders.filter(o => 
                recentLeads.find(l => l.email === o.customer_email && l.source === 'ai_assessment') &&
                o.payment_status === 'completed'
            ).reduce((sum, o) => sum + o.amount, 0),
            booking: recentOrders.filter(o => 
                recentLeads.find(l => l.email === o.customer_email && l.source === 'booking') &&
                o.payment_status === 'completed'
            ).reduce((sum, o) => sum + o.amount, 0),
            website: recentOrders.filter(o => 
                recentLeads.find(l => l.email === o.customer_email && l.source === 'website') &&
                o.payment_status === 'completed'
            ).reduce((sum, o) => sum + o.amount, 0)
        };

        // AI Sales Assistant Performance
        const totalConversations = conversations.filter(c => !c.metadata?.is_admin_notifications).length;
        const activeConversations = conversations.filter(c => 
            !c.metadata?.is_admin_notifications && 
            c.messages?.length > 2
        ).length;
        
        const leadsFromAssistant = recentLeads.filter(l => 
            activities.some(a => a.lead_id === l.id && a.title?.includes('Sales Assistant'))
        ).length;

        // Package Builder Effectiveness (packages created recently)
        const packagesCreatedRecently = packages.filter(p => 
            new Date(p.created_date) >= startDate
        ).length;

        // Recent activities summary
        const recentActivitiesBreakdown = {
            assessments: activities.filter(a => a.activity_type === 'assessment').length,
            bookings: activities.filter(a => a.activity_type === 'booking').length,
            calls: activities.filter(a => a.activity_type === 'call').length,
            emails: activities.filter(a => a.activity_type === 'email').length,
            meetings: activities.filter(a => a.activity_type === 'meeting').length
        };

        return Response.json({
            success: true,
            period,
            dateRange: { start: startDate.toISOString(), end: now.toISOString() },
            salesMetrics: {
                totalLeads,
                qualifiedLeads,
                convertedLeads,
                conversionRate: parseFloat(conversionRate),
                totalBookings,
                completedBookings,
                totalRevenue,
                avgDealSize: Math.round(avgDealSize),
                leadsByStatus,
                revenueBySource
            },
            assessmentInsights: {
                totalAssessments,
                avgScore: parseFloat(avgScore),
                highScoreLeads,
                assessmentConversionRate: parseFloat(assessmentConversionRate),
                topChallenges
            },
            aiAssistantMetrics: {
                totalConversations,
                activeConversations,
                leadsFromAssistant,
                engagementRate: totalConversations > 0 
                    ? ((activeConversations / totalConversations) * 100).toFixed(1)
                    : 0
            },
            packageBuilderMetrics: {
                packagesCreatedRecently,
                activePackages: packages.length
            },
            recentActivities: recentActivitiesBreakdown
        });

    } catch (error) {
        console.error('Error generating metrics:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});