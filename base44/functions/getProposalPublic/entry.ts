import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { proposal_id } = await req.json();

    if (!proposal_id) {
      return Response.json({ error: 'proposal_id required' }, { status: 400 });
    }

    // Use service role to bypass RLS — public sign link access
    const proposals = await base44.asServiceRole.entities.Proposal.filter({ id: proposal_id });
    const proposal = proposals[0];

    if (!proposal) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }

    // Mark as viewed if it was sent
    if (proposal.status === 'sent') {
      await base44.asServiceRole.entities.Proposal.update(proposal.id, {
        status: 'viewed',
        viewed_at: new Date().toISOString(),
      }).catch(() => {});
    }

    return Response.json({ proposal });
  } catch (error) {
    console.error('getProposalPublic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});