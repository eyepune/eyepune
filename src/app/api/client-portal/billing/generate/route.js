import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Admin authorization check
        if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clientId, amount, description, currency = 'INR', sendEmail = false } = await request.json();

        if (!clientId || !amount) {
            return NextResponse.json({ error: 'clientId and amount are required' }, { status: 400 });
        }

        // 1. Fetch Client Data
        const { data: client, error: clientError } = await supabaseAdmin
            .from('leads')
            .select('full_name, email, phone')
            .eq('id', clientId)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ error: 'Client not found in CRM' }, { status: 404 });
        }

        // 2. Generate Invoice Record
        const { data: invoice, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert([{
                client_id: clientId,
                amount: amount,
                currency: currency,
                description: description || 'EyE PunE Services',
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (invoiceError) {
            console.error('[Billing Generator] Failed to create invoice:', invoiceError);
            return NextResponse.json({ error: 'Failed to generate invoice record' }, { status: 500 });
        }

        // 3. Generate Payment Link (Uses your Client Portal Payment page)
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const paymentLink = `${protocol}://${host}/Client-Portal/pay/${invoice.id}`;

        // 4. Optionally Send Email to Client
        if (sendEmail) {
            // Trigger internal email logic here using your email API
            await fetch(`${protocol}://${host}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    subject: 'Your Invoice from EyE PunE',
                    html: `<p>Hi ${client.full_name},</p><p>Please find your invoice for ${description} attached.</p><p><a href="${paymentLink}" style="background:#ef4444;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Pay Securely via Razorpay</a></p>`
                })
            }).catch(e => console.warn('Failed to send invoice email:', e));
        }

        return NextResponse.json({ 
            success: true, 
            invoice_id: invoice.id,
            payment_url: paymentLink,
            message: 'Invoice successfully generated and secured.'
        });

    } catch (error) {
        console.error('[Billing Generator] Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
