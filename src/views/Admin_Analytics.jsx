import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Mail, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

    // Lead source analysis
    const leadsBySource = useMemo(() => {
        const sources = {};
        leads.forEach(lead => {
            const source = lead.source || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
        });
        return Object.entries(sources).map(([name, value]) => ({ name, value }));
    }, [leads]);

    // Conversion funnel
    const conversionData = useMemo(() => [
        { stage: 'Leads', count: leads.length },
        { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
        { stage: 'Proposal', count: leads.filter(l => l.status === 'proposal_sent').length },
        { stage: 'Won', count: leads.filter(l => l.status === 'closed_won').length }
    ], [leads]);

    // Revenue analysis
    const totalRevenue = useMemo(() => {
        return payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
    }, [payments]);

    // Monthly trends
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
        { icon: Users, label: 'Total Leads', value: leads.length, color: 'blue' },
        { icon: Target, label: 'Conversion Rate', value: `${leads.length ? Math.round((leads.filter(l => l.status === 'closed_won').length / leads.length) * 100) : 0}%`, color: 'purple' },
        { icon: DollarSign, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'green' },
        { icon: Mail, label: 'Assessments', value: assessments.length, color: 'orange' },
    ];

    const COLORS = ['#DC2626', '#EA580C', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Track performance and insights</p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card border rounded-xl p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Trends */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Monthly Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="leads" stroke="#DC2626" />
                                <Line type="monotone" dataKey="bookings" stroke="#3B82F6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Lead Sources */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Lead Sources</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={leadsBySource}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.name}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {leadsBySource.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-card border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Conversion Funnel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={conversionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#DC2626" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
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