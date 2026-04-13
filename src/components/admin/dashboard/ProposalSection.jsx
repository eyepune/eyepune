import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Send, FileText, CheckCircle2, Clock, X, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS = {
  draft: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-blue-500/20 text-blue-400',
  viewed: 'bg-yellow-500/20 text-yellow-400',
  accepted: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const EMPTY = {
  client_name: '', client_email: '', client_phone: '', company_name: '', project_title: '',
  project_type: 'web_app', executive_summary: '', scope_of_work: '', timeline: '',
  total_amount: '', payment_schedule: 'one_time', validity_days: 30,
  pricing_items: [{ description: '', amount: '' }],
  notes: '', lead_id: '',
};

export default function ProposalSection({ defaultLead = null }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(!!defaultLead);
  const [form, setForm] = useState(defaultLead ? {
    ...EMPTY,
    client_name: defaultLead.full_name || '',
    client_email: defaultLead.email || '',
    client_phone: defaultLead.phone || '',
    company_name: defaultLead.company || '',
    lead_id: defaultLead.id || '',
  } : { ...EMPTY });
  const [sending, setSending] = useState(null);

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 200),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-proposal'],
    queryFn: () => base44.entities.Lead.list('-created_date', 500),
  });

  const createProposal = useMutation({
    mutationFn: (data) => base44.entities.Proposal.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['proposals']);
      setShowForm(false);
      setForm({ ...EMPTY });
      toast.success('Proposal created!');
    },
  });

  const deleteProposal = useMutation({
    mutationFn: (id) => base44.entities.Proposal.delete(id),
    onSuccess: () => { qc.invalidateQueries(['proposals']); toast.success('Deleted'); },
  });

  const updateItem = (i, key, val) => {
    const items = [...form.pricing_items];
    items[i] = { ...items[i], [key]: val };
    setForm({ ...form, pricing_items: items });
  };

  const totalCalc = form.pricing_items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const handleSave = () => {
    if (!form.client_name || !form.client_email || !form.project_title) {
      toast.error('Client name, email and project title are required');
      return;
    }
    const propNum = `EP-${Date.now().toString().slice(-6)}`;
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + (parseInt(form.validity_days) || 30));
    createProposal.mutate({
      ...form,
      proposal_number: propNum,
      total_amount: totalCalc,
      valid_until: validDate.toISOString().split('T')[0],
      pricing_items: form.pricing_items.filter(i => i.description).map(i => ({ ...i, amount: parseFloat(i.amount) || 0 })),
    });
  };

  const handleSend = async (proposal) => {
    setSending(proposal.id);
    try {
      const res = await base44.functions.invoke('sendProposalToClient', { proposal_id: proposal.id });
      qc.invalidateQueries(['proposals']);
      toast.success('Proposal sent via email!');
      if (res.data?.wa_link) {
        window.open(res.data.wa_link, '_blank');
      }
    } catch (e) {
      toast.error('Send failed: ' + e.message);
    }
    setSending(null);
  };

  const prefillFromLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) setForm(f => ({
      ...f, lead_id: leadId,
      client_name: lead.full_name || f.client_name,
      client_email: lead.email || f.client_email,
      client_phone: lead.phone || f.client_phone,
      company_name: lead.company || f.company_name,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Proposals</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">New Proposal</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          {/* Prefill from lead */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Prefill from CRM Lead (optional)</label>
            <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
              value={form.lead_id} onChange={e => prefillFromLead(e.target.value)}>
              <option value="">— Select lead —</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>)}
            </select>
          </div>

          {/* Client Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'client_name', label: 'Client Name *', ph: 'Full name' },
              { key: 'client_email', label: 'Client Email *', ph: 'email@example.com' },
              { key: 'client_phone', label: 'Phone', ph: '+91...' },
              { key: 'company_name', label: 'Company', ph: 'Company name' },
              { key: 'project_title', label: 'Project Title *', ph: 'e.g. Social Media Growth Package' },
            ].map(({ key, label, ph }) => (
              <div key={key} className={key === 'project_title' ? 'sm:col-span-2' : ''}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Project Type</label>
              <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
                value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
                {['social_media', 'web_app', 'ai_automation', 'branding', 'full_service'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Payment Schedule</label>
              <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
                value={form.payment_schedule} onChange={e => setForm({ ...form, payment_schedule: e.target.value })}>
                {['one_time', '50_50', 'monthly', 'quarterly'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary & Scope */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Executive Summary</label>
              <textarea rows={3} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
                placeholder="Brief overview of what you'll deliver and the expected results..."
                value={form.executive_summary} onChange={e => setForm({ ...form, executive_summary: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Scope of Work</label>
              <textarea rows={4} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
                placeholder="Detailed description of work to be done..."
                value={form.scope_of_work} onChange={e => setForm({ ...form, scope_of_work: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Timeline</label>
                <input className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder="e.g. 4 weeks" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Valid for (days)</label>
                <input type="number" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  value={form.validity_days} onChange={e => setForm({ ...form, validity_days: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pricing Items</label>
              <button onClick={() => setForm({ ...form, pricing_items: [...form.pricing_items, { description: '', amount: '' }] })}
                className="text-xs text-red-400 hover:text-red-300">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {form.pricing_items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none"
                    placeholder="Service description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                  <input type="number" className="w-32 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none"
                    placeholder="Amount ₹" value={item.amount} onChange={e => updateItem(i, 'amount', e.target.value)} />
                  {form.pricing_items.length > 1 && (
                    <button onClick={() => setForm({ ...form, pricing_items: form.pricing_items.filter((_, j) => j !== i) })}
                      className="text-gray-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-white font-bold text-lg">Total: ₹{totalCalc.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Internal Notes</label>
            <textarea rows={2} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
              placeholder="Internal notes (not visible to client)..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={createProposal.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
              {createProposal.isPending ? 'Creating...' : 'Create Proposal'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-3">
        {proposals.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-600">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No proposals yet. Create your first one!</p>
          </div>
        )}
        {proposals.map(p => (
          <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600 font-mono">#{p.proposal_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-gray-500/20 text-gray-400'}`}>{p.status}</span>
                  {p.client_signed_at && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Signed</span>}
                </div>
                <h3 className="text-white font-bold mt-1 truncate">{p.project_title}</h3>
                <p className="text-gray-500 text-sm">{p.client_name} · {p.client_email}{p.company_name ? ` · ${p.company_name}` : ''}</p>
                {p.total_amount > 0 && <p className="text-green-400 font-bold mt-1">₹{p.total_amount.toLocaleString()}</p>}
                {p.client_signed_at && (
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Signed {format(new Date(p.client_signed_at), 'MMM d, yyyy h:mm a')}
                    {p.client_signed_ip && ` · IP: ${p.client_signed_ip}`}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleSend(p)}
                  disabled={sending === p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-medium"
                >
                  <Send className="w-3 h-3" /> {sending === p.id ? 'Sending...' : 'Send'}
                </button>
                <a href={`/SignProposal?id=${p.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-gray-400 rounded-xl text-xs">
                  <ExternalLink className="w-3 h-3" /> Preview
                </a>
                <button onClick={() => deleteProposal.mutate(p.id)}
                  className="p-1.5 hover:bg-red-500/20 text-gray-600 hover:text-red-400 rounded-xl">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}