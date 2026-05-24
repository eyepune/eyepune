import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, currency, planId, planName, customerDetails, isSubscription } = await req.json();

        const keyId = Deno.env.get('RAZORPAY_KEY_ID');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        const auth = btoa(`${keyId}:${keySecret}`);

        if (isSubscription) {
            // Create subscription
            const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: planId,
                    customer_notify: 1,
                    total_count: 12,
                    notes: {
                        customer_name: customerDetails.name,
                        customer_email: customerDetails.email,
                        plan_name: planName
                    }
                })
            });

            const subscription = await subscriptionResponse.json();

            if (!subscriptionResponse.ok || subscription.error) {
                console.error('Razorpay API Error:', subscription);
                throw new Error(subscription.error?.description || 'Failed to create subscription');
            }

            return Response.json({
                subscriptionId: subscription.id,
                amount: amount,
                currency: currency || 'INR',
                keyId: keyId
            });
        } else {
            // Create one-time order
            const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency || 'INR',
                    notes: {
                        customer_name: customerDetails.name,
                        customer_email: customerDetails.email,
                        customer_phone: customerDetails.phone,
                        plan_name: planName
                    }
                })
            });

            const order = await orderResponse.json();

            if (!orderResponse.ok || order.error) {
                console.error('Razorpay API Error:', order);
                throw new Error(order.error?.description || 'Failed to create order');
            }

            return Response.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: keyId
            });
        }
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});