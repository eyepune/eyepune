import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, CheckCircle2, Clock, ExternalLink, Download } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    color: 'bg-gray-500/20 text-gray-400' },
  sent:     { label: 'Sent',     color: 'bg-blue-500/20 text-blue-400' },
  viewed:   { label: 'Viewed',   color: 'bg-yellow-500/20 text-yellow-400' },
  accepted: { label: 'Accepted', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
};

export default function ProposalViewer({ user }) {
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['client-proposals', user.email],
    queryFn: () => base44.entities.Proposal.filter({ client_email: user.email }, '-created_date', 50),
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  if (proposals.length === 0) return (
    <div className="text-center py-16">
      <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <p className="text-gray-500 text-lg font-medium">No proposals yet</p>
      <p className="text-gray-600 text-sm mt-1">Your proposals from EyE PunE will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''}</p>
      {proposals.map(p => {
        const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
        const canSign = p.status === 'sent' || p.status === 'viewed';
        return (
          <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs text-gray-600 font-mono">#{p.proposal_number}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  {p.client_signed_at && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg">{p.project_title}</h3>
                {p.executive_summary && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.executive_summary}</p>
                )}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {p.total_amount > 0 && (
                    <span className="text-green-400 font-bold">₹{p.total_amount.toLocaleString()}</span>
                  )}
                  {p.timeline && (
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.timeline}
                    </span>
                  )}
                  {p.valid_until && (
                    <span className="text-gray-600 text-xs">Valid until: {p.valid_until}</span>
                  )}
                  {p.created_date && (
                    <span className="text-gray-600 text-xs">
                      Sent: {format(new Date(p.created_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                {p.client_signed_at && (
                  <div className="mt-3 p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-xs text-gray-500 space-y-0.5">
                    <p>✍️ Signed by <span className="text-white">{p.client_signature_name}</span></p>
                    <p>📅 {format(new Date(p.client_signed_at), 'PPpp')}</p>
                    {p.client_signed_ip && <p>🌐 IP: {p.client_signed_ip}</p>}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {canSign && (
                  <a
                    href={`/SignProposal?id=${p.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    ✍️ Review & Sign
                  </a>
                )}
                <a
                  href={`/SignProposal?id=${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-xl text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> View
                </a>
              </div>
            </div>

            {/* Pricing Summary */}
            {p.pricing_items?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">Scope & Pricing</p>
                <div className="space-y-1">
                  {p.pricing_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{item.description}</span>
                      <span className="text-white font-medium">₹{(item.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}