import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            invoice_id
        } = await request.json();

        const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

        // Verify signature
        const shasum = crypto.createHmac('sha256', key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Update invoice in Supabase
        const { data, error } = await supabase
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

        if (error) throw error;

        return NextResponse.json({ success: true, invoice: data });
    } catch (error) {
        console.error('[Razorpay Verify Error]:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
    }
}
