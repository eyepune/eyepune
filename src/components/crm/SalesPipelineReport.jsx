import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#EF4444', '#FBBF24', '#10B981', '#8B5CF6', '#06B6D4', '#EC4899'];

export default function SalesPipelineReport() {
    const { data: leads = [] } = useQuery({
        queryKey: ['all-leads-report'],
        queryFn: () => base44.entities.Lead.list('-updated_date', 500),
    });

    // Calculate metrics
    const statusCounts = {
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal_sent: 0,
        closed_won: 0,
        closed_lost: 0
    };

    let totalValue = 0;
    let avgScore = 0;
    const scoreArray = [];

    leads.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
        if (lead.revenue_potential) totalValue += lead.revenue_potential;
        if (lead.lead_score) scoreArray.push(lead.lead_score);
    });

    avgScore = scoreArray.length > 0 ? Math.round(scoreArray.reduce((a, b) => a + b) / scoreArray.length) : 0;

    // Prepare pipeline data
    const pipelineData = [
        { name: 'New', value: statusCounts.new, fill: '#3B82F6' },
        { name: 'Contacted', value: statusCounts.contacted, fill: '#F59E0B' },
        { name: 'Qualified', value: statusCounts.qualified, fill: '#10B981' },
        { name: 'Proposal', value: statusCounts.proposal_sent, fill: '#8B5CF6' },
        { name: 'Won', value: statusCounts.closed_won, fill: '#06B6D4' },
        { name: 'Lost', value: statusCounts.closed_lost, fill: '#EF4444' }
    ];

    // Conversion rates
    const conversionData = [
        { stage: 'New → Contacted', rate: statusCounts.contacted > 0 ? Math.round((statusCounts.contacted / statusCounts.new) * 100) : 0 },
        { stage: 'Contacted → Qualified', rate: statusCounts.qualified > 0 ? Math.round((statusCounts.qualified / statusCounts.contacted) * 100) : 0 },
        { stage: 'Qualified → Proposal', rate: statusCounts.proposal_sent > 0 ? Math.round((statusCounts.proposal_sent / statusCounts.qualified) * 100) : 0 },
        { stage: 'Proposal → Won', rate: statusCounts.closed_won > 0 ? Math.round((statusCounts.closed_won / statusCounts.proposal_sent) * 100) : 0 }
    ];

    // Score distribution
    const scoreDistribution = [
        { range: '0-20', count: leads.filter(l => (l.lead_score || 0) >= 0 && (l.lead_score || 0) <= 20).length },
        { range: '21-40', count: leads.filter(l => (l.lead_score || 0) >= 21 && (l.lead_score || 0) <= 40).length },
        { range: '41-60', count: leads.filter(l => (l.lead_score || 0) >= 41 && (l.lead_score || 0) <= 60).length },
        { range: '61-80', count: leads.filter(l => (l.lead_score || 0) >= 61 && (l.lead_score || 0) <= 80).length },
        { range: '81-100', count: leads.filter(l => (l.lead_score || 0) >= 81 && (l.lead_score || 0) <= 100).length }
    ];

    const metrics = [
        { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-600' },
        { label: 'Avg Lead Score', value: avgScore, icon: Target, color: 'text-orange-600' },
        { label: 'Pipeline Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-green-600' },
        { label: 'Won Deals', value: statusCounts.closed_won, icon: CheckCircle2, color: 'text-emerald-600' }
    ];

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                                    <p className="text-2xl font-bold mt-2">{metric.value}</p>
                                </div>
                                <Icon className={`w-8 h-8 ${metric.color}`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Sales Pipeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border rounded-lg p-6"
                >
                    <h3 className="font-semibold mb-4">Sales Pipeline Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pipelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Lead Score Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border rounded-lg p-6"
                >
                    <h3 className="font-semibold mb-4">Lead Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Conversion Rates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border rounded-lg p-6"
                >
                    <h3 className="font-semibold mb-4">Conversion Rates by Stage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={conversionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="rate" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-card border rounded-lg p-6"
                >
                    <h3 className="font-semibold mb-4">Leads by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pipelineData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pipelineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
}