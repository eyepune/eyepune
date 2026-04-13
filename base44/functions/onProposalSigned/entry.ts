import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;
    if (event?.type !== 'update') return Response.json({ ok: true });

    const proposal = data;
    if (proposal?.status !== 'accepted' || proposal?.invoice_created) {
      return Response.json({ ok: true, skipped: true });
    }

    // Create invoice automatically
    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await base44.asServiceRole.entities.Invoice.create({
      proposal_id: proposal.id,
      invoice_number: invNum,
      client_name: proposal.client_name,
      client_email: proposal.client_email,
      client_phone: proposal.client_phone || '',
      company_name: proposal.company_name || '',
      invoice_date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      line_items: proposal.pricing_items || [],
      subtotal: proposal.total_amount || 0,
      tax_percentage: 18,
      tax_amount: (proposal.total_amount || 0) * 0.18,
      total: (proposal.total_amount || 0) * 1.18,
      billing_type: proposal.payment_schedule === 'monthly' || proposal.payment_schedule === 'quarterly' ? 'recurring' : 'one_time',
      recurring_interval: proposal.payment_schedule === 'monthly' ? 'monthly' : proposal.payment_schedule === 'quarterly' ? 'quarterly' : 'monthly',
      status: 'draft',
      notes: `Thank you for signing the proposal! Payment due within 7 days.`,
    });

    // Mark proposal as invoice created
    await base44.asServiceRole.entities.Proposal.update(proposal.id, { invoice_created: true });

    // Auto-send invoice (best effort)
    await base44.asServiceRole.functions.invoke('sendInvoiceToClient', { invoice_id: invoice.id }).catch(e => console.error('invoice send error:', e.message));

    // Log activity if lead linked
    if (proposal.lead_id) {
      await base44.asServiceRole.entities.Activity.create({
        lead_id: proposal.lead_id,
        activity_type: 'payment',
        title: 'Invoice Auto-Generated & Sent',
        description: `Invoice ${invNum} created and sent to ${proposal.client_email} after proposal signing.`,
        performed_by: 'system',
      }).catch(() => {});

      // Update lead status to closed_won
      await base44.asServiceRole.entities.Lead.update(proposal.lead_id, {
        status: 'closed_won',
      }).catch(() => {});
    }

    return Response.json({ success: true, invoice_id: invoice.id });
  } catch (error) {
    console.error('onProposalSigned error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});