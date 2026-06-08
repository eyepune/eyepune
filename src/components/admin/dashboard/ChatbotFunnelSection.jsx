'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, TrendingUp, Users, Zap, Target, Clock, ArrowRight, Bot } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = 'red' }) {
  const colors = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function ChatbotFunnelSection() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: chatLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('source', 'chatbot')
          .order('created_at', { ascending: false })
          .limit(50);
        if (chatLeads) setLeads(chatLeads);
      } catch (err) {
        console.warn('[ChatbotFunnel] Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading chatbot analytics...</div>
      </div>
    );
  }

  const conversionRate = leads.length > 0
    ? ((leads.filter(l => l.status !== 'new').length / leads.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Chatbot Funnel Analytics</h2>
          <p className="text-gray-500 text-sm">EyE BoT performance and lead conversion tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Chat Leads" value={leads.length} sub="All time" color="blue" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={`${conversionRate}%`} sub="Lead to Qualified" color="green" />
        <StatCard icon={MessageSquare} label="Active Leads" value={leads.filter(l => l.status === 'contacted').length} sub="Being followed up" color="purple" />
        <StatCard icon={Target} label="Qualified Leads" value={leads.filter(l => l.status === 'qualified').length} sub="Ready for proposal" color="orange" />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Recent Chatbot Leads</h3>
        {leads.length === 0 ? (
          <p className="text-gray-600 text-sm">No chatbot leads yet. They appear here as visitors chat with EyE BoT.</p>
        ) : (
          <div className="space-y-3">
            {leads.slice(0, 10).map((lead, i) => (
              <div key={lead.id || i} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                  {(lead.full_name || 'C')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{lead.full_name || 'Chatbot Prospect'}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {lead.email && lead.email !== 'no-email@eyepune.com' && (
                      <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                    )}
                    {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                    lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {lead.status || 'new'}
                  </span>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
    }
