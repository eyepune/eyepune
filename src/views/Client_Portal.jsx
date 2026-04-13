import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Receipt, CreditCard, History, LogIn, User } from 'lucide-react';
import ProposalViewer from '@/components/client/portal/ProposalViewer';
import InvoiceDashboard from '@/components/client/portal/InvoiceDashboard';
import PaymentHistory from '@/components/client/portal/PaymentHistory';

const TABS = [
  { id: 'proposals', label: 'My Proposals', icon: FileText },
  { id: 'invoices', label: 'Invoices & Pay', icon: Receipt },
  { id: 'payments', label: 'Payment History', icon: History },
];

export default function Client_Portal() {
  const urlParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'proposals');

  const { data: user, isLoading } = useQuery({
    queryKey: ['portal-user'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Client Portal</h1>
        <p className="text-gray-500 mb-6">Sign in to view your proposals, invoices and payment history.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold mx-auto transition-all"
        >
          <LogIn className="w-4 h-4" /> Sign In to Continue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040404]">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#070707]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Client Portal</h1>
            <p className="text-gray-500 text-sm">Welcome, {user.full_name || user.email}</p>
          </div>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png"
            alt="EyE PunE" className="h-9"
          />
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-6 flex gap-1 pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  active
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'proposals' && <ProposalViewer user={user} />}
        {activeTab === 'invoices' && <InvoiceDashboard user={user} />}
        {activeTab === 'payments' && <PaymentHistory user={user} />}
      </div>
    </div>
  );
}