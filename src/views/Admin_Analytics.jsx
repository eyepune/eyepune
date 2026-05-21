import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Mail, Calendar, Activity, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Admin_Analytics() {
    const { data: leads = [] } = useQuery({
        queryKey: ['leads'],
        queryFn: () => base44.entities.Lead.list('-created_date', 1000),
    });

    const { data: payments = [] } = useQuery({
        queryKey: ['payments'],
        queryFn: () => base44.entities.Payment.list('-created_date', 1000),
    });

    const { data: assessments = [] } = useQuery({
        queryKey: ['assessments'],
        queryFn: () => base44.entities.AI_Assessment.list('-created_date', 1000),
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['bookings'],
        queryFn: () => base44.entities.Booking.list('-created_date', 1000),
    });

    const leadsBySource = useMemo(() => {
        const sources = {};
        leads.forEach(lead => {
            const source = lead.source || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
        });
        return Object.entries(sources).map(([name, value]) => ({ name, value }));
    }, [leads]);

    const conversionData = useMemo(() => [
        { stage: 'Leads', count: leads.length },
        { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
        { stage: 'Proposal', count: leads.filter(l => l.status === 'proposal_sent').length },
        { stage: 'Won', count: leads.filter(l => l.status === 'closed_won').length }
    ], [leads]);

    const totalRevenue = useMemo(() => {
        return payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
    }, [payments]);

    const monthlyData = useMemo(() => {
        const months = {};
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date.toLocaleString('default', { month: 'short' });
        }).reverse();

        last6Months.forEach(month => {
            months[month] = { month, leads: 0, revenue: 0, bookings: 0 };
        });

        leads.forEach(lead => {
            const month = new Date(lead.created_date).toLocaleString('default', { month: 'short' });
            if (months[month]) months[month].leads++;
        });

        payments.filter(p => p.status === 'completed').forEach(payment => {
            const month = new Date(payment.created_date).toLocaleString('default', { month: 'short' });
            if (months[month]) months[month].revenue += (payment.amount || 0) / 100;
        });

        bookings.forEach(booking => {
            const month = new Date(booking.created_date).toLocaleString('default', { month: 'short' });
            if (months[month]) months[month].bookings++;
        });

        return Object.values(months);
    }, [leads, payments, bookings]);

    const stats = [
        { icon: Users, label: 'Total Leads', value: leads.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: Target, label: 'Conversion', value: `${leads.length ? Math.round((leads.filter(l => l.status === 'closed_won').length / leads.length) * 100) : 0}%`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { icon: DollarSign, label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-400', bg: 'bg-green-500/10' },
        { icon: Mail, label: 'Assessments', value: assessments.length, color: 'text-red-400', bg: 'bg-red-500/10' },
    ];

    const COLORS = ['#DC2626', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6366F1'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Business Intelligence</h1>
                    <p className="text-gray-500 mt-2 text-sm">Deep-dive performance metrics and conversion analytics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
                        <Calendar className="w-4 h-4" /> Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                        Refresh Intel
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-[#0c0c0c] border-white/5 group hover:border-red-500/20 transition-all duration-500">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-red-500 transition-colors" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-[#0c0c0c] border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-black tracking-tight flex items-center gap-3">
                            <Activity className="w-5 h-5 text-red-500" /> MONTHLY PERFORMANCE
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="month" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey="leads" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0c0c0c] border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-black tracking-tight flex items-center gap-3">
                            <Target className="w-5 h-5 text-blue-500" /> LEAD SOURCE DISTRIBUTION
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadsBySource}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {leadsBySource.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                    />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <Card className="bg-[#0c0c0c] border-white/5 overflow-hidden">
                <CardHeader className="bg-white/[0.01] border-b border-white/5">
                    <CardTitle className="text-white text-lg font-black tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> CONVERSION PIPELINE
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={conversionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="stage" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === conversionData.length - 1 ? '#10B981' : '#DC2626'} opacity={0.6 + (index / conversionData.length) * 0.4} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminAnalyticsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Analytics />
            </AdminLayout>
        </AdminGuard>
    );
}