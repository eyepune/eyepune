import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, FileText, Receipt } from 'lucide-react';

import { format } from 'date-fns';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-orange-500/20 text-orange-400',
  proposal_sent: 'bg-purple-500/20 text-purple-400',
  closed_won: 'bg-green-500/20 text-green-400',
  closed_lost: 'bg-red-500/20 text-red-400',
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'closed_won', 'closed_lost'];

export default function CRMSection({ onNavigate }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({ full_name: '', email: '', phone: '', company: '', source: 'website', status: 'new', assigned_to: '', billing_address: '', billing_city: '', billing_state: '', billing_pincode: '' });
  const [formError, setFormError] = useState('');

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads-crm'],
    queryFn: () => base44.entities.Lead.list('-created_date', 2000),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries-crm'],
    queryFn: () => base44.entities.Inquiry.list('-created_date', 50),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: (_, { data }) => {
      qc.invalidateQueries(['leads-crm']);
      if (data.status === 'closed_won' && onNavigate) {
        setTimeout(() => onNavigate('proposals'), 300);
      }
    },
  });

  const createLead = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => { qc.invalidateQueries(['leads-crm']); setShowAddForm(false); setNewLead({ full_name: '', email: '', phone: '', company: '', source: 'website', status: 'new', assigned_to: '', billing_address: '', billing_city: '', billing_state: '', billing_pincode: '' }); setFormError(''); },
  });

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.full_name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-white">CRM & Sales</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">New Lead</h3>
          {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name <span className="text-red-400">*</span></label>
              <input
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder="Full Name"
                value={newLead.full_name}
                onChange={e => setNewLead({ ...newLead, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone <span className="text-red-400">*</span></label>
              <input
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder="+91..."
                value={newLead.phone}
                onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder="email@example.com"
                value={newLead.email}
                onChange={e => setNewLead({ ...newLead, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Company</label>
              <input
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder="Company name"
                value={newLead.company}
                onChange={e => setNewLead({ ...newLead, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sales Rep (assigned to)</label>
              <input
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder="Sales rep email or name"
                value={newLead.assigned_to}
                onChange={e => setNewLead({ ...newLead, assigned_to: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Source</label>
              <select
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none"
                value={newLead.source}
                onChange={e => setNewLead({ ...newLead, source: e.target.value })}
              >
                {['website','ai_assessment','booking','referral','social_media','other'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Address */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Billing Address</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Street Address</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder="Street address"
                  value={newLead.billing_address}
                  onChange={e => setNewLead({ ...newLead, billing_address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder="City"
                  value={newLead.billing_city}
                  onChange={e => setNewLead({ ...newLead, billing_city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">State</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder="State"
                  value={newLead.billing_state}
                  onChange={e => setNewLead({ ...newLead, billing_state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Pincode</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder="Pincode"
                  value={newLead.billing_pincode}
                  onChange={e => setNewLead({ ...newLead, billing_pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                if (!newLead.full_name.trim()) { setFormError('Full Name is required'); return; }
                if (!newLead.phone.trim()) { setFormError('Phone is required'); return; }
                setFormError('');
                const notes = [newLead.billing_address, newLead.billing_city, newLead.billing_state, newLead.billing_pincode].filter(Boolean).join(', ');
                createLead.mutate({ ...newLead, notes: notes ? `Billing: ${notes}` : newLead.notes });
              }}
              disabled={createLead.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >{createLead.isPending ? 'Saving...' : 'Save Lead'}</button>
            <button onClick={() => { setShowAddForm(false); setFormError(''); }} className="px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Inquiries */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Recent Inquiries <span className="text-gray-500 font-normal text-sm">({inquiries.length})</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Email', 'Service Interest', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {inquiries.slice(0, 8).map(inq => (
                <tr key={inq.id}>
                  <td className="py-2 pr-4 text-white">{inq.name}</td>
                  <td className="py-2 pr-4 text-gray-400">{inq.email}</td>
                  <td className="py-2 pr-4 text-gray-400">{inq.service_interest?.replace('_', ' ')}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status] || 'bg-gray-500/20 text-gray-400'}`}>{inq.status}</span>
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{inq.created_date ? format(new Date(inq.created_date), 'MMM d') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 && <p className="text-gray-600 text-sm py-4">No inquiries yet</p>}
        </div>
      </div>

      {/* Leads */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-400 text-sm focus:outline-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <p className="text-xs text-gray-500 mb-3">Showing {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} leads</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Company', 'Email', 'Phone', 'Sales Rep', 'Score', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(lead => (
                <tr key={lead.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4 text-white font-medium">{lead.full_name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{lead.company || '-'}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{lead.email}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{lead.phone || '-'}</td>
                  <td className="py-2.5 pr-4 text-gray-400 text-xs">{lead.assigned_to || '-'}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-yellow-400 font-bold">{lead.lead_score || 0}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <select
                      className="bg-transparent text-xs rounded-lg px-1 focus:outline-none cursor-pointer"
                      value={lead.status}
                      onChange={e => updateLead.mutate({ id: lead.id, data: { status: e.target.value } })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">{lead.created_date ? format(new Date(lead.created_date), 'MMM d') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-600 text-sm py-4">{isLoading ? 'Loading...' : 'No leads found'}</p>}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg text-xs disabled:opacity-40 hover:bg-white/[0.08] transition-all"
              >← Prev</button>
              <span className="text-xs text-gray-500">Page {page + 1} of {Math.ceil(filtered.length / PAGE_SIZE)}</span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE) - 1, p + 1))}
                disabled={(page + 1) * PAGE_SIZE >= filtered.length}
                className="px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg text-xs disabled:opacity-40 hover:bg-white/[0.08] transition-all"
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}