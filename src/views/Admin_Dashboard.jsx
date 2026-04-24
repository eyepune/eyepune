'use client';

import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, Mail, Star, FileText, TrendingUp, Clock, 
    ArrowUpRight, ArrowDownRight, Zap, Target, Activity, Plus,
    BarChart3, Calendar, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Admin_Dashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const [leads, inquiries, assessments, bookings, templates] = await Promise.all([
                supabase.from('leads').select('id', { count: 'exact', head: true }),
                supabase.from('inquiries').select('id', { count: 'exact', head: true }),
                supabase.from('ai_assessments').select('id', { count: 'exact', head: true }),
                supabase.from('bookings').select('id', { count: 'exact', head: true }),
                supabase.from('email_templates').select('id', { count: 'exact', head: true }),
            ]);
            return {
                leads: leads.count || 0,
                inquiries: inquiries.count || 0,
                assessments: assessments.count || 0,
                bookings: bookings.count || 0,
                templates: templates.count || 0,
                conversion: leads.count > 0 ? ((bookings.count / leads.count) * 100).toFixed(1) : 0
            };
        },
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

    const { data: systemStatus } = useQuery({
        queryKey: ['system-status'],
        queryFn: async () => {
            const res = await fetch('/api/system/verify');
            const data = await res.json();
            return data.report;
        }
    });

    const statCards = [
        {
            title: "Total Pipeline",
            value: stats?.leads,
            change: "+12%",
            trend: "up",
            icon: Users,
            color: "from-blue-600 to-cyan-500",
            bgLight: "bg-blue-500/10",
            borderLight: "border-blue-500/20",
            textLight: "text-blue-500"
        },
        {
            title: "Consultations",
            value: stats?.bookings,
            change: `${stats?.conversion}% conv`,
            trend: "up",
            icon: Target,
            color: "from-red-600 to-orange-500",
            bgLight: "bg-red-500/10",
            borderLight: "border-red-500/20",
            textLight: "text-red-500"
        },
        {
            title: "AI Assessments",
            value: stats?.assessments,
            change: "High Intent",
            trend: "neutral",
            icon: Zap,
            color: "from-amber-500 to-yellow-400",
            bgLight: "bg-amber-500/10",
            borderLight: "border-amber-500/20",
            textLight: "text-amber-500"
        },
        {
            title: "Active Campaigns",
            value: stats?.templates,
            change: "Automated",
            trend: "neutral",
            icon: Mail,
            color: "from-emerald-500 to-green-400",
            bgLight: "bg-emerald-500/10",
            borderLight: "border-emerald-500/20",
            textLight: "text-emerald-500"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
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
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" /> Last 30 Days
                    </Button>
                    <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/20 border-0 h-10">
                        <BarChart3 className="w-4 h-4 mr-2" /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors duration-300">
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                            
                            <CardContent className="pt-6 pb-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-4xl font-bold text-white tracking-tight">
                                                {isLoading ? '...' : stat.value}
                                            </h3>
                                        </div>
                                        <div className={cn("inline-flex items-center text-xs font-medium", stat.textLight)}>
                                            {stat.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
                                            {stat.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", stat.bgLight, stat.borderLight)}>
                                        <Icon className={cn("w-6 h-6", stat.textLight)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Main Feed */}
                <Card className="lg:col-span-2 bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
                        <CardTitle className="text-white text-lg font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                Recent Activity
                            </span>
                            <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                View All Activity
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        {recentLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-white font-medium">No recent activity</p>
                                <p className="text-sm text-gray-500 mt-1">New leads will appear here automatically.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentLeads.map((lead) => (
                                    <div key={lead.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10 shadow-inner">
                                                    {lead.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0c0c] bg-blue-500 flex items-center justify-center">
                                                    <Users className="w-2 h-2 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm group-hover:text-red-400 transition-colors">
                                                    {lead.full_name || 'Unknown Lead'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {lead.email} • {new Date(lead.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "border-none font-medium px-2.5 py-0.5 text-[10px] uppercase tracking-wider",
                                            lead.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' :
                                            lead.status === 'new' ? 'bg-red-500/10 text-red-400' :
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

                {/* Right Column: Actions & System */}
                <div className="space-y-8 flex flex-col">
                    {/* Quick Actions */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
                            <CardTitle className="text-white text-lg font-semibold flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                </div>
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <Button className="w-full justify-start bg-[#111] hover:bg-[#1a1a1a] text-white border border-white/5 hover:border-red-500/30 transition-all h-12 shadow-sm group">
                                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center mr-3 group-hover:bg-red-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-red-500" />
                                </div>
                                <span className="font-medium">Manual Lead Entry</span>
                            </Button>
                            
                            <Button className="w-full justify-start bg-[#111] hover:bg-[#1a1a1a] text-white border border-white/5 hover:border-blue-500/30 transition-all h-12 shadow-sm group">
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="font-medium">Send Bulk Campaign</span>
                            </Button>
                            
                            <Button className="w-full justify-start bg-[#111] hover:bg-[#1a1a1a] text-white border border-white/5 hover:border-yellow-500/30 transition-all h-12 shadow-sm group">
                                <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center mr-3 group-hover:bg-yellow-500/20 transition-colors">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                </div>
                                <span className="font-medium">Approve Testimonials</span>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card className="bg-[#0c0c0c]/80 backdrop-blur-xl border-white/5 overflow-hidden flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent pointer-events-none" />
                        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
                            <CardTitle className="text-white text-lg font-semibold flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-white/5">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                </div>
                                System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="bg-[#111] border border-white/5 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded bg-blue-500/10">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-white block">Zoho Mail API</span>
                                            <span className="text-xs text-gray-500">Transactional Delivery</span>
                                        </div>
                                    </div>
                                    {systemStatus?.zoho?.configured ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => window.open('/api/zoho/auth', '_blank')}
                                    className={cn(
                                        "w-full h-8 text-xs font-medium transition-all shadow-sm",
                                        systemStatus?.zoho?.configured 
                                            ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" 
                                            : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-none"
                                    )}
                                >
                                    {systemStatus?.zoho?.configured ? 'Test Connection' : 'Authorize Now'}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between px-2 text-sm">
                                <span className="text-gray-400">Database Latency</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-400 font-medium">24ms</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between px-2 text-sm">
                                <span className="text-gray-400">Environment</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Production</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
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
