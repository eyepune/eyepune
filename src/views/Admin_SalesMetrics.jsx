import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminGuard from '@/components/admin/AdminGuard';
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
            const response = await base44.functions.invoke('getSalesMetrics');
            return response.data;
        },
        refetchInterval: 300000
    });

    const metrics = metricsData?.metrics;

    if (isLoading) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <div className="grid md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32" />
                            ))}
                        </div>
                    </div>
                </div>
            </AdminGuard>
        );
    }

    if (error || !metricsData?.success) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                    <p className="text-muted-foreground">Failed to load metrics. Please try again.</p>
                </div>
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
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Sales Analytics Dashboard</h1>
                        <p className="text-muted-foreground">Real-time insights into your sales performance</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{metrics?.totalLeads || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All time
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                                <TrendingUp className="w-4 h-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{metrics?.scoreRanges.hot || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Score 80+
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Avg Revenue Potential</CardTitle>
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₹{(metrics?.avgRevenuePotential || 0).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Per lead
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
                                <Mail className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{metrics?.campaignPerformance.openRate || 0}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {metrics?.campaignPerformance.totalSent || 0} sent
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Lead Score Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Score Distribution</CardTitle>
                                <CardDescription>Breakdown by temperature</CardDescription>
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
                                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <p>All {metrics?.totalLeads || 0} leads have score 0 (Cold)</p>
                                        <p className="text-xs mt-1">Run lead scoring to update scores</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Conversion Rates by Source */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversion by Lead Source</CardTitle>
                                <CardDescription>Which channels perform best</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={metrics?.conversionRates || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="source" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="rate" fill="#3b82f6" name="Conversion Rate %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sentiment Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sentiment Analysis Trends (Last 30 Days)</CardTitle>
                            <CardDescription>Track customer sentiment over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-4 gap-4 mb-6">
                                {sentimentData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-3 p-4 rounded-lg border">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <div>
                                            <p className="text-2xl font-bold">{item.value}</p>
                                            <p className="text-sm text-muted-foreground">{item.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics?.sentimentTrends || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} />
                                    <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} />
                                    <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Campaign Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Campaign Performance</CardTitle>
                                <CardDescription>Automated nurturing effectiveness</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Open Rate</span>
                                        <span className="text-2xl font-bold">{metrics?.campaignPerformance.openRate}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${metrics?.campaignPerformance.openRate}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Click-Through Rate</span>
                                        <span className="text-2xl font-bold">{metrics?.campaignPerformance.clickRate}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ width: `${metrics?.campaignPerformance.clickRate}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Conversion Rate</span>
                                        <span className="text-2xl font-bold">{metrics?.campaignPerformance.conversionRate}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div 
                                            className="bg-red-600 h-2 rounded-full" 
                                            style={{ width: `${metrics?.campaignPerformance.conversionRate}%` }}
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold">{metrics?.campaignPerformance.totalSent}</p>
                                                <p className="text-xs text-muted-foreground">Sent</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{metrics?.campaignPerformance.clicked}</p>
                                                <p className="text-xs text-muted-foreground">Clicked</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{metrics?.campaignPerformance.converted}</p>
                                                <p className="text-xs text-muted-foreground">Converted</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Calls */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Upcoming Scheduled Calls
                                </CardTitle>
                                <CardDescription>Next {metrics?.upcomingBookings?.length || 0} consultations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {metrics?.upcomingBookings?.length > 0 ? (
                                        metrics.upcomingBookings.map((booking) => (
                                            <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                <Calendar className="w-4 h-4 text-red-600 mt-1" />
                                                <div className="flex-1">
                                                    <p className="font-medium">{booking.name}</p>
                                                    <p className="text-sm text-muted-foreground">{booking.company || 'No company'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {booking.booking_type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(booking.scheduled_date).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No upcoming calls scheduled
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Recent Sales Activities
                            </CardTitle>
                            <CardDescription>Latest interactions and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {metrics?.recentActivities?.slice(0, 10).map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.activity_type}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(activity.created_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminGuard>
    );
}