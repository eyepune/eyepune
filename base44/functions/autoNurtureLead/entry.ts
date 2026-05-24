import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { lead_id } = await req.json();

        if (!lead_id) {
            return Response.json({ error: 'lead_id is required' }, { status: 400 });
        }

        // Fetch lead and assessment data
        const lead = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
        if (!lead || lead.length === 0) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        const leadData = lead[0];
        const leadScore = leadData.lead_score || 0;

        // Fetch assessment if exists
        const assessments = await base44.asServiceRole.entities.AI_Assessment.filter({ 
            lead_email: leadData.email 
        });
        const assessment = assessments.length > 0 ? assessments[0] : null;

        // Determine nurturing strategy based on score
        let action = '';
        let emailSubject = '';
        let emailBody = '';
        let nextSteps = '';

        if (leadScore < 50) {
            // COLD LEAD - Educational nurturing sequence
            action = 'email_nurture';
            
            const challenge = assessment?.biggest_challenge || 'business growth';
            const challenges = assessment?.marketing_channels?.join(', ') || 'marketing and sales';
            
            emailSubject = `${leadData.full_name}, Here's How to Tackle Your ${challenge} Challenge`;
            emailBody = `Hi ${leadData.full_name},\n\n` +
                `I noticed from your recent AI Business Assessment that ${challenge} is a key concern for ${leadData.company || 'your business'}.\n\n` +
                `You're not alone - many businesses in ${leadData.industry || 'your industry'} face similar challenges. Here are 3 actionable strategies that have helped our clients:\n\n` +
                `1. **Quick Win Strategy**: Start with low-hanging fruit that can show results in 30 days\n` +
                `2. **Systematic Approach**: Build a repeatable process that compounds over time\n` +
                `3. **Technology Leverage**: Use automation to do more with less effort\n\n` +
                `📚 **Free Resources for You:**\n` +
                `• Case Study: How we helped a ${leadData.industry || 'similar'} business overcome ${challenge}\n` +
                `• Guide: The 90-Day ${challenge} Action Plan\n` +
                `• Checklist: Essential tools and tactics\n\n` +
                `Want to discuss how these strategies can work for your specific situation? I'm here to help.\n\n` +
                `Best regards,\n` +
                `EyE PunE Team\n` +
                `📧 connect@eyepune.com | 📱 +91 9284712033`;

            nextSteps = 'Educational content sent. Follow up in 7 days if no response.';

        } else if (leadScore >= 50 && leadScore < 80) {
            // WARM LEAD - Resource sharing + scheduled follow-up
            action = 'resource_and_schedule';
            
            const challenge = assessment?.biggest_challenge || 'growth goals';
            const growthScore = assessment?.growth_score || leadScore;
            
            emailSubject = `${leadData.full_name}, Your Growth Roadmap + Let's Schedule a Quick Chat`;
            emailBody = `Hi ${leadData.full_name},\n\n` +
                `Based on your AI Assessment (Growth Score: ${growthScore}/100), I've identified some exciting opportunities for ${leadData.company || 'your business'}.\n\n` +
                `**Your Custom Growth Roadmap:**\n\n` +
                `📊 **Current State Analysis:**\n` +
                `• Primary challenge: ${challenge}\n` +
                `• Revenue range: ${assessment?.revenue_range || 'Scaling phase'}\n` +
                `• Team size: ${assessment?.team_size || 'Growing'}\n\n` +
                `🚀 **Recommended Solutions:**\n` +
                (assessment?.revenue_range?.includes('10L-50L') || assessment?.revenue_range?.includes('50L-1Cr') ? 
                `• Social Media Marketing System (₹1.5-3L) - 3-4x ROI typically within 6 months\n` +
                `• Lead Generation Automation (₹2-4L) - Reduce cost per lead by 40-60%\n` +
                `• Sales Process Optimization (₹1-2L) - Increase conversion rates by 25-50%\n\n` :
                `• Starter Growth Package (₹50K-1L) - Foundation building for sustainable growth\n` +
                `• Digital Presence Setup (₹75K-1.5L) - Essential online infrastructure\n\n`) +
                `💰 **Estimated ROI:** Based on similar clients, expect 2.5-4x return within 6-9 months.\n\n` +
                `📅 **Next Step:** I'd love to schedule a 30-minute strategy call to discuss your specific needs.\n\n` +
                `**Available slots (IST):**\n` +
                `• Tomorrow: 11:00 AM, 3:00 PM\n` +
                `• Day after: 10:00 AM, 2:00 PM, 4:00 PM\n\n` +
                `Reply with your preferred time, or book directly here: ${Deno.env.get('APP_URL') || 'https://eyepune.base44.app'}/Booking\n\n` +
                `Looking forward to helping you achieve your growth goals!\n\n` +
                `Best regards,\n` +
                `EyE PunE Sales Team\n` +
                `📧 connect@eyepune.com | 📱 +91 9284712033`;

            nextSteps = 'Resources sent with booking options. Create follow-up activity for 3 days if no response.';

            // Create follow-up activity scheduled for 3 days
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + 3);
            
            await base44.asServiceRole.entities.Activity.create({
                lead_id: lead_id,
                activity_type: 'email',
                title: 'Follow-up: Resource package sent',
                description: `Sent custom roadmap and booking options. Follow up if no response by ${followUpDate.toLocaleDateString('en-IN')}`,
                performed_by: 'AI Sales Assistant',
                metadata: {
                    nurture_tier: 'warm',
                    follow_up_date: followUpDate.toISOString(),
                    action_required: true
                }
            });

        } else {
            // HOT LEAD - Immediate consultation scheduling with ROI focus
            action = 'urgent_booking';
            
            const challenge = assessment?.biggest_challenge || 'business transformation';
            const growthScore = assessment?.growth_score || leadScore;
            const revenueRange = assessment?.revenue_range || '50L-1Cr';
            
            // Calculate estimated ROI based on revenue range
            let estimatedInvestment = '₹2-5L';
            let estimatedReturn = '₹6-20L';
            let timeframe = '6-9 months';
            
            if (revenueRange.includes('5Cr+')) {
                estimatedInvestment = '₹10-25L';
                estimatedReturn = '₹40-100L';
                timeframe = '9-12 months';
            } else if (revenueRange.includes('1Cr-5Cr')) {
                estimatedInvestment = '₹5-15L';
                estimatedReturn = '₹20-60L';
                timeframe = '6-9 months';
            }
            
            emailSubject = `🚨 ${leadData.full_name}, Urgent: Your ${growthScore}-Score Growth Opportunity`;
            emailBody = `Hi ${leadData.full_name},\n\n` +
                `Your AI Assessment reveals exceptional growth potential (Score: ${growthScore}/100) - you're in the top 15% of businesses we assess!\n\n` +
                `**Why This is Time-Sensitive:**\n` +
                `Based on your ${revenueRange} revenue range and current ${challenge} challenge, you're perfectly positioned for rapid growth. However, the gap between where you are and where you could be is costing you revenue every day.\n\n` +
                `**Your Projected Growth Scenario:**\n\n` +
                `📈 **Conservative Estimate:**\n` +
                `• Investment: ${estimatedInvestment}\n` +
                `• Expected Return: ${estimatedReturn}\n` +
                `• Timeframe: ${timeframe}\n` +
                `• ROI: 3-4x minimum\n\n` +
                `💡 **What We'll Implement:**\n` +
                `✓ Complete sales & marketing automation system\n` +
                `✓ Lead generation machine (50-100 qualified leads/month)\n` +
                `✓ Professional web presence & brand positioning\n` +
                `✓ AI-powered business processes\n` +
                `✓ Data-driven optimization & scaling\n\n` +
                `🎯 **Case Study - Similar Business:**\n` +
                `${leadData.industry || 'A'} company in ${revenueRange} range invested ₹3.5L with us. Results after 7 months:\n` +
                `• 312% increase in qualified leads\n` +
                `• 47% improvement in conversion rate\n` +
                `• ₹14.8L additional revenue generated\n` +
                `• 4.2x ROI\n\n` +
                `⚡ **URGENT: Limited Availability**\n` +
                `We're at 85% capacity for Q1 2026. Only 3 premium client slots remain.\n\n` +
                `📅 **Priority Booking - Next 24 Hours:**\n` +
                `I'm holding a slot specifically for you tomorrow:\n` +
                `• Time: 11:00 AM or 3:00 PM IST\n` +
                `• Duration: 45 minutes\n` +
                `• Format: Video call + screen share\n` +
                `• Agenda: Custom growth strategy + implementation roadmap\n\n` +
                `👉 **Confirm your slot:** Reply "BOOK 11AM" or "BOOK 3PM" or choose another time at ${Deno.env.get('APP_URL') || 'https://eyepune.base44.app'}/Booking\n\n` +
                `This call alone typically generates 3-5 actionable insights worth ₹50K+ in value.\n\n` +
                `Don't let another day of unrealized potential pass by.\n\n` +
                `Best regards,\n` +
                `Senior Growth Consultant\n` +
                `EyE PunE\n` +
                `📧 connect@eyepune.com | 📱 +91 9284712033 (Priority Line)`;

            nextSteps = 'Urgent consultation request sent. Mark for admin follow-up if no response within 24 hours.';

            // Create urgent follow-up activity
            await base44.asServiceRole.entities.Activity.create({
                lead_id: lead_id,
                activity_type: 'email',
                title: '🔥 HOT LEAD - Urgent consultation sent',
                description: `High-score lead (${leadScore}). Sent priority booking with ROI projections. ADMIN: Follow up personally if no response within 24 hours.`,
                performed_by: 'AI Sales Assistant',
                metadata: {
                    nurture_tier: 'hot',
                    urgency: 'high',
                    follow_up_hours: 24,
                    admin_notification: true,
                    estimated_deal_size: estimatedInvestment
                }
            });
        }

        // Send the email
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'EyE PunE Growth Team',
            to: leadData.email,
            subject: emailSubject,
            body: emailBody
        });

        // Update lead with nurturing activity
        await base44.asServiceRole.entities.Lead.update(lead_id, {
            last_contacted: new Date().toISOString(),
            notes: (leadData.notes || '') + `\n\n[${new Date().toLocaleDateString()}] Auto-nurture (Score: ${leadScore}): ${action} - ${nextSteps}`
        });

        // Log the nurturing action
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead_id,
            activity_type: 'email',
            title: `Auto-nurture: ${action}`,
            description: `Lead score: ${leadScore}. ${nextSteps}`,
            performed_by: 'AI Sales Assistant',
            metadata: {
                automation: 'lead_nurturing',
                lead_score: leadScore,
                nurture_type: action,
                assessment_id: assessment?.id
            }
        });

        return Response.json({
            success: true,
            action: action,
            leadScore: leadScore,
            nextSteps: nextSteps,
            emailSent: true
        });

    } catch (error) {
        console.error('Error in auto-nurture:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});