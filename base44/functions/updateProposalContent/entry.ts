import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only admins can edit proposal content
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { proposal_id, updates } = await req.json();
    if (!proposal_id) return Response.json({ error: 'proposal_id required' }, { status: 400 });

    await base44.asServiceRole.entities.Proposal.update(proposal_id, updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error('updateProposalContent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});