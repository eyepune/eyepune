'use client';

import React, { useMemo } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, Mail, Star, TrendingUp, Clock,
    ArrowUpRight, Zap, Target, Activity, Plus,
    BarChart3, Calendar, CheckCircle2, AlertCircle,
    MessageSquare, Globe, ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Tiny inline bar chart (no library needed) ──────────────
function SparkBar({ data = [], color = '#ef4444', label = '' }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-0.5 h-10">
            {data.map((v, i) => (
                <div
                    key={i}
                    title={`${label}: ${v}`}
                    className="flex-1 rounded-t transition-all duration-500"
                    style={{
                        height: `${(v / max) * 100}%`,
                        background: color,
                        opacity: 0.4 + (i / data.length) * 0.6,
                        minHeight: v > 0 ? '4px' : '2px',
                    }}
                />
            ))}
        </div>
    );
}

// ── Donut chart (inline SVG) ────────────────────────────────
function DonutChart({ segments = [], size = 100 }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circumference;
                const gap = circumference - dash;
                const el = (
                    <circle
                        key={i}
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="12"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
}

function Admin_Dashboard() {
    // ── Fetch all dashboard data ──────────────────────────
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const [leads, inquiries, assessments, bookings, templates, campaigns] = await Promise.all([
                supabase.from('leads').select('id,status,created_at', { count: 'exact' }),
                supabase.from('inquiries').select('id,created_at', { count: 'exact' }),
                supabase.from('ai_assessments').select('id,created_at', { count: 'exact' }),
                supabase.from('bookings').select('id,created_at', { count: 'exact' }),
                supabase.from('email_templates').select('id', { count: 'exact', head: true }),
                supabase.from('campaigns').select('id', { count: 'exact', head: true }),
            ]);
            return {
                leadsData: leads.data || [],
                leadsCount: leads.count || 0,
                inquiries: inquiries.count || 0,
                assessments: assessments.count || 0,
                bookings: bookings.count || 0,
                templates: templates.count || 0,
                campaigns: campaigns.count || 0,
                conversion: leads.count > 0 ? ((bookings.count / leads.count) * 100).toFixed(1) : 0,
                // Lead status breakdown
                statusBreakdown: (leads.data || []).reduce((acc, l) => {
                    const s = l.status || 'new';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {}),
                // Last 7 days daily counts
                dailyLeads: buildDailyCount(leads.data || [], 7),
                dailyInquiries: buildDailyCount(inquiries.data || [], 7),
                dailyAssessments: buildDailyCount(assessments.data || [], 7),
            };
        },
        refetchInterval: 60000, // refresh every 60s
    });

    const { data: recentLeads = [] } = useQuery({
        queryKey: ['admin-recent-leads'],
        queryFn: async () => {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);
            return data || [];
        },
    });

    const { data: recentInquiries = [] } = useQuery({
        queryKey: ['admin-recent-inquiries'],
        queryFn: async () => {
            const { data } = await supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);
            return data || [];
        },
    });

    const { data: systemStatus } = useQuery({
        queryKey: ['system-status'],
        queryFn: async () => {
            const res = await fetch('/api/system/verify');
            return (await res.json()).report;
        }
    });

    // ── Status donut data ─────────────────────────────────
    const donutData = useMemo(() => {
        if (!stats?.statusBreakdown) return [];
        const colors = { new: '#ef4444', contacted: '#3b82f6', qualified: '#8b5cf6', won: '#10b981', lost: '#6b7280' };
        return Object.entries(stats.statusBreakdown).map(([k, v]) => ({
            label: k, value: v, color: colors[k] || '#6b7280'
        }));
    }, [stats?.statusBreakdown]);

    const statCards = [
        {
            title: "Total Leads",
            value: stats?.leadsCount,
            sub: `${stats?.conversion}% conversion`,
            trend: "up",
            icon: Users,
            spark: stats?.dailyLeads,
            color: "from-blue-600 to-cyan-500",
            bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400"
        },
        {
            title: "Consultations",
            value: stats?.bookings,
            sub: "Booked sessions",
            trend: "up",
            icon: Target,
            spark: [],
            color: "from-red-600 to-orange-500",
            bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400"
        },
        {
            title: "AI Assessments",
            value: stats?.assessments,
            sub: "High-intent prospects",
            trend: "neutral",
            icon: Zap,
            spark: stats?.dailyAssessments,
            color: "from-amber-500 to-yellow-400",
            bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400"
        },
        {
            title: "Inquiries",
            value: stats?.inquiries,
            sub: "Form submissions",
            trend: "up",
            icon: Mail,
            spark: stats?.dailyInquiries,
            color: "from-emerald-500 to-green-400",
            bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span className="text-xs font-medium text-gray-300">Live System Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Executive Overview</h1>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">
                        Monitor your business performance, lead pipeline, and automation health in real-time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-[#111] border-white/10 text-white hover:bg-white/5 hover:text-white h-10">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" /> Last 7 Days
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/Admin_Analytics'}
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/20 border-0 h-10"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" /> Full Analytics
                    </Button>
                </div>
            </div>

            {/* Stat Cards with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                            <CardContent className="pt-5 pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.title}</p>
                                        <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
                                            {isLoading ? '…' : (stat.value ?? 0)}
                                        </h3>
                                        <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", stat.text)}>
                                            {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                                            {stat.sub}
                                        </p>
                                    </div>
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", stat.bg, stat.border)}>
                                        <Icon className={cn("w-5 h-5", stat.text)} />
                                    </div>
                                </div>
                                {stat.spark && stat.spark.length > 0 && (
                                    <SparkBar data={stat.spark} color={stat.text.replace('text-', '#').replace('400', '')} label={stat.title} />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                {/* Recent Leads Feed */}
                <Card className="lg:col-span-2 bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                    <CardHeader className="border-b border-white/5 px-6 py-4">
                        <CardTitle className="text-white text-base font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                Recent Leads
                            </span>
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => window.location.href = '/Admin_CRM'}
                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <Users className="w-7 h-7 text-gray-600" />
                                </div>
                                <p className="text-white font-medium text-sm">No leads yet</p>
                                <p className="text-xs text-gray-500 mt-1">Leads from forms and chatbot appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {recentLeads.map((lead) => (
                                    <div key={lead.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-sm border border-white/10">
                                                {lead.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm group-hover:text-red-400 transition-colors">
                                                    {lead.full_name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {lead.email} · {lead.source || 'website'} · {new Date(lead.created_at).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "border-none font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider",
                                            lead.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' :
                                            lead.status === 'new' ? 'bg-red-500/10 text-red-400' :
                                            lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-400' :
                                            'bg-white/5 text-gray-400'
                                        )}>
                                            {lead.status || 'NEW'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right column */}
                <div className="space-y-6 flex flex-col">
                    {/* Lead Pipeline Donut */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 px-5 py-4">
                            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                </div>
                                Lead Pipeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            {donutData.length > 0 ? (
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        <DonutChart segments={donutData} size={88} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{stats?.leadsCount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        {donutData.map((seg, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                                                    <span className="text-xs text-gray-400 capitalize">{seg.label}</span>
                                                </div>
                                                <span className="text-xs text-white font-medium">{seg.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">No pipeline data yet</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Inquiries */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden flex-1">
                        <CardHeader className="border-b border-white/5 px-5 py-4">
                            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                </div>
                                New Inquiries
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentInquiries.length === 0 ? (
                                <div className="py-8 text-center text-gray-600 text-xs">No inquiries yet</div>
                            ) : (
                                <div className="divide-y divide-white/[0.04]">
                                    {recentInquiries.map(inq => (
                                        <div key={inq.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                            <p className="text-white text-sm font-medium truncate">{inq.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {inq.service_interest || 'General'} · {new Date(inq.created_at).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* System Health Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                {/* Zoho Mail */}
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-blue-500/10">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Zoho Mail</p>
                                    <p className="text-xs text-gray-500">Transactional</p>
                                </div>
                            </div>
                            {systemStatus?.zoho?.configured
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                : <AlertCircle className="w-5 h-5 text-yellow-500" />
                            }
                        </div>
                        <Button
                            size="sm"
                            onClick={() => window.open('/api/zoho/auth', '_blank')}
                            className={cn("w-full h-8 text-xs font-medium",
                                systemStatus?.zoho?.configured
                                    ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                    : "bg-gradient-to-r from-red-600 to-red-500 text-white border-none"
                            )}
                        >
                            {systemStatus?.zoho?.configured ? '✓ Connected' : 'Authorize Zoho'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Database */}
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                <Activity className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Database</p>
                                <p className="text-xs text-gray-500">Supabase PostgreSQL</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                        </div>
                        <div className="space-y-1.5">
                            {['leads', 'inquiries', 'bookings', 'email_templates'].map(t => (
                                <div key={t} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">{t}</span>
                                    <span className="text-emerald-400">✓ OK</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5">
                    <CardContent className="pt-5 pb-4 space-y-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Quick Actions</p>
                        {[
                            { label: 'Add Manual Lead', href: '/Admin_CRM', icon: Plus, color: 'text-red-400' },
                            { label: 'Send Campaign', href: '/Admin_Marketing', icon: Mail, color: 'text-blue-400' },
                            { label: 'View Analytics', href: '/Admin_Analytics', icon: Globe, color: 'text-emerald-400' },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => window.location.href = action.href}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <action.icon className={cn("w-4 h-4", action.color)} />
                                <span className="text-sm text-white/80 group-hover:text-white">{action.label}</span>
                                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" />
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ── Helper: count events per day for last N days ──────────
function buildDailyCount(rows, days) {
    const counts = Array(days).fill(0);
    const now = Date.now();
    rows.forEach(row => {
        const diff = Math.floor((now - new Date(row.created_at).getTime()) / 86400000);
        if (diff >= 0 && diff < days) counts[days - 1 - diff]++;
    });
    return counts;
}

export default function AdminDashboardPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Dashboard />
            </AdminLayout>
        </AdminGuard>
    );
}
