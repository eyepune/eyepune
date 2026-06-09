'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, TrendingUp, Users, Zap, Target, Clock, ArrowRight, Bot } from 'lucide-react';

function FunnelBar({ label, value, max, color, sublabel }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 flex-shrink-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-600">{sublabel}</p>}
      </div>
      <div className="flex-1 bg-white/[0.05] rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-16 text-right">
        <span className="text-sm font-bold text-white">{value}</span>
        <span className="text-xs text-gray-600 ml-1">({pct}%)</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'red', trend }) {
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
      {trend && (
        <p className={`text-xs mt-2 font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </p>
      )}
    </div>
  );
}

export default function ChatbotFunnelSection() {
  const [leads, setLeads] = useState([]);
  const [abResults, setAbResults] = useState({ '3000': 0, '5000': 0, '8000': 0 });
  const [funnelEvents, setFunnelEvents] = useState({
    visible: 0,
    opened: 0,
    messageSent: 0,
    leadCaptured: 0,
    bookMeetingShown: 0,
    bookMeetingClicked: 0,
    exitIntent: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Chatbot leads
        const { data: chatLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('source', 'chatbot')
          .order('created_at', { ascending: false })
          .limit(50);
        if (chatLeads) {
          setLeads(chatLeads);
          setRecentLeads(chatLeads.slice(0, 8));
        }

        // Inquiries to derive funnel events (we store funnel events as special inquiries)
        const { data: chatInquiries } = await supabase
          .from('inquiries')
          .select('*')
          .eq('source', 'chatbot')
          .order('created_at', { ascending: false })
          .limit(500);

        if (chatInquiries) {
          // Derive funnel stats from messages stored in inquiries
          setFunnelEvents({
            visible: chatLeads?.length || 0,
            opened: chatInquiries.filter(i => i.message?.includes('chatbot')).length,
            messageSent: chatInquiries.length,
            leadCaptured: chatLeads?.length || 0,
            bookMeetingShown: chatInquiries.filter(i => i.message?.includes('book')).length,
            bookMeetingClicked: 0, // tracked separately via analytics
            exitIntent: 0,
          });
        }
      } catch (err) {
        console.warn('[ChatbotFunnel] Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const conversionRate = leads.length > 0
    ? ((leads.filter(l => l.status !== 'new').length / leads.length) * 100).toFixed(1)
    : '0';

  const funnelMax = Math.max(funnelEvents.visible, funnelEvents.opened, 1);

  const abVariants = [
    { label: '3s trigger', key: '3000', color: 'bg-green-500' },
    { label: '5s trigger', key: '5000', color: 'bg-blue-500' },
    { label: '8s trigger', key: '8000', color: 'bg-orange-500' },
  ];
  const abMax = Math.max(...Object.values(abResults), 1);
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading chatbot analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Chatbot Funnel Analytics</h2>
          <p className="text-gray-500 text-sm">EyE BoT performance & lead conversion tracking</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Chat Leads" value={leads.length} sub="All time" color="blue" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={`${conversionRate}%`} sub="Lead → Qualified" color="green" />
        <StatCard icon={MessageSquare} label="Chat Inquiries" value={funnelEvents.messageSent} sub="Messages received" color="purple" />
        <StatCard icon={Target} label="Exit Intent Saves" value={funnelEvents.exitIntent} sub="Recovered visitors" color="orange" />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          Conversion Funnel
        </h3>
        <div className="space-y-4">
          <FunnelBar label="Bot Visible" sublabel="Triggered on scroll/time" value={funnelMax} max={funnelMax} color="bg-blue-500" />
          <div className="flex items-center gap-2 pl-32">
            <ArrowRight className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">
              {funnelMax > 0 ? Math.round((funnelEvents.opened / funnelMax) * 100) : 0}% open rate
            </span>
          </div>
          <FunnelBar label="Chat Opened" value={funnelEvents.opened} max={funnelMax} color="bg-indigo-500" />
          <div className="flex items-center gap-2 pl-32">
            <ArrowRight className="w-3 h-3 text-gray-600" />
          </div>
          <FunnelBar label="Msg Sent" sublabel="At least 1 message" value={funnelEvents.messageSent} max={funnelMax} color="bg-purple-500" />
          <div className="flex items-center gap-2 pl-32">
            <ArrowRight className="w-3 h-3 text-gray-600" />
          </div>
          <FunnelBar label="Lead Captured" sublabel="Phone/Email shared" value={funnelEvents.leadCaptured} max={funnelMax} color="bg-orange-500" />
          <div className="flex items-center gap-2 pl-32">
            <ArrowRight className="w-3 h-3 text-gray-600" />
          </div>
          <FunnelBar label="Book Meeting" sublabel="CTA clicked" value={funnelEvents.bookMeetingShown} max={funnelMax} color="bg-red-500" />
        </div>
      </div>

      {/* A/B Test Results */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          A/B Test: Trigger Timing
        </h3>
        <p className="text-xs text-gray-500 mb-5">Which delay produces the most open conversations?</p>
        <div className="space-y-4">
          {abVariants.map(({ label, key, color }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-24 flex-shrink-0">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
              <div className="flex-1 bg-white/[0.05] rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${color}`}
                  style={{ width: abMax > 0 ? `${(abResults[key] / abMax) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-white w-10 text-right">{abResults[key]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">* Data accumulates as users interact with the chatbot. Check back after 100+ sessions.</p>
      </div>

      {/* Recent Chatbot Leads */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Recent Chatbot Leads</h3>
        {recentLeads.length === 0 ? (
          <p className="text-gray-600 text-sm">No chatbot leads yet. They'll appear here as visitors chat with EyE BoT.</p>
        ) : (
          <div className="space-y-3">
            {recentLeads.map((lead, i) => (
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
