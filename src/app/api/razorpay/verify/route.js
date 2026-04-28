import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            invoice_id,
            metadata // Contains customer details and plan info
        } = await request.json();

        const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

        // 1. Verify signature
        const shasum = crypto.createHmac('sha256', key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // 2. Record Payment in 'payments' table
        const paymentData = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            status: 'completed',
            amount: metadata?.amount || 0,
            currency: 'INR',
            customer_name: metadata?.customer_name || 'Anonymous',
            customer_email: metadata?.customer_email || 'N/A',
            customer_phone: metadata?.customer_phone || 'N/A',
            plan_name: metadata?.plan_name || 'Generic Payment',
            notes: metadata?.notes || '',
            invoice_id: invoice_id || null,
            created_at: new Date().toISOString()
        };

        const { error: pError } = await supabase
            .from('payments')
            .insert([paymentData]);

        if (pError) console.error('[Payment Record Error]:', pError);

        // 3. Update Invoice if provided
        let updatedInvoice = null;
        if (invoice_id) {
            const { data, error: iError } = await supabase
                .from('invoices')
                .update({
                    status: 'paid',
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoice_id)
                .select()
                .single();

            if (iError) throw iError;
            updatedInvoice = data;
        }

        return NextResponse.json({ 
            success: true, 
            payment_id: razorpay_payment_id,
            invoice: updatedInvoice 
        });
    } catch (error) {
        console.error('[Razorpay Verify Error]:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
    }
}
