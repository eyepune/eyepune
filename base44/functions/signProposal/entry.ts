import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { proposal_id, signature_name, client_ip } = await req.json();

    if (!proposal_id || !signature_name) {
      return Response.json({ error: 'proposal_id and signature_name required' }, { status: 400 });
    }

    // Use service role — signer may not be logged in
    const proposals = await base44.asServiceRole.entities.Proposal.filter({ id: proposal_id });
    const proposal = proposals[0];
    if (!proposal) return Response.json({ error: 'not_found' }, { status: 404 });
    if (proposal.status === 'accepted') return Response.json({ error: 'already_signed' }, { status: 409 });

    await base44.asServiceRole.entities.Proposal.update(proposal_id, {
      status: 'accepted',
      client_signed_at: new Date().toISOString(),
      client_signed_ip: client_ip || 'unknown',
      client_signature_name: signature_name,
    });

    // Notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'connect@eyepune.com',
      subject: `✍️ Proposal Signed: ${proposal.project_title}`,
      body: `<b>${proposal.client_name}</b> signed proposal <b>#${proposal.proposal_number}</b> for <b>${proposal.project_title}</b>.<br/><br/>Signed at: ${new Date().toLocaleString()}<br/>IP: ${client_ip}<br/>Signature: ${signature_name}<br/><br/>Total: ₹${(proposal.total_amount || 0).toLocaleString()}<br/><br/>An invoice will be auto-generated shortly.`,
    }).catch(() => {});

    return Response.json({ success: true });
  } catch (error) {
    console.error('signProposal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});