import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertCircle, Loader2, Clock, Shield, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_TERMS = `1. Acceptance: By signing this proposal, the Client agrees to engage EyE PunE ("Agency") for the services described above under the terms stated herein.

2. Payment: Invoices are due as per the payment schedule outlined. Late payments beyond 7 days may attract a 2% monthly interest charge. Work may be paused until outstanding amounts are cleared.

3. Scope: Any work outside the agreed scope will be quoted separately. The Agency reserves the right to revise timelines if scope changes are requested mid-project.

4. Intellectual Property: All deliverables become the property of the Client upon receipt of full payment. The Agency retains the right to showcase the work in its portfolio unless explicitly requested otherwise in writing.

5. Confidentiality: Both parties agree to keep all shared business information confidential and not to disclose it to third parties without written consent.

6. Revisions: The number of revisions included is as agreed in the scope. Additional revision rounds will be billed at ₹2,000/hour.

7. Cancellation: If the Client cancels after work has commenced, the Agency is entitled to payment for all work completed to date. A minimum 25% cancellation fee applies.

8. Limitation of Liability: The Agency's total liability shall not exceed the total fees paid under this proposal. The Agency is not liable for indirect, incidental, or consequential damages.

9. Governing Law: This agreement is governed by the laws of Maharashtra, India. Any disputes shall be subject to the jurisdiction of courts in Pune.

10. Force Majeure: Neither party shall be liable for delays caused by circumstances beyond their reasonable control.`;

export default function SignProposal() {
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  // Signing
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signName, setSignName] = useState('');
  const [signError, setSignError] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!proposalId) { setError('missing_id'); setLoading(false); return; }
    base44.functions.invoke('getProposalPublic', { proposal_id: proposalId })
      .then(res => {
        if (res.data?.proposal) { setProposal(res.data.proposal); setDraft(res.data.proposal); }
        else setError('not_found');
      })
      .catch(() => setError('not_found'))
      .finally(() => setLoading(false));
  }, [proposalId]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateProposalContent', {
        proposal_id: proposalId,
        updates: {
          project_title: draft.project_title,
          executive_summary: draft.executive_summary,
          scope_of_work: draft.scope_of_work,
          pricing_items: draft.pricing_items,
          total_amount: draft.pricing_items?.reduce((s, i) => s + (Number(i.amount) || 0), 0),
          timeline: draft.timeline,
          notes: draft.notes,
          terms_and_conditions: draft.terms_and_conditions,
        }
      });
      setProposal({ ...draft, total_amount: draft.pricing_items?.reduce((s, i) => s + (Number(i.amount) || 0), 0) });
      setEditMode(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const updatePricingItem = (i, field, val) => {
    const items = [...(draft.pricing_items || [])];
    items[i] = { ...items[i], [field]: field === 'amount' ? Number(val) : val };
    setDraft(d => ({ ...d, pricing_items: items }));
  };

  const addPricingItem = () => setDraft(d => ({ ...d, pricing_items: [...(d.pricing_items || []), { description: '', amount: 0 }] }));
  const removePricingItem = (i) => setDraft(d => ({ ...d, pricing_items: d.pricing_items.filter((_, idx) => idx !== i) }));

  const handleSign = async () => {
    if (!termsAccepted) { setSignError('Please accept the terms and conditions first.'); return; }
    if (!signName.trim()) { setSignError('Please type your full legal name to sign.'); return; }
    setSigning(true); setSignError('');
    let ip = 'unknown';
    try { const r = await fetch('https://api.ipify.org?format=json'); ip = (await r.json()).ip; } catch (_) {}
    try {
      const res = await base44.functions.invoke('signProposal', { proposal_id: proposalId, signature_name: signName, client_ip: ip });
      if (res.data?.success) setSigned(true);
      else setSignError(res.data?.error || 'Failed to sign. Please try again.');
    } catch (e) { setSignError('Failed to sign. Please try again.'); }
    setSigning(false);
  };

  const draftTotal = draft?.pricing_items?.reduce((s, i) => s + (Number(i.amount) || 0), 0) || 0;

  if (loading) return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-white mb-2">Proposal Not Found</h1>
        <p className="text-gray-500">This link may have expired or is invalid. Please contact EyE PunE for assistance.</p>
        <a href="mailto:connect@eyepune.com" className="mt-6 inline-block text-red-400 hover:text-red-300 text-sm">connect@eyepune.com</a>
      </div>
    </div>
  );

  if (signed || proposal.status === 'accepted') return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Proposal Signed!</h1>
        <p className="text-gray-400 mb-6">Thank you, {proposal.client_name}. We'll be in touch shortly with your invoice.</p>
        {proposal.client_signed_at && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-left text-sm space-y-2">
            <p className="text-gray-500">Signed by: <span className="text-white font-medium">{proposal.client_signature_name}</span></p>
            <p className="text-gray-500">Date: <span className="text-white">{format(new Date(proposal.client_signed_at), 'PPpp')}</span></p>
            {proposal.client_signed_ip && <p className="text-gray-500">IP: <span className="text-white font-mono text-xs">{proposal.client_signed_ip}</span></p>}
          </div>
        )}
        <a href="/" className="mt-6 inline-block text-gray-500 hover:text-white text-sm transition-colors">← Back to EyE PunE</a>
      </div>
    </div>
  );

  const displayData = editMode ? draft : proposal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#040404] py-5 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png"
            alt="EyE PunE" className="h-9"
          />
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-xs font-mono">#{proposal.proposal_number}</span>
            {!editMode ? (
              <button onClick={() => { setDraft(proposal); setEditMode(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.07] hover:bg-white/[0.12] text-gray-300 rounded-lg text-xs transition-all">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveDraft} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs transition-all disabled:opacity-50">
                  <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditMode(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.07] text-gray-400 rounded-lg text-xs transition-all">
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Title card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Business Proposal</p>
          {editMode ? (
            <input
              className="w-full text-2xl font-bold text-gray-900 border-b-2 border-red-300 focus:border-red-500 outline-none pb-1 mb-2 bg-transparent"
              value={draft.project_title}
              onChange={e => setDraft(d => ({ ...d, project_title: e.target.value }))}
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{proposal.project_title}</h1>
          )}
          <p className="text-gray-500 mt-1">
            Prepared for <strong>{proposal.client_name}</strong>
            {proposal.company_name ? ` · ${proposal.company_name}` : ''}
          </p>
          <div className="flex gap-4 mt-3 flex-wrap text-sm items-center">
            {(editMode ? draftTotal : displayData.total_amount) > 0 && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold">
                ₹{(editMode ? draftTotal : displayData.total_amount).toLocaleString()}
              </span>
            )}
            {editMode ? (
              <input
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Timeline (e.g. 4-6 weeks)"
                value={draft.timeline || ''}
                onChange={e => setDraft(d => ({ ...d, timeline: e.target.value }))}
              />
            ) : proposal.timeline && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {proposal.timeline}
              </span>
            )}
            {proposal.valid_until && (
              <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs">
                Valid until {proposal.valid_until}
              </span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-red-500 rounded-full" /> Overview
          </h2>
          {editMode ? (
            <textarea
              className="w-full text-gray-600 leading-relaxed border border-gray-200 rounded-xl p-3 outline-none focus:border-red-400 resize-none text-sm"
              rows={6}
              value={draft.executive_summary || ''}
              onChange={e => setDraft(d => ({ ...d, executive_summary: e.target.value }))}
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">{proposal.executive_summary}</p>
          )}
        </div>

        {/* Scope */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-red-500 rounded-full" /> Scope of Work
          </h2>
          {editMode ? (
            <textarea
              className="w-full text-gray-600 leading-relaxed border border-gray-200 rounded-xl p-3 outline-none focus:border-red-400 resize-none text-sm"
              rows={10}
              value={draft.scope_of_work || ''}
              onChange={e => setDraft(d => ({ ...d, scope_of_work: e.target.value }))}
            />
          ) : (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{proposal.scope_of_work}</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-red-500 rounded-full" /> Investment Breakdown
          </h2>
          {editMode ? (
            <div className="space-y-2">
              {(draft.pricing_items || []).map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                    placeholder="Service description"
                    value={item.description}
                    onChange={e => updatePricingItem(i, 'description', e.target.value)}
                  />
                  <input
                    className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 text-right"
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={e => updatePricingItem(i, 'amount', e.target.value)}
                  />
                  <button onClick={() => removePricingItem(i)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addPricingItem} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm mt-2 transition-colors">
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-lg">
                <span>Total</span>
                <span className="text-red-600">₹{draftTotal.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 uppercase pb-2 font-semibold tracking-wider">Service</th>
                  <th className="text-right text-xs text-gray-400 uppercase pb-2 font-semibold tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(proposal.pricing_items || []).map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 text-gray-700">{item.description}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">₹{(item.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-4 font-bold text-gray-900 text-lg">Total</td>
                  <td className="pt-4 text-right font-bold text-red-600 text-xl">₹{(proposal.total_amount || 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
          {proposal.payment_schedule && proposal.payment_schedule !== 'one_time' && (
            <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              💳 Payment schedule: <strong className="capitalize">{proposal.payment_schedule.replace('_', ' ')}</strong>
            </p>
          )}
        </div>

        {/* Notes */}
        {(proposal.notes || editMode) && (
          <div className={editMode ? "bg-white rounded-2xl shadow-sm border border-gray-100 p-6" : "bg-blue-50 rounded-2xl border border-blue-100 p-5"}>
            {editMode ? (
              <>
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-400 rounded-full" /> Additional Notes
                </h2>
                <textarea
                  className="w-full text-gray-600 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-400 resize-none text-sm"
                  rows={4}
                  value={draft.notes || ''}
                  onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                  placeholder="Any additional notes or conditions..."
                />
              </>
            ) : (
              <p className="text-blue-700 text-sm leading-relaxed">{proposal.notes}</p>
            )}
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gray-400 rounded-full" /> Terms & Conditions
          </h2>
          {editMode ? (
            <textarea
              className="w-full text-gray-600 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-400 resize-none text-sm leading-relaxed"
              rows={18}
              value={draft.terms_and_conditions || DEFAULT_TERMS}
              onChange={e => setDraft(d => ({ ...d, terms_and_conditions: e.target.value }))}
            />
          ) : (
            <div className="text-sm text-gray-600 leading-relaxed max-h-64 overflow-y-auto pr-2 whitespace-pre-line">
              {proposal.terms_and_conditions || DEFAULT_TERMS}
            </div>
          )}
        </div>

        {/* E-Sign */}
        {!editMode && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-red-100 p-6">
            <div className="flex items-start gap-3 mb-5">
              <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Accept & E-Sign this Proposal</h2>
                <p className="text-gray-500 text-sm mt-1">
                  By signing, you confirm you have read and agree to all terms above. This constitutes a legally binding electronic signature with timestamp and IP verification.
                </p>
              </div>
            </div>

            {/* Terms acceptance checkbox */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <div
                className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  termsAccepted ? 'bg-red-600 border-red-600' : 'border-gray-300 group-hover:border-red-400'
                }`}
                onClick={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-gray-700 text-sm leading-relaxed select-none" onClick={() => setTermsAccepted(!termsAccepted)}>
                I have read, understood, and agree to the <strong>Terms & Conditions</strong> stated above. I confirm that I am authorised to sign on behalf of <strong>{proposal.company_name || proposal.client_name}</strong> and that this electronic signature is legally binding.
              </span>
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type your full legal name to sign *
                </label>
                <input
                  className="w-full border-2 border-gray-200 focus:border-red-500 rounded-xl px-4 py-3 text-xl outline-none transition-colors placeholder-gray-300"
                  style={{ fontFamily: 'cursive' }}
                  placeholder="Your full name"
                  value={signName}
                  onChange={e => setSignName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSign()}
                />
              </div>

              {signError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {signError}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                <p className="flex items-center gap-2">📅 <span>Timestamp will be recorded: <strong>{new Date().toLocaleString('en-IN')}</strong></span></p>
                <p className="flex items-center gap-2">🌐 <span>Your IP address will be captured for legal verification</span></p>
                <p className="flex items-center gap-2">📧 <span>A confirmation will be sent to <strong>support@eyepune.com</strong></span></p>
              </div>

              <button
                onClick={handleSign}
                disabled={signing || !signName.trim() || !termsAccepted}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                {signing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing...
                  </span>
                ) : '✍️ Accept & Sign Proposal'}
              </button>

              <p className="text-center text-xs text-gray-400">
                🔒 This document is secured with timestamp, IP logging, and audit trail. Powered by EyE PunE.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-gray-400 text-xs">
            Questions? <a href="mailto:connect@eyepune.com" className="text-red-500 hover:underline">connect@eyepune.com</a> · <a href="https://wa.me/919284712033" className="text-red-500 hover:underline">+91 9284712033</a>
          </p>
        </div>
      </div>
    </div>
  );
}