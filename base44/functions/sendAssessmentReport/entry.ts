import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event, data } = await req.json();

        if (event.type !== 'create' || event.entity_name !== 'AI_Assessment') {
            return Response.json({ error: 'Invalid event' }, { status: 400 });
        }

        const assessment = data;

        // Send assessment report email
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'EyE PunE',
            to: assessment.lead_email,
            subject: `📊 Your Business Growth Score: ${assessment.growth_score}/100`,
            body: `
Hi ${assessment.lead_name},

Thank you for completing our AI Business Assessment! 

🎯 YOUR GROWTH SCORE: ${assessment.growth_score}/100

Based on your responses, we've identified key opportunities to accelerate your business growth.

KEY RECOMMENDATIONS:
${assessment.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'Check your detailed report'}

NEXT STEPS:
✅ Book a FREE 30-minute consultation to discuss your personalized growth plan
✅ Our team will show you exactly how to implement these strategies
✅ No pressure, no obligations - just actionable insights

🔗 BOOK YOUR FREE CONSULTATION NOW:
https://yourapp.com/Booking

Or view our pricing plans:
https://yourapp.com/Pricing

Questions? Reply to this email or WhatsApp us at +91 9284712033

Looking forward to helping you grow,
The EyE PunE Team

---
Connect - Engage - Grow
EyE PunE | Your All-in-One Growth Partner
            `.trim()
        });

        // Update lead with assessment info
        if (assessment.lead_id) {
            await base44.asServiceRole.entities.Activity.create({
                lead_id: assessment.lead_id,
                activity_type: 'email',
                title: 'Assessment report sent',
                description: `Growth score: ${assessment.growth_score}/100`,
                performed_by: 'system'
            });
        }

        return Response.json({ 
            success: true, 
            message: 'Assessment report sent',
            growth_score: assessment.growth_score 
        });
    } catch (error) {
        console.error('Error sending assessment report:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});