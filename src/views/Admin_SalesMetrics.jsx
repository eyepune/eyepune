import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, Mail, MessageSquare, Calendar, DollarSign, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const COLORS = {
    hot: '#ef4444',
    warm: '#f59e0b',
    cold: '#3b82f6',
    positive: '#10b981',
    neutral: '#6b7280',
    negative: '#ef4444',
    mixed: '#f59e0b'
};

export default function Admin_SalesMetrics() {
    const { data: metricsData, isLoading, error } = useQuery({
        queryKey: ['sales-metrics'],
        queryFn: async () => {
            try {
                const response = await base44.functions.invoke('getSalesMetrics');
                if (response.data) return response.data;
                throw new Error('No data from function');
            } catch (err) {
                console.log('Edge function failed, falling back to RPC...', err);
                const { data, error: rpcError } = await base44.rpc('get_sales_metrics');
                if (rpcError) throw rpcError;
                // Transform RPC data to match expected metrics structure if needed
                return { metrics: data };
            }
        },
        refetchInterval: 300000
    });

    const metrics = metricsData?.metrics;

    if (isLoading) {
        return (
            <AdminGuard>
                <AdminLayout>
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <div className="text-center">
                            <Skeleton className="h-12 w-64 mx-auto mb-4" />
                            <div className="grid md:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-32" />
                                ))}
                            </div>
                        </div>
                    </div>
                </AdminLayout>
            </AdminGuard>
        );
    }

    const scoreRangeData = [
        { name: 'Hot (80+)', value: metrics?.scoreRanges?.hot || 0, color: COLORS.hot },
        { name: 'Warm (50-79)', value: metrics?.scoreRanges?.warm || 0, color: COLORS.warm },
        { name: 'Cold (<50)', value: metrics?.scoreRanges?.cold || 0, color: COLORS.cold }
    ];
    const hasScoreData = scoreRangeData.some(d => d.value > 0);

    const sentimentData = [
        { name: 'Positive', value: metrics?.sentimentCounts?.positive || 0, color: COLORS.positive },
        { name: 'Neutral', value: metrics?.sentimentCounts?.neutral || 0, color: COLORS.neutral },
        { name: 'Negative', value: metrics?.sentimentCounts?.negative || 0, color: COLORS.negative },
        { name: 'Mixed', value: metrics?.sentimentCounts?.mixed || 0, color: COLORS.mixed }
    ];

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Sales Analytics Dashboard</h1>
                        <p className="text-gray-500">Real-time insights into your sales performance</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Total Leads</CardTitle>
                                <Users className="w-4 h-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{metrics?.totalLeads || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Hot Leads</CardTitle>
                                <TrendingUp className="w-4 h-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{metrics?.scoreRanges?.hot || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">Score 80+</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Avg Revenue Potential</CardTitle>
                                <DollarSign className="w-4 h-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">₹{(metrics?.avgRevenuePotential || 0).toLocaleString()}</div>
                                <p className="text-xs text-gray-500 mt-1">Per lead</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Email Open Rate</CardTitle>
                                <Mail className="w-4 h-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{metrics?.campaignPerformance?.openRate || 0}%</div>
                                <p className="text-xs text-gray-500 mt-1">{metrics?.campaignPerformance?.totalSent || 0} sent</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Lead Score Distribution */}
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader>
                                <CardTitle className="text-white">Lead Score Distribution</CardTitle>
                                <CardDescription className="text-gray-500">Breakdown by temperature</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hasScoreData ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={scoreRangeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={100}
                                            dataKey="value"
                                        >
                                            {scoreRangeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                        <p>Insufficient scoring data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Conversion Rates by Source */}
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader>
                                <CardTitle className="text-white">Conversion by Lead Source</CardTitle>
                                <CardDescription className="text-gray-500">Channel performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={metrics?.conversionRates || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="source" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                                        <Bar dataKey="rate" fill="#3b82f6" name="Conversion Rate %" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Performance */}
                    <Card className="bg-[#111] border-white/[0.06]">
                        <CardHeader>
                            <CardTitle className="text-white">Email Campaign Analytics</CardTitle>
                            <CardDescription className="text-gray-500">Automated nurturing effectiveness</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-400">Open Rate</span>
                                        <span className="text-2xl font-bold text-white">{metrics?.campaignPerformance?.openRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/[0.03] rounded-full h-1.5">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${metrics?.campaignPerformance?.openRate || 0}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-400">CTR</span>
                                        <span className="text-2xl font-bold text-white">{metrics?.campaignPerformance?.clickRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/[0.03] rounded-full h-1.5">
                                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${metrics?.campaignPerformance?.clickRate || 0}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-400">Conv. Rate</span>
                                        <span className="text-2xl font-bold text-white">{metrics?.campaignPerformance?.conversionRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/[0.03] rounded-full h-1.5">
                                        <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${metrics?.campaignPerformance?.conversionRate || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}