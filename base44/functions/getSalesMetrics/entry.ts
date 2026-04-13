import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all data in parallel
        const [allLeads, upcomingBookings, emailAnalytics, recentActivities] = await Promise.all([
            base44.asServiceRole.entities.Lead.list('-created_date', 5000),
            base44.asServiceRole.entities.Booking.filter({ status: 'scheduled' }),
            base44.asServiceRole.entities.EmailAnalytics.list('-created_date', 1000),
            base44.asServiceRole.entities.Activity.list('-created_date', 20),
        ]);

        const totalLeads = allLeads.length;

        // Leads by score range
        const scoreRanges = {
            hot: allLeads.filter(l => (l.lead_score || 0) >= 80).length,
            warm: allLeads.filter(l => (l.lead_score || 0) >= 50 && (l.lead_score || 0) < 80).length,
            cold: allLeads.filter(l => (l.lead_score || 0) < 50).length
        };

        // Conversion rates by source
        const leadsBySource = {};
        const convertedBySource = {};
        allLeads.forEach(lead => {
            const source = lead.source || 'other';
            leadsBySource[source] = (leadsBySource[source] || 0) + 1;
            if (lead.status === 'closed_won') {
                convertedBySource[source] = (convertedBySource[source] || 0) + 1;
            }
        });

        const conversionRates = Object.keys(leadsBySource).map(source => ({
            source,
            total: leadsBySource[source],
            converted: convertedBySource[source] || 0,
            rate: leadsBySource[source] > 0 ? parseFloat(((convertedBySource[source] || 0) / leadsBySource[source] * 100).toFixed(1)) : 0
        }));

        // Sentiment from activities metadata (no $regex filter)
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push({ date: date.toISOString().split('T')[0], positive: 0, negative: 0, neutral: 0 });
        }

        recentActivities.forEach(activity => {
            const sentiment = activity.metadata?.sentiment;
            if (sentiment && sentimentCounts.hasOwnProperty(sentiment)) {
                sentimentCounts[sentiment]++;
                const activityDate = new Date(activity.created_date).toISOString().split('T')[0];
                const dayData = last30Days.find(d => d.date === activityDate);
                if (dayData && ['positive', 'negative', 'neutral'].includes(sentiment)) {
                    dayData[sentiment]++;
                }
            }
        });

        // Upcoming bookings sorted
        const sortedBookings = upcomingBookings
            .filter(b => new Date(b.scheduled_date) >= new Date())
            .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
            .slice(0, 10);

        // Email campaign performance
        const campaignPerformance = {
            totalSent: emailAnalytics.length,
            opened: emailAnalytics.filter(e => e.opened).length,
            clicked: emailAnalytics.filter(e => e.clicked).length,
            converted: emailAnalytics.filter(e => e.converted).length,
        };
        campaignPerformance.openRate = campaignPerformance.totalSent > 0
            ? parseFloat((campaignPerformance.opened / campaignPerformance.totalSent * 100).toFixed(1))
            : 0;
        campaignPerformance.clickRate = campaignPerformance.opened > 0
            ? parseFloat((campaignPerformance.clicked / campaignPerformance.opened * 100).toFixed(1))
            : 0;
        campaignPerformance.conversionRate = campaignPerformance.totalSent > 0
            ? parseFloat((campaignPerformance.converted / campaignPerformance.totalSent * 100).toFixed(1))
            : 0;

        // Status distribution
        const statusCounts = {};
        allLeads.forEach(lead => {
            const status = lead.status || 'new';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Revenue potential
        const totalRevenuePotential = allLeads.reduce((sum, lead) => sum + (lead.revenue_potential || 0), 0);
        const avgRevenuePotential = totalLeads > 0 ? totalRevenuePotential / totalLeads : 0;

        return Response.json({
            success: true,
            metrics: {
                totalLeads,
                scoreRanges,
                conversionRates,
                sentimentCounts,
                sentimentTrends: last30Days,
                upcomingBookings: sortedBookings,
                campaignPerformance,
                statusCounts,
                totalRevenuePotential,
                avgRevenuePotential,
                recentActivities: recentActivities.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Error fetching sales metrics:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});