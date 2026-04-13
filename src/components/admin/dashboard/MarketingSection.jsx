import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function MarketingSection() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-admin'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 50),
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments-admin'],
    queryFn: () => base44.entities.AI_Assessment.list('-created_date', 50),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-marketing'],
    queryFn: () => base44.entities.Payment.list('-created_date', 50),
  });

  const STATUS_COLORS = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-purple-500/20 text-purple-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Marketing</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{assessments.length}</p>
          <p className="text-xs text-gray-500 mt-1">AI Assessments</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{assessments.filter(a => a.converted_to_lead).length}</p>
          <p className="text-xs text-gray-500 mt-1">Converted to Lead</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-1">Active Campaigns</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            ₹{(payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Campaigns ({campaigns.length})</h3>
        {campaigns.length === 0 ? (
          <p className="text-gray-600 text-sm">No campaigns yet. Create campaigns from the Marketing page.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.type} · {c.target_audience?.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center hidden sm:block">
                    <p className="text-white font-bold">{c.sent_count || 0}</p>
                    <p className="text-xs text-gray-600">Sent</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-white font-bold">{c.opened_count || 0}</p>
                    <p className="text-xs text-gray-600">Opened</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assessments */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Recent AI Assessments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Company', 'Score', 'Converted', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {assessments.slice(0, 15).map(a => (
                <tr key={a.id}>
                  <td className="py-2.5 pr-4 text-white">{a.lead_name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{a.company_name || '-'}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-yellow-400 font-bold">{a.growth_score || 0}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.converted_to_lead ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {a.converted_to_lead ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">{a.created_date ? format(new Date(a.created_date), 'MMM d') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {assessments.length === 0 && <p className="text-gray-600 text-sm py-4">No assessments yet</p>}
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Customer', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {payments.slice(0, 10).map(p => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-4 text-white">{p.customer_name || p.customer_email}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{p.plan_name || '-'}</td>
                  <td className="py-2.5 pr-4 text-green-400 font-bold">₹{p.amount?.toLocaleString()}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.status}</span>
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">{p.created_date ? format(new Date(p.created_date), 'MMM d') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-gray-600 text-sm py-4">No payments yet</p>}
        </div>
      </div>
    </div>
  );
}