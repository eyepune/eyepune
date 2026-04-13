import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { History, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentHistory({ user }) {
  const { data: invoices = [], isLoading: loadingInv } = useQuery({
    queryKey: ['client-paid-invoices', user.email],
    queryFn: () => base44.entities.Invoice.filter({ client_email: user.email }, '-created_date', 200),
  });

  const { data: payments = [], isLoading: loadingPay } = useQuery({
    queryKey: ['client-payments', user.email],
    queryFn: () => base44.entities.Payment.filter({ customer_email: user.email }, '-created_date', 200),
  });

  const isLoading = loadingInv || loadingPay;

  // Build unified timeline
  const timeline = [
    ...invoices.map(inv => ({
      id: inv.id,
      date: inv.paid_at || inv.sent_at || inv.created_date,
      amount: inv.total || 0,
      label: `Invoice #${inv.invoice_number}`,
      status: inv.status,
      type: 'invoice',
      method: inv.billing_type === 'recurring' ? `Recurring (${inv.recurring_interval})` : 'One-Time',
      razorpay_id: inv.razorpay_payment_id || inv.razorpay_order_id,
    })),
    ...payments.map(pay => ({
      id: pay.id,
      date: pay.created_date,
      amount: pay.amount || 0,
      label: pay.plan_name || 'Payment',
      status: pay.status,
      type: 'payment',
      method: pay.payment_type,
      razorpay_id: pay.razorpay_payment_id,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid = timeline.filter(t => t.status === 'paid' || t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const paidCount = timeline.filter(t => t.status === 'paid' || t.status === 'completed').length;

  if (isLoading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Transactions</p>
          <p className="text-2xl font-bold text-white">{paidCount}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Records</p>
          <p className="text-2xl font-bold text-white">{timeline.length}</p>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No payment history</p>
          <p className="text-gray-600 text-sm mt-1">Your transactions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {timeline.map(item => {
            const isPaid = item.status === 'paid' || item.status === 'completed';
            const isFailed = item.status === 'failed';
            const isPending = !isPaid && !isFailed;
            return (
              <div key={`${item.type}-${item.id}`}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/[0.1] transition-all">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isPaid ? 'bg-green-500/15' : isFailed ? 'bg-red-500/15' : 'bg-yellow-500/15'
                }`}>
                  {isPaid && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
                  {isPending && <Clock className="w-4 h-4 text-yellow-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    <span className="text-gray-600 text-xs">
                      {item.date ? format(new Date(item.date), 'MMM d, yyyy') : '—'}
                    </span>
                    {item.method && <span className="text-gray-600 text-xs">{item.method}</span>}
                    {item.razorpay_id && (
                      <span className="text-gray-700 text-xs font-mono truncate max-w-32">{item.razorpay_id}</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-bold ${isPaid ? 'text-green-400' : isFailed ? 'text-red-400 line-through' : 'text-yellow-400'}`}>
                    ₹{item.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs capitalize mt-0.5 ${
                    isPaid ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-yellow-600'
                  }`}>{item.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}