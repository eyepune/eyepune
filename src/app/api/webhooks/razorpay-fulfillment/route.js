import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('[Razorpay Webhook] Missing RAZORPAY_WEBHOOK_SECRET');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // 1. Verify Webhook Signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('[Razorpay Webhook] Invalid signature detected. Potential spoofing attack.');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        
        // 2. Handle Payment Captured Event
        if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const amountPaid = paymentEntity.amount / 100;

            console.log(`[Razorpay Webhook] Payment captured: ${orderId} for ₹${amountPaid}`);

            // 3. Find the associated Invoice in Supabase
            const { data: invoice, error: invoiceError } = await supabaseAdmin
                .from('invoices')
                .select('*, leads(email, full_name, company, notes)')
                .eq('razorpay_order_id', orderId)
                .single();

            if (invoiceError || !invoice) {
                console.warn(`[Razorpay Webhook] Could not find invoice for order: ${orderId}`);
                return NextResponse.json({ success: true, warning: 'Invoice not found' });
            }

            // 4. Update Invoice Status
            await supabaseAdmin
                .from('invoices')
                .update({ status: 'paid', updated_at: new Date().toISOString() })
                .eq('id', invoice.id);

            // 5. ── AUTOMATED AI FULFILLMENT ENGINE ──
            console.log(`[Razorpay Webhook] Triggering Autonomous Fulfillment for Client: ${invoice.leads?.full_name}`);
            
            // If the invoice was for strategy, brand, or initial onboarding:
            if (invoice.description.toLowerCase().includes('strategy') || invoice.amount > 10000) {
                
                const prompt = `Act as an elite Growth Strategist for EyE PunE.
                We just onboarded a new client.
                Client Name: ${invoice.leads?.full_name}
                Company: ${invoice.leads?.company || 'their business'}
                Context: ${invoice.leads?.notes || 'They need digital transformation and a highly scalable web presence.'}
                
                Generate a highly structured "Initial 90-Day Digital Growth Strategy Outline" for them.
                Format as a professional, easily readable markdown document. No pleasantries, just the raw strategic roadmap.`;

                // Run LLM in the background
                fetch(process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7
                    })
                }).then(async (res) => {
                    const data = await res.json();
                    const strategyDoc = data.choices?.[0]?.message?.content || "Strategy generation queued.";
                    
                    // Email the Strategy Document automatically
                    const protocol = request.headers.get('x-forwarded-proto') || 'http';
                    const host = request.headers.get('host');
                    await fetch(`${protocol}://${host}/api/email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: invoice.leads.email,
                            subject: 'Your EyE PunE Strategy Roadmap is Ready',
                            html: `<p>Payment received. As promised, our AI engineering team has immediately generated your initial roadmap.</p><hr/><div style="white-space: pre-wrap; font-family: monospace;">${strategyDoc}</div>`
                        })
                    });
                    
                    console.log('[Razorpay Webhook] Automated fulfillment complete and emailed to client.');
                }).catch(e => console.error('[Razorpay Webhook] AI Fulfillment failed:', e));
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Razorpay Webhook] Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
