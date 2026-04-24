'use client';

import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, Mail, Star, FileText, TrendingUp, Clock, 
    ArrowUpRight, ArrowDownRight, Zap, Target, Activity, Plus
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
                .limit(5);
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

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Executive Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time performance metrics for EyE PunE</p>
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1">
                    <Activity className="w-3 h-3 mr-2 animate-pulse" /> Live System
                </Badge>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-[#111] border-white/[0.06] relative overflow-hidden group">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Pipeline</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : stats?.leads}</h3>
                                <p className="text-xs text-green-500 flex items-center mt-2">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12% from last week
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111] border-white/[0.06] relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Consultations</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : stats?.bookings}</h3>
                                <p className="text-xs text-blue-500 flex items-center mt-2">
                                    <Target className="w-3 h-3 mr-1" /> {stats?.conversion}% conv. rate
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <Clock className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111] border-white/[0.06] relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">AI Assessments</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : stats?.assessments}</h3>
                                <p className="text-xs text-orange-500 flex items-center mt-2">
                                    <Zap className="w-3 h-3 mr-1" /> High Intent
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111] border-white/[0.06] relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Marketing Assets</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : stats?.templates}</h3>
                                <p className="text-xs text-gray-400 mt-2">Automated Rules Active</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <Mail className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <Card className="lg:col-span-2 bg-[#111] border-white/[0.06]">
                    <CardHeader className="border-b border-white/[0.04]">
                        <CardTitle className="text-white text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-red-500" /> Recent Activity</span>
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500">View All</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {recentLeads.length === 0 ? (
                            <div className="py-12 text-center text-gray-600">No recent activity detected.</div>
                        ) : (
                            <div className="space-y-6">
                                {recentLeads.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-white font-bold border border-white/[0.06]">
                                                {lead.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{lead.full_name}</p>
                                                <p className="text-xs text-gray-500">{lead.email} • {new Date(lead.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${
                                            lead.status === 'won' ? 'bg-green-500/10 text-green-400' :
                                            lead.status === 'new' ? 'bg-red-500/10 text-red-400' :
                                            'bg-white/[0.03] text-gray-400'
                                        } border-none font-normal text-[10px]`}>
                                            {lead.status?.toUpperCase()}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-[#111] border-white/[0.06]">
                    <CardHeader className="border-b border-white/[0.04]">
                        <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                        <Button className="w-full justify-start bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] h-11">
                            <Plus className="w-4 h-4 mr-3 text-red-500" /> Manual Lead Entry
                        </Button>
                        <Button className="w-full justify-start bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] h-11">
                            <Mail className="w-4 h-4 mr-3 text-blue-500" /> Send Bulk Campaign
                        </Button>
                        <Button className="w-full justify-start bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] h-11">
                            <Star className="w-4 h-4 mr-3 text-yellow-500" /> Approve Testimonials
                        </Button>
                        <div className="pt-4 mt-4 border-t border-white/[0.04] space-y-4">
                             <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">System Health</p>
                             
                             <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                 <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center gap-2">
                                         <Mail className={`w-3 h-3 ${systemStatus?.zoho?.configured ? 'text-green-500' : 'text-yellow-500'}`} />
                                         <span className="text-xs text-white">Zoho Mail</span>
                                     </div>
                                     <Badge className={systemStatus?.zoho?.configured ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                                         {systemStatus?.zoho?.configured ? 'Live' : 'Pending'}
                                     </Badge>
                                 </div>
                                 <Button 
                                     size="sm" 
                                     onClick={() => window.open('/api/zoho/auth', '_blank')}
                                     className="w-full h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white"
                                 >
                                     {systemStatus?.zoho?.configured ? 'Re-authorize' : 'Authorize Now'}
                                 </Button>
                             </div>

                             <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
                                 <span>Database Response</span>
                                 <span className="text-green-500">24ms</span>
                             </div>
                        </div>
                    </CardContent>
                </Card>
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
