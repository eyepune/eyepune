import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import nodemailer from 'npm:nodemailer@6.9.9';

const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.eyepune.com';

function buildProposalEmail(proposal) {
  const items = (proposal.pricing_items || []).map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${i.description}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">₹${(i.amount || 0).toLocaleString()}</td></tr>`
  ).join('');

  const signUrl = `${SITE_URL}/SignProposal?id=${proposal.id}`;

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;">
  <div style="background:#040404;padding:30px 40px;text-align:center;">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:45px;"/>
    <p style="color:#888;font-size:11px;margin:6px 0 0;">Connect · Engage · Grow</p>
  </div>
  <div style="padding:40px;">
    <p style="color:#888;font-size:12px;margin:0 0 4px;">PROPOSAL #${proposal.proposal_number || 'EP-001'}</p>
    <h2 style="color:#1a1a1a;margin:0 0 4px;">${proposal.project_title}</h2>
    <p style="color:#666;margin:0 0 24px;">Prepared for <strong>${proposal.client_name}</strong>${proposal.company_name ? ` · ${proposal.company_name}` : ''}</p>

    ${proposal.executive_summary ? `<div style="background:#fafafa;border-left:4px solid #e53e3e;padding:16px 20px;margin-bottom:24px;border-radius:0 8px 8px 0;">
      <p style="font-weight:700;color:#1a1a1a;margin:0 0 6px;">Overview</p>
      <p style="color:#555;line-height:1.7;margin:0;">${proposal.executive_summary}</p>
    </div>` : ''}

    ${proposal.scope_of_work ? `<div style="margin-bottom:24px;">
      <p style="font-weight:700;color:#1a1a1a;margin:0 0 8px;">Scope of Work</p>
      <p style="color:#555;line-height:1.7;margin:0;white-space:pre-line;">${proposal.scope_of_work}</p>
    </div>` : ''}

    ${items ? `<div style="margin-bottom:24px;">
      <p style="font-weight:700;color:#1a1a1a;margin:0 0 8px;">Investment</p>
      <table style="width:100%;border-collapse:collapse;background:#fafafa;border-radius:8px;overflow:hidden;">
        <thead><tr style="background:#040404;"><th style="padding:10px 12px;text-align:left;color:#fff;font-size:13px;">Service</th><th style="padding:10px 12px;text-align:right;color:#fff;font-size:13px;">Amount</th></tr></thead>
        <tbody>${items}</tbody>
        <tfoot><tr style="background:#e53e3e;"><td style="padding:12px;font-weight:700;color:#fff;">Total</td><td style="padding:12px;font-weight:700;color:#fff;text-align:right;">₹${(proposal.total_amount || 0).toLocaleString()}</td></tr></tfoot>
      </table>
    </div>` : ''}

    ${proposal.timeline ? `<p style="color:#555;margin-bottom:24px;"><strong>Timeline:</strong> ${proposal.timeline}</p>` : ''}

    <div style="text-align:center;background:#fff5f5;border:2px solid #e53e3e;border-radius:12px;padding:28px;margin:28px 0;">
      <p style="font-weight:700;font-size:18px;color:#1a1a1a;margin:0 0 6px;">Ready to get started?</p>
      <p style="color:#666;font-size:14px;margin:0 0 20px;">Review and e-sign your proposal below. This proposal is valid until ${proposal.valid_until || '30 days from today'}.</p>
      <a href="${signUrl}" style="display:inline-block;background:#e53e3e;color:#fff;padding:14px 36px;border-radius:8px;font-weight:700;font-size:16px;text-decoration:none;">
        ✍️ Review & Sign Proposal
      </a>
    </div>

    <p style="color:#999;font-size:12px;text-align:center;">Questions? Reply to this email or WhatsApp us at +91 9284712033</p>
  </div>
  <div style="background:#040404;padding:20px 40px;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">EyE PunE · connect@eyepune.com · +91 9284712033 · Pune, Maharashtra</p>
  </div>
</div></body></html>`;
}

function buildWhatsAppText(proposal) {
  const signUrl = `${SITE_URL}/SignProposal?id=${proposal.id}`;
  return `Hi ${proposal.client_name}! 👋

We've prepared your proposal for *${proposal.project_title}*.

📋 *Proposal #${proposal.proposal_number || 'EP-001'}*
💰 Total Investment: ₹${(proposal.total_amount || 0).toLocaleString()}
📅 Valid Until: ${proposal.valid_until || '30 days'}

Review and e-sign here:
${signUrl}

Any questions? Just reply here!

— *EyE PunE Team* 🚀`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { proposal_id } = await req.json();
    const proposals = await base44.asServiceRole.entities.Proposal.filter({ id: proposal_id });
    const proposal = proposals[0];
    if (!proposal) return Response.json({ error: 'Proposal not found' }, { status: 404 });

    const smtpPort = parseInt(Deno.env.get('ZOHO_MAIL_SMTP_PORT') || '587');
    const transporter = nodemailer.createTransport({
      host: Deno.env.get('ZOHO_MAIL_SMTP_HOST'),
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: Deno.env.get('ZOHO_MAIL_USERNAME'), pass: Deno.env.get('ZOHO_MAIL_PASSWORD') },
    });

    await transporter.sendMail({
      from: `"EyE PunE" <${Deno.env.get('ZOHO_MAIL_USERNAME')}>`,
      to: proposal.client_email,
      subject: `Your Proposal: ${proposal.project_title} — Ready for Review ✍️`,
      html: buildEmailHTML(proposal),
    });

    const waText = buildWhatsAppText(proposal);
    const waLink = proposal.client_phone
      ? `https://wa.me/${proposal.client_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`
      : null;

    await base44.asServiceRole.entities.Proposal.update(proposal.id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (proposal.lead_id) {
      await base44.asServiceRole.entities.Activity.create({
        lead_id: proposal.lead_id,
        activity_type: 'email',
        title: 'Proposal Sent',
        description: `Proposal #${proposal.proposal_number} sent to ${proposal.client_email}`,
        performed_by: user.email,
      }).catch(() => {});
    }

    return Response.json({ success: true, wa_link: waLink });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildEmailHTML(proposal) {
  return buildProposalEmail(proposal);
}