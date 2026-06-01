import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { planId, email } = await req.json();

        // 1. Initialize Razorpay
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
             return NextResponse.json({ success: false, error: 'Razorpay credentials missing in environment variables.' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 2. Create an order (In a real scenario, this would be a Subscription if recurring)
        const options = {
            amount: 250000, // ₹2500 in paise
            currency: "INR",
            receipt: `receipt_${crypto.randomBytes(10).toString('hex')}`,
            notes: {
                email: email,
                plan: planId || 'Lex Pro Enterprise'
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Failed to create Razorpay order' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            orderId: order.id, 
            amount: order.amount, 
            currency: order.currency 
        });

    } catch (error) {
        console.error('Razorpay Checkout Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
