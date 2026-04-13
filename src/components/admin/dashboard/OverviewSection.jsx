import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, FolderKanban, Calendar, TrendingUp, MessageSquare, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import WixSyncWidget from './WixSyncWidget';

function StatCard({ icon: Icon, label, value, sub, color = 'red' }) {
  const colors = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
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

export default function OverviewSection() {
  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: () => base44.entities.Lead.list('-created_date', 2000) });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.ClientProject.list('-created_date', 100) });
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: () => base44.entities.Booking.list('-created_date', 20) });
  const { data: inquiries = [] } = useQuery({ queryKey: ['inquiries'], queryFn: () => base44.entities.Inquiry.list('-created_date', 20) });
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => base44.entities.Payment.list('-created_date', 50) });

  const newLeads = leads.filter(l => l.status === 'new').length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const upcomingBookings = bookings.filter(b => b.status === 'scheduled').length;
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);

  const recentActivity = [
    ...leads.slice(0, 3).map(l => ({ type: 'lead', label: `New lead: ${l.full_name}`, time: l.created_date, icon: Users, color: 'text-blue-400' })),
    ...bookings.slice(0, 3).map(b => ({ type: 'booking', label: `Booking: ${b.name}`, time: b.created_date, icon: Calendar, color: 'text-green-400' })),
    ...inquiries.slice(0, 3).map(i => ({ type: 'inquiry', label: `Inquiry from: ${i.name}`, time: i.created_date, icon: MessageSquare, color: 'text-yellow-400' })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  const pipeline = [
    { label: 'New', count: leads.filter(l => l.status === 'new').length, color: 'bg-blue-500' },
    { label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: 'bg-yellow-500' },
    { label: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, color: 'bg-orange-500' },
    { label: 'Proposal Sent', count: leads.filter(l => l.status === 'proposal_sent').length, color: 'bg-purple-500' },
    { label: 'Won', count: leads.filter(l => l.status === 'closed_won').length, color: 'bg-green-500' },
    { label: 'Lost', count: leads.filter(l => l.status === 'closed_lost').length, color: 'bg-red-500' },
  ];
  const maxPipeline = Math.max(...pipeline.map(p => p.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="New Leads" value={newLeads} sub={`${leads.length} total`} color="blue" />
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects} sub={`${projects.length} total`} color="green" />
        <StatCard icon={Calendar} label="Upcoming Bookings" value={upcomingBookings} sub="Consultations scheduled" color="yellow" />
        <StatCard icon={IndianRupee} label="Revenue (Completed)" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} sub="All time" color="red" />
      </div>

      {/* Pipeline + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Sales Pipeline</h3>
          <div className="space-y-3">
            {pipeline.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
                <div className="flex-1 bg-white/[0.05] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${(count / maxPipeline) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white font-bold w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 && <p className="text-gray-600 text-sm">No recent activity</p>}
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.time ? format(new Date(item.time), 'MMM d, h:mm a') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wix Sync Widget */}
      <WixSyncWidget />

      {/* Projects Status */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Active Projects</h3>
        {projects.filter(p => ['in_progress', 'onboarding', 'review'].includes(p.status)).length === 0 && (
          <p className="text-gray-600 text-sm">No active projects</p>
        )}
        <div className="space-y-3">
          {projects.filter(p => ['in_progress', 'onboarding', 'review'].includes(p.status)).slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-white font-medium truncate">{p.project_name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    p.status === 'onboarding' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>{p.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${p.progress_percentage || 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{p.progress_percentage || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}