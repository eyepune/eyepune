import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event, data } = await req.json();

        if (event.type !== 'update' || event.entity_name !== 'Payment') {
            return Response.json({ error: 'Invalid event' }, { status: 400 });
        }

        const payment = data;

        // Only trigger on successful payment
        if (payment.status !== 'completed') {
            return Response.json({ message: 'Payment not completed yet' });
        }

        // Send onboarding email
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: payment.customer_email,
            subject: '🎉 Welcome Aboard! Your EyE PunE Journey Begins',
            body: `
Hi ${payment.customer_name},

🎉 Congratulations! Your payment has been confirmed.

ORDER DETAILS:
📦 Package: ${payment.plan_name || 'Custom Package'}
💰 Amount: ₹${(payment.amount / 100).toLocaleString('en-IN')}
✅ Status: Confirmed

WHAT HAPPENS NEXT:

Day 1 (Today):
✅ You'll receive login credentials to your client dashboard
✅ Our team will contact you to schedule a kickoff call

Day 2-3:
✅ Kickoff strategy session
✅ Set goals and define success metrics
✅ Finalize project timeline

Week 1:
✅ Begin implementation
✅ First progress update

IMPORTANT LINKS:
🔗 Client Dashboard: https://yourapp.com/Admin_Dashboard
🔗 Book Your Kickoff Call: https://yourapp.com/Booking
🔗 Contact Support: connect@eyepune.com

NEED HELP?
📧 Email: connect@eyepune.com
📱 WhatsApp: +91 9284712033

We're committed to your success. Let's grow together!

The EyE PunE Team

---
Connect - Engage - Grow
EyE PunE | Your All-in-One Growth Partner
            `.trim()
        });

        // Create or update lead
        if (payment.lead_id) {
            await base44.asServiceRole.entities.Lead.update(payment.lead_id, {
                status: 'closed_won',
                revenue_potential: payment.amount
            });

            await base44.asServiceRole.entities.Activity.create({
                lead_id: payment.lead_id,
                activity_type: 'payment',
                title: 'Payment completed - Onboarding initiated',
                description: `Paid ₹${(payment.amount / 100).toLocaleString('en-IN')} for ${payment.plan_name}`,
                performed_by: 'system'
            });
        }

        return Response.json({ 
            success: true, 
            message: 'Onboarding sequence initiated',
            payment_id: payment.id 
        });
    } catch (error) {
        console.error('Error sending onboarding sequence:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});