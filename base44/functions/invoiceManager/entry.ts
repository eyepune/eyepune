import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { action, project_id, invoice_id } = await req.json();

        if (action === 'generateInvoice') {
            const project = await base44.asServiceRole.entities.ClientProject.filter({ id: project_id });
            if (!project || project.length === 0) {
                throw new Error('Project not found');
            }

            const timeLogs = await base44.asServiceRole.entities.TimeLog.filter({ 
                project_id,
                billable: true 
            });

            const invoices = await base44.asServiceRole.entities.Invoice.filter({ project_id });
            const invoicedLogIds = invoices.flatMap(inv => 
                inv.line_items?.map(item => item.log_id).filter(Boolean) || []
            );
            
            const uninvoicedLogs = timeLogs.filter(log => !invoicedLogIds.includes(log.id));

            if (uninvoicedLogs.length === 0) {
                return Response.json({ 
                    success: false, 
                    message: 'No billable hours to invoice' 
                });
            }

            const logSummary = uninvoicedLogs.map(log => ({
                user: log.user_email,
                hours: log.hours,
                date: log.date,
                description: log.description
            }));

            const invoiceData = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate an invoice for this project:

Project: ${project[0].project_name}
Budget: ₹${project[0].budget || 'Not set'}
Client: ${project[0].client_name}

Billable Time Logs:
${JSON.stringify(logSummary, null, 2)}

Generate:
1. Appropriate hourly rate based on project budget and scope
2. Line items grouped by task/phase
3. Professional descriptions for each line item
4. Subtotal, tax (18% GST), and total
5. Invoice notes/terms`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        hourly_rate: { type: "number" },
                        line_items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    description: { type: "string" },
                                    hours: { type: "number" },
                                    rate: { type: "number" },
                                    amount: { type: "number" }
                                }
                            }
                        },
                        subtotal: { type: "number" },
                        tax_percentage: { type: "number" },
                        total: { type: "number" },
                        notes: { type: "string" }
                    }
                }
            });

            const invoiceNumber = `INV-${Date.now()}`;
            const invoiceDate = new Date().toISOString().split('T')[0];
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            // Add log IDs to line items for tracking
            const lineItemsWithLogs = invoiceData.line_items.map((item, idx) => ({
                ...item,
                log_id: uninvoicedLogs[idx]?.id
            }));

            const invoice = await base44.asServiceRole.entities.Invoice.create({
                project_id,
                invoice_number: invoiceNumber,
                client_email: project[0].client_email,
                invoice_date: invoiceDate,
                due_date: dueDate.toISOString().split('T')[0],
                status: 'draft',
                line_items: lineItemsWithLogs,
                subtotal: invoiceData.subtotal,
                tax_percentage: invoiceData.tax_percentage,
                total: invoiceData.total,
                notes: invoiceData.notes
            });

            return Response.json({ success: true, invoice });
        }

        if (action === 'sendInvoice') {
            const invoices = await base44.asServiceRole.entities.Invoice.filter({ id: invoice_id });
            if (!invoices || invoices.length === 0) {
                throw new Error('Invoice not found');
            }

            const invoice = invoices[0];
            const project = await base44.asServiceRole.entities.ClientProject.filter({ 
                id: invoice.project_id 
            });

            const lineItemsHtml = invoice.line_items.map(item => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.hours}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.rate}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.amount}</td>
                </tr>
            `).join('');

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: invoice.client_email,
                subject: `Invoice ${invoice.invoice_number} - ${project[0]?.project_name || 'Your Project'}`,
                body: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 30px; text-align: center; }
        .invoice-details { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
        .totals { text-align: right; margin: 20px 0; }
        .total-row { font-size: 18px; font-weight: bold; color: #DC2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>INVOICE</h1>
            <p>EyE PunE - Your All-in-One Growth Partner</p>
        </div>

        <div class="invoice-details">
            <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>
            <p><strong>Project:</strong> ${project[0]?.project_name || 'N/A'}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Hours</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${lineItemsHtml}
            </tbody>
        </table>

        <div class="totals">
            <p><strong>Subtotal:</strong> ₹${invoice.subtotal}</p>
            <p><strong>Tax (${invoice.tax_percentage}%):</strong> ₹${(invoice.total - invoice.subtotal).toFixed(2)}</p>
            <p class="total-row"><strong>Total:</strong> ₹${invoice.total}</p>
        </div>

        ${invoice.notes ? `<div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #DC2626;">
            <p><strong>Notes:</strong></p>
            <p>${invoice.notes}</p>
        </div>` : ''}

        <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; text-align: center;">
            <p>Thank you for your business!</p>
            <p>For payment inquiries: connect@eyepune.com | +91 9284712033</p>
        </div>
    </div>
</body>
</html>
                `.trim()
            });

            await base44.asServiceRole.entities.Invoice.update(invoice_id, {
                status: 'sent'
            });

            return Response.json({ success: true, message: 'Invoice sent successfully' });
        }

        if (action === 'sendPaymentReminders') {
            const overdueInvoices = await base44.asServiceRole.entities.Invoice.list();
            const today = new Date().toISOString().split('T')[0];
            
            const reminders = [];
            
            for (const invoice of overdueInvoices) {
                if (invoice.status !== 'paid' && invoice.due_date < today) {
                    const project = await base44.asServiceRole.entities.ClientProject.filter({ 
                        id: invoice.project_id 
                    });

                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: invoice.client_email,
                        subject: `Payment Reminder: Invoice ${invoice.invoice_number}`,
                        body: `
Hi ${project[0]?.client_name || 'there'},

This is a friendly reminder that Invoice ${invoice.invoice_number} for ${project[0]?.project_name || 'your project'} is overdue.

Invoice Amount: ₹${invoice.total}
Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}

Please process the payment at your earliest convenience. If you have any questions or concerns, feel free to reach out.

Thank you for your prompt attention to this matter!

Best regards,
The EyE PunE Team

---
Connect - Engage - Grow
EyE PunE | Your All-in-One Growth Partner
                        `.trim()
                    });

                    reminders.push({
                        invoice_number: invoice.invoice_number,
                        client_email: invoice.client_email,
                        amount: invoice.total
                    });
                }
            }

            return Response.json({ 
                success: true, 
                message: `Sent ${reminders.length} payment reminders`,
                reminders 
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Invoice manager error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});