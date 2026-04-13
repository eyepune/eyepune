import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Send, Receipt, CheckCircle2, X, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS = {
  draft: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-700/40 text-gray-600',
};

const EMPTY = {
  client_name: '', client_email: '', client_phone: '', company_name: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  billing_type: 'one_time', recurring_interval: 'monthly',
  tax_percentage: 18, notes: '',
  line_items: [{ description: '', amount: '' }],
};

export default function InvoiceSection({ defaultProposal = null }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(!!defaultProposal);
  const [form, setForm] = useState(defaultProposal ? {
    ...EMPTY,
    client_name: defaultProposal.client_name || '',
    client_email: defaultProposal.client_email || '',
    client_phone: defaultProposal.client_phone || '',
    company_name: defaultProposal.company_name || '',
    proposal_id: defaultProposal.id || '',
    line_items: (defaultProposal.pricing_items || [{ description: '', amount: '' }]).map(i => ({ description: i.description || '', amount: i.amount || '' })),
  } : { ...EMPTY });
  const [sending, setSending] = useState(null);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 200),
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals-inv'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 200),
  });

  const createInvoice = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['invoices']);
      setShowForm(false);
      setForm({ ...EMPTY });
      toast.success('Invoice created!');
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => { qc.invalidateQueries(['invoices']); toast.success('Deleted'); },
  });

  const updateItem = (i, key, val) => {
    const items = [...form.line_items];
    items[i] = { ...items[i], [key]: val };
    setForm({ ...form, line_items: items });
  };

  const subtotal = form.line_items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const taxAmt = subtotal * (parseFloat(form.tax_percentage) || 0) / 100;
  const total = subtotal + taxAmt;

  const prefillFromProposal = (pid) => {
    const p = proposals.find(x => x.id === pid);
    if (p) setForm(f => ({
      ...f, proposal_id: pid,
      client_name: p.client_name, client_email: p.client_email,
      client_phone: p.client_phone || f.client_phone,
      company_name: p.company_name || f.company_name,
      line_items: (p.pricing_items || []).length > 0
        ? p.pricing_items.map(i => ({ description: i.description, amount: i.amount }))
        : [{ description: '', amount: '' }],
    }));
  };

  const handleSave = () => {
    if (!form.client_email || !form.client_name) { toast.error('Client name & email required'); return; }
    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    createInvoice.mutate({
      ...form,
      invoice_number: invNum,
      subtotal,
      tax_amount: taxAmt,
      total,
      line_items: form.line_items.filter(i => i.description).map(i => ({ ...i, amount: parseFloat(i.amount) || 0 })),
    });
  };

  const handleSend = async (invoice) => {
    setSending(invoice.id);
    try {
      const res = await base44.functions.invoke('sendInvoiceToClient', { invoice_id: invoice.id });
      qc.invalidateQueries(['invoices']);
      toast.success('Invoice sent!');
      if (res.data?.wa_link) window.open(res.data.wa_link, '_blank');
      if (res.data?.payment_link) toast.success(`Payment link: ${res.data.payment_link}`);
    } catch (e) {
      toast.error('Send failed: ' + e.message);
    }
    setSending(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Invoices</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">New Invoice</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Prefill from Proposal (optional)</label>
            <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
              value={form.proposal_id || ''} onChange={e => prefillFromProposal(e.target.value)}>
              <option value="">— Select proposal —</option>
              {proposals.filter(p => p.status === 'accepted').map(p => (
                <option key={p.id} value={p.id}>#{p.proposal_number} — {p.client_name} — {p.project_title}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'client_name', label: 'Client Name *', ph: 'Full name' },
              { key: 'client_email', label: 'Client Email *', ph: 'email@example.com' },
              { key: 'client_phone', label: 'Phone', ph: '+91...' },
              { key: 'company_name', label: 'Company', ph: 'Company name' },
              { key: 'invoice_date', label: 'Invoice Date', type: 'date' },
              { key: 'due_date', label: 'Due Date', type: 'date' },
            ].map(({ key, label, ph, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type={type || 'text'} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Billing Type</label>
              <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
                value={form.billing_type} onChange={e => setForm({ ...form, billing_type: e.target.value })}>
                <option value="one_time">One-Time Payment</option>
                <option value="recurring">Recurring (Auto-charge)</option>
              </select>
            </div>
            {form.billing_type === 'recurring' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Recurring Interval</label>
                <select className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm"
                  value={form.recurring_interval} onChange={e => setForm({ ...form, recurring_interval: e.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">GST %</label>
              <input type="number" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                value={form.tax_percentage} onChange={e => setForm({ ...form, tax_percentage: e.target.value })} />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Line Items</label>
              <button onClick={() => setForm({ ...form, line_items: [...form.line_items, { description: '', amount: '' }] })}
                className="text-xs text-red-400 hover:text-red-300">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {form.line_items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none"
                    placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                  <input type="number" className="w-32 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    placeholder="₹" value={item.amount} onChange={e => updateItem(i, 'amount', e.target.value)} />
                  {form.line_items.length > 1 && (
                    <button onClick={() => setForm({ ...form, line_items: form.line_items.filter((_, j) => j !== i) })}
                      className="text-gray-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-2 space-y-1">
              <p className="text-gray-500 text-sm">Subtotal: ₹{subtotal.toLocaleString()}</p>
              {taxAmt > 0 && <p className="text-gray-500 text-sm">GST ({form.tax_percentage}%): ₹{taxAmt.toLocaleString()}</p>}
              <p className="text-white font-bold text-lg">Total: ₹{total.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes (appears on invoice)</label>
            <textarea rows={2} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none resize-none"
              placeholder="Payment terms, bank details, etc..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={createInvoice.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-3">
        {invoices.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-600">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No invoices yet.</p>
          </div>
        )}
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600 font-mono">#{inv.invoice_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                  {inv.billing_type === 'recurring' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">🔄 {inv.recurring_interval}</span>
                  )}
                  {inv.paid_at && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Paid</span>}
                </div>
                <p className="text-white font-bold mt-1">{inv.client_name}{inv.company_name ? ` · ${inv.company_name}` : ''}</p>
                <p className="text-gray-500 text-sm">{inv.client_email}</p>
                <p className="text-green-400 font-bold mt-1">₹{(inv.total || 0).toLocaleString()}</p>
                {inv.due_date && <p className="text-xs text-gray-600">Due: {inv.due_date}</p>}
                {inv.payment_link && (
                  <a href={inv.payment_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" /> Payment Link
                  </a>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {inv.status !== 'paid' && (
                  <button onClick={() => handleSend(inv)} disabled={sending === inv.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
                    <Send className="w-3 h-3" /> {sending === inv.id ? '...' : 'Send'}
                  </button>
                )}
                <button onClick={() => deleteInvoice.mutate(inv.id)}
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