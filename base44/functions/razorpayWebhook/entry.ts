import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify webhook signature
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

        const expectedSignature = createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        const eventType = event.event;

        if (eventType === 'payment.captured' || eventType === 'order.paid') {
            const payment = event.payload.payment.entity;
            const order = event.payload.order?.entity;

            // Create or update payment record
            const paymentRecord = await base44.asServiceRole.entities.Payment.create({
                customer_name: payment.notes?.customer_name || payment.email,
                customer_email: payment.email || payment.notes?.customer_email,
                customer_phone: payment.contact || payment.notes?.customer_phone,
                amount: payment.amount,
                currency: payment.currency,
                plan_name: payment.notes?.plan_name || 'Custom',
                payment_type: 'one_time',
                status: 'completed',
                razorpay_payment_id: payment.id,
                razorpay_order_id: order?.id || payment.order_id
            });

            // Update lead if exists
            const leads = await base44.asServiceRole.entities.Lead.filter({ 
                email: payment.email || payment.notes?.customer_email 
            });

            if (leads.length > 0) {
                const lead = leads[0];
                await base44.asServiceRole.entities.Lead.update(lead.id, {
                    status: 'closed_won',
                    revenue_potential: payment.amount
                });

                await base44.asServiceRole.entities.Activity.create({
                    lead_id: lead.id,
                    activity_type: 'payment',
                    title: 'Payment successful',
                    description: `Paid ₹${(payment.amount / 100).toLocaleString('en-IN')}`,
                    performed_by: 'system'
                });
            }

            return Response.json({ success: true, paymentId: paymentRecord.id });
        }

        if (eventType === 'payment.failed') {
            const payment = event.payload.payment.entity;

            await base44.asServiceRole.entities.Payment.create({
                customer_email: payment.email || payment.notes?.customer_email,
                amount: payment.amount,
                currency: payment.currency,
                plan_name: payment.notes?.plan_name || 'Custom',
                status: 'failed',
                razorpay_payment_id: payment.id,
                razorpay_order_id: payment.order_id
            });

            return Response.json({ success: true, status: 'failed' });
        }

        if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
            const subscription = event.payload.subscription.entity;
            const payment = event.payload.payment?.entity;

            await base44.asServiceRole.entities.Payment.create({
                customer_email: subscription.notes?.customer_email,
                customer_name: subscription.notes?.customer_name,
                amount: payment?.amount || subscription.plan_id,
                currency: 'INR',
                plan_name: subscription.notes?.plan_name || 'Subscription',
                payment_type: 'subscription',
                status: 'completed',
                razorpay_subscription_id: subscription.id,
                razorpay_payment_id: payment?.id
            });

            return Response.json({ success: true });
        }

        return Response.json({ success: true, message: 'Event processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});