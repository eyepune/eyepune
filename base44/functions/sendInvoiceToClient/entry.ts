import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import nodemailer from 'npm:nodemailer@6.9.9';
import Razorpay from 'npm:razorpay@2.9.2';

const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.eyepune.com';

function buildInvoiceEmail(invoice, paymentLink) {
  const items = (invoice.line_items || []).map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${i.description}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(i.amount || 0).toLocaleString()}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;">
  <div style="background:#040404;padding:30px 40px;text-align:center;">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:45px;"/>
    <p style="color:#888;font-size:11px;margin:6px 0 0;">Connect · Engage · Grow</p>
  </div>
  <div style="padding:40px;">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:28px;">
      <div>
        <p style="color:#888;font-size:12px;margin:0 0 4px;">INVOICE</p>
        <h2 style="color:#1a1a1a;margin:0 0 4px;">#${invoice.invoice_number || 'INV-001'}</h2>
        <p style="color:#666;margin:0;">To: <strong>${invoice.client_name}</strong>${invoice.company_name ? ` · ${invoice.company_name}` : ''}</p>
      </div>
      <div style="text-align:right;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">Invoice Date: ${invoice.invoice_date || new Date().toLocaleDateString()}</p>
        <p style="color:#e53e3e;font-size:12px;margin:0;font-weight:700;">Due: ${invoice.due_date || 'Immediate'}</p>
        ${invoice.billing_type === 'recurring' ? `<p style="color:#8b5cf6;font-size:11px;margin:4px 0 0;background:#f5f3ff;padding:2px 8px;border-radius:20px;display:inline-block;">🔄 ${invoice.recurring_interval} recurring</p>` : ''}
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;background:#fafafa;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <thead><tr style="background:#040404;"><th style="padding:10px 12px;text-align:left;color:#fff;font-size:13px;">Description</th><th style="padding:10px 12px;text-align:right;color:#fff;font-size:13px;">Amount</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr><td style="padding:8px 12px;color:#888;">Subtotal</td><td style="padding:8px 12px;text-align:right;color:#555;">₹${(invoice.subtotal || invoice.total || 0).toLocaleString()}</td></tr>
        ${invoice.tax_percentage > 0 ? `<tr><td style="padding:8px 12px;color:#888;">GST (${invoice.tax_percentage}%)</td><td style="padding:8px 12px;text-align:right;color:#555;">₹${(invoice.tax_amount || 0).toLocaleString()}</td></tr>` : ''}
        <tr style="background:#e53e3e;"><td style="padding:12px;font-weight:700;color:#fff;">Total Due</td><td style="padding:12px;font-weight:700;color:#fff;text-align:right;font-size:18px;">₹${(invoice.total || 0).toLocaleString()}</td></tr>
      </tfoot>
    </table>

    ${paymentLink ? `<div style="text-align:center;margin:28px 0;">
      <a href="${paymentLink}" style="display:inline-block;background:#e53e3e;color:#fff;padding:16px 40px;border-radius:8px;font-weight:700;font-size:16px;text-decoration:none;">
        💳 Pay Now — ₹${(invoice.total || 0).toLocaleString()}
      </a>
      <p style="color:#999;font-size:12px;margin:8px 0 0;">Secure payment via Razorpay</p>
    </div>` : ''}

    ${invoice.notes ? `<p style="color:#555;background:#fafafa;padding:12px;border-radius:8px;font-size:13px;">${invoice.notes}</p>` : ''}
  </div>
  <div style="background:#040404;padding:20px 40px;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">EyE PunE · connect@eyepune.com · +91 9284712033 · Pune, Maharashtra</p>
  </div>
</div></body></html>`;
}

function buildInvoiceWhatsApp(invoice, paymentLink) {
  return `Hi ${invoice.client_name}! 👋

Your invoice from *EyE PunE* is ready.

🧾 *Invoice #${invoice.invoice_number || 'INV-001'}*
💰 Amount Due: *₹${(invoice.total || 0).toLocaleString()}*
📅 Due Date: ${invoice.due_date || 'Immediate'}
${invoice.billing_type === 'recurring' ? `🔄 Recurring: ${invoice.recurring_interval}\n` : ''}
${paymentLink ? `💳 Pay securely here:\n${paymentLink}` : ''}

Thank you for choosing EyE PunE! 🚀
— connect@eyepune.com`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { invoice_id } = await req.json();
    const invoices = await base44.asServiceRole.entities.Invoice.filter({ id: invoice_id });
    const invoice = invoices[0];
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

    // Create Razorpay payment link
    let paymentLink = invoice.payment_link;
    try {
      const razorpay = new Razorpay({
        key_id: Deno.env.get('RAZORPAY_KEY_ID'),
        key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
      });

      if (invoice.billing_type === 'recurring') {
        // Create subscription plan
        const plan = await razorpay.plans.create({
          period: invoice.recurring_interval === 'monthly' ? 'monthly' : invoice.recurring_interval === 'quarterly' ? 'monthly' : 'yearly',
          interval: invoice.recurring_interval === 'quarterly' ? 3 : 1,
          item: {
            name: `EyE PunE - ${invoice.client_name}`,
            amount: Math.round((invoice.total || 0) * 100),
            currency: 'INR',
            description: invoice.line_items?.[0]?.description || 'Services',
          },
        });
        const sub = await razorpay.subscriptions.create({
          plan_id: plan.id,
          total_count: 12,
          quantity: 1,
          customer_notify: 1,
          notify_info: { notify_email: invoice.client_email, notify_phone: invoice.client_phone },
        });
        paymentLink = `https://rzp.io/i/${sub.id}`;
        await base44.asServiceRole.entities.Invoice.update(invoice.id, { razorpay_subscription_id: sub.id, payment_link: paymentLink });
      } else {
        const pl = await razorpay.paymentLink.create({
          amount: Math.round((invoice.total || 0) * 100),
          currency: 'INR',
          description: `Invoice #${invoice.invoice_number}`,
          customer: { name: invoice.client_name, email: invoice.client_email, contact: invoice.client_phone || '' },
          notify: { sms: true, email: true },
          reminder_enable: true,
          callback_url: `${SITE_URL}/payment-success`,
          callback_method: 'get',
        });
        paymentLink = pl.short_url;
        await base44.asServiceRole.entities.Invoice.update(invoice.id, { razorpay_order_id: pl.id, payment_link: paymentLink });
      }
    } catch (rzErr) {
      console.error('Razorpay error:', rzErr.message);
      // Continue without payment link
    }

    // Send email
    const smtpPort = parseInt(Deno.env.get('ZOHO_MAIL_SMTP_PORT') || '587');
    const transporter = nodemailer.createTransport({
      host: Deno.env.get('ZOHO_MAIL_SMTP_HOST'),
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: Deno.env.get('ZOHO_MAIL_USERNAME'), pass: Deno.env.get('ZOHO_MAIL_PASSWORD') },
    });

    await transporter.sendMail({
      from: `"EyE PunE" <${Deno.env.get('ZOHO_MAIL_USERNAME')}>`,
      to: invoice.client_email,
      subject: `Invoice #${invoice.invoice_number} — ₹${(invoice.total || 0).toLocaleString()} Due`,
      html: buildInvoiceEmail(invoice, paymentLink),
    });

    const waText = buildInvoiceWhatsApp(invoice, paymentLink);
    const waLink = invoice.client_phone
      ? `https://wa.me/${invoice.client_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`
      : null;

    await base44.asServiceRole.entities.Invoice.update(invoice.id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, payment_link: paymentLink, wa_link: waLink });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});