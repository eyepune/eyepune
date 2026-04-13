'use client';

import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Star, FileText, TrendingUp, Clock } from 'lucide-react';

function Admin_Dashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const [leads, inquiries, testimonials, logos] = await Promise.all([
                supabase.from('leads').select('id', { count: 'exact', head: true }),
                supabase.from('inquiries').select('id', { count: 'exact', head: true }),
                supabase.from('testimonials').select('id', { count: 'exact', head: true }),
                supabase.from('client_logos').select('id', { count: 'exact', head: true }).eq('is_active', true),
            ]);
            return {
                leads: leads.count || 0,
                inquiries: inquiries.count || 0,
                testimonials: testimonials.count || 0,
                logos: logos.count || 0,
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

    const statCards = [
        { title: 'Total Leads', value: stats?.leads || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Inquiries', value: stats?.inquiries || 0, icon: Mail, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Testimonials', value: stats?.testimonials || 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { title: 'Partner Logos', value: stats?.logos || 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back to EyE PunE Admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="bg-[#111] border-white/[0.06]">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {isLoading ? '...' : stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Leads */}
            <Card className="bg-[#111] border-white/[0.06]">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" /> Recent Leads
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentLeads.length === 0 ? (
                        <p className="text-gray-500 text-sm">No leads yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                    <div>
                                        <p className="text-white font-medium">{lead.full_name}</p>
                                        <p className="text-xs text-gray-500">{lead.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                                            lead.status === 'won' ? 'bg-green-500/10 text-green-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
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
