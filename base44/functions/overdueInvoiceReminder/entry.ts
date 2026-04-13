import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token error');
    return data.access_token;
}

async function sendEmail(to, subject, html) {
    const accessToken = await getAccessToken();
    const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
    const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';
    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAddress, toAddress: to, subject, content: html, mailFormat: 'html' })
    });
    return res.json();
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const today = new Date().toISOString().split('T')[0];

        // Get sent invoices with past due dates
        const invoices = await base44.asServiceRole.entities.Invoice.filter({ status: 'sent' });

        let reminded = 0;
        for (const invoice of invoices) {
            if (!invoice.due_date || invoice.due_date >= today) continue;

            const daysOverdue = Math.floor((new Date(today) - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24));
            
            // Send reminders at 1, 3, 7, 14 days overdue
            if (![1, 3, 7, 14].includes(daysOverdue)) continue;

            const urgency = daysOverdue >= 7 ? '🚨 URGENT: ' : daysOverdue >= 3 ? '⚠️ ' : '📋 ';

            await sendEmail(invoice.client_email, `${urgency}Invoice #${invoice.invoice_number} — Payment ${daysOverdue === 1 ? 'Due' : `${daysOverdue} Days Overdue`}`, `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${daysOverdue >= 7 ? '#7f1d1d' : '#dc2626'}; padding: 24px; text-align: center;">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:40px;" />
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color:#dc2626;">Payment Reminder</h2>
                        <p>Hi <strong>${invoice.client_name}</strong>,</p>
                        <p>This is a ${daysOverdue === 1 ? 'friendly reminder' : `follow-up — your invoice is <strong>${daysOverdue} days overdue</strong>`}.</p>
                        <div style="background:#fff5f5; border-radius:12px; padding:20px; margin:20px 0;">
                            <p style="margin:6px 0;">📄 <strong>Invoice #:</strong> ${invoice.invoice_number}</p>
                            <p style="margin:6px 0;">💰 <strong>Amount Due:</strong> ₹${(invoice.total || 0).toLocaleString()}</p>
                            <p style="margin:6px 0;">📅 <strong>Due Date:</strong> ${invoice.due_date}</p>
                        </div>
                        ${invoice.payment_link ? `<div style="text-align:center; margin:25px 0;"><a href="${invoice.payment_link}" style="background:#dc2626; color:#fff; text-decoration:none; padding:14px 32px; border-radius:50px; font-weight:bold; font-size:16px;">Pay Now →</a></div>` : ''}
                        <p style="color:#666; font-size:14px;">Questions about this invoice? Reply to this email or call <a href="tel:+919284712033">+91 9284712033</a></p>
                    </div>
                </div>
            `);

            // Mark as overdue in DB
            await base44.asServiceRole.entities.Invoice.update(invoice.id, { status: 'overdue' });
            reminded++;
        }

        return Response.json({ success: true, reminders_sent: reminded });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});