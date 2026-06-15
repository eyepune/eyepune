import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency = 'USD', receipt } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys missing' }, { status: 500 });
    }

    // Razorpay amounts are in the smallest currency unit (e.g., paise or cents)
    const orderPayload = {
      amount: amount * 100,
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Razorpay Order] Error from API:', data);
      return NextResponse.json({ error: data.error?.description || 'Payment gateway error' }, { status: response.status });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('[Razorpay Order] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
