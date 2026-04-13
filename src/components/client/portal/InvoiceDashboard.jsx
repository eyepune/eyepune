import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, CreditCard, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: 'bg-gray-500/20 text-gray-400', icon: null },
  sent:      { label: 'Due',       color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  paid:      { label: 'Paid',      color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  overdue:   { label: 'Overdue',   color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-700/40 text-gray-600', icon: null },
};

export default function InvoiceDashboard({ user }) {
  const qc = useQueryClient();
  const [updatingBilling, setUpdatingBilling] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-invoices', user.email],
    queryFn: () => base44.entities.Invoice.filter({ client_email: user.email }, '-created_date', 100),
  });

  const totalDue = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-white">{invoices.length}</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Amount Due</p>
          <p className="text-2xl font-bold text-yellow-400">₹{totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices */}
      {invoices.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No invoices yet</p>
          <p className="text-gray-600 text-sm mt-1">Your invoices will appear here once generated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const s = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
            const Icon = s.icon;
            const isDue = inv.status === 'sent' || inv.status === 'overdue';
            return (
              <div key={inv.id} className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${
                inv.status === 'overdue' ? 'border-red-500/20' : 'border-white/[0.06] hover:border-white/[0.1]'
              }`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-gray-600 font-mono">#{inv.invoice_number}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.color}`}>
                        {Icon && <Icon className="w-3 h-3" />} {s.label}
                      </span>
                      {inv.billing_type === 'recurring' && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> {inv.recurring_interval}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-white font-bold text-xl">₹{(inv.total || 0).toLocaleString()}</span>
                      {inv.tax_percentage > 0 && (
                        <span className="text-gray-600 text-xs">incl. {inv.tax_percentage}% GST</span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap">
                      {inv.invoice_date && (
                        <span className="text-gray-500 text-xs">Issued: {inv.invoice_date}</span>
                      )}
                      {inv.due_date && (
                        <span className={`text-xs ${inv.status === 'overdue' ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                          Due: {inv.due_date}
                        </span>
                      )}
                      {inv.paid_at && (
                        <span className="text-green-400 text-xs">
                          Paid: {format(new Date(inv.paid_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    {inv.notes && (
                      <p className="text-gray-600 text-xs mt-2">{inv.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {isDue && inv.payment_link && (
                      <a
                        href={inv.payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all"
                      >
                        <CreditCard className="w-4 h-4" /> Pay Now
                      </a>
                    )}
                    {isDue && !inv.payment_link && (
                      <span className="text-xs text-gray-600 px-3 py-2 bg-white/[0.03] rounded-xl text-center">
                        Payment link pending
                      </span>
                    )}
                    {inv.billing_type === 'recurring' && inv.razorpay_subscription_id && (
                      <a
                        href={`https://rzp.io/i/${inv.razorpay_subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-xs transition-all"
                      >
                        <RefreshCw className="w-3 h-3" /> Manage Subscription
                      </a>
                    )}
                  </div>
                </div>

                {/* Line items */}
                {inv.line_items?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04]">
                    <div className="space-y-1">
                      {inv.line_items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{item.description}</span>
                          <span className="text-gray-400">₹{(item.amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      {inv.tax_percentage > 0 && (
                        <div className="flex justify-between text-sm pt-1 border-t border-white/[0.04]">
                          <span className="text-gray-600">GST ({inv.tax_percentage}%)</span>
                          <span className="text-gray-500">₹{(inv.tax_amount || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}