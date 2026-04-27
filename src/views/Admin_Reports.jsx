import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Target, Sparkles, MessageCircle, Package, Activity, RefreshCw, Download } from 'lucide-react';
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from 'framer-motion';

const COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0891b2'];

function Admin_Reports() {
    const [period, setPeriod] = useState('month');

    const { data: metrics, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-metrics', period],
        queryFn: async () => {
            const response = await base44.functions.invoke('generateDashboardMetrics', { period });
            return response.data;
        }
    });

    const handleExport = () => {
        const dataStr = JSON.stringify(metrics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    const salesData = metrics?.salesMetrics;
    const assessmentData = metrics?.assessmentInsights;
    const aiAssistantData = metrics?.aiAssistantMetrics;
    const packageData = metrics?.packageBuilderMetrics;
    const activitiesData = metrics?.recentActivities;

    // Transform data for charts
    const leadStatusData = salesData?.leadsByStatus ? Object.entries(salesData.leadsByStatus).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
    })) : [];

    const revenueSourceData = salesData?.revenueBySource ? Object.entries(salesData.revenueBySource).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        revenue: value
    })) : [];

    const activityTypeData = activitiesData ? Object.entries(activitiesData).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: value
    })) : [];

    return (
        <div className="py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                            <p className="text-muted-foreground">
                                Comprehensive insights across all business operations
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Last 7 Days</SelectItem>
                                    <SelectItem value="month">Last Month</SelectItem>
                                    <SelectItem value="quarter">Last Quarter</SelectItem>
                                    <SelectItem value="year">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Users className="w-8 h-8 text-blue-600" />
                                        <span className="text-2xl font-bold">{salesData?.totalLeads || 0}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Leads</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {salesData?.conversionRate}% conversion rate
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Calendar className="w-8 h-8 text-purple-600" />
                                        <span className="text-2xl font-bold">{salesData?.totalBookings || 0}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Bookings</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {salesData?.completedBookings} completed
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <DollarSign className="w-8 h-8 text-green-600" />
                                        <span className="text-2xl font-bold">₹{(salesData?.totalRevenue / 100000).toFixed(1)}L</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Avg: ₹{(salesData?.avgDealSize / 1000).toFixed(0)}K
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Target className="w-8 h-8 text-red-600" />
                                        <span className="text-2xl font-bold">{assessmentData?.totalAssessments || 0}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">AI Assessments</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Avg score: {assessmentData?.avgScore}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Lead Status Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Lead Pipeline
                                </CardTitle>
                                <CardDescription>Distribution of leads by status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={leadStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {leadStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Revenue by Source */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Revenue by Source
                                </CardTitle>
                                <CardDescription>Where your revenue is coming from</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueSourceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                        <Bar dataKey="revenue" fill="#dc2626" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Assessment Insights */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                AI Assessment Insights
                            </CardTitle>
                            <CardDescription>Trends and patterns from business assessments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-3xl font-bold text-red-600">{assessmentData?.highScoreLeads}</p>
                                    <p className="text-sm text-muted-foreground">High-Score Leads (70+)</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-3xl font-bold text-red-600">{assessmentData?.assessmentConversionRate}%</p>
                                    <p className="text-sm text-muted-foreground">Assessment → Lead Conversion</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-3xl font-bold text-red-600">{assessmentData?.avgScore}</p>
                                    <p className="text-sm text-muted-foreground">Average Growth Score</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Top Business Challenges</h4>
                                <div className="space-y-2">
                                    {assessmentData?.topChallenges?.map((challenge, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                                                <div 
                                                    className="bg-red-600 h-full flex items-center px-3 text-white text-sm font-medium"
                                                    style={{ 
                                                        width: `${(challenge.count / assessmentData.totalAssessments) * 100}%`,
                                                        minWidth: '60px'
                                                    }}
                                                >
                                                    {challenge.name}
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">{challenge.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* AI Sales Assistant */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    AI Sales Assistant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Conversations</span>
                                    <span className="font-bold">{aiAssistantData?.totalConversations || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Active Conversations</span>
                                    <span className="font-bold">{aiAssistantData?.activeConversations || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Leads Generated</span>
                                    <span className="font-bold">{aiAssistantData?.leadsFromAssistant || 0}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Engagement Rate</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {aiAssistantData?.engagementRate}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Package Builder */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Package Builder
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Packages Created</span>
                                    <span className="font-bold">{packageData?.packagesCreatedRecently || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Active Packages</span>
                                    <span className="font-bold">{packageData?.activePackages || 0}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        AI-powered package creation streamlines pricing strategy
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Activity Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={activityTypeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#dc2626" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
        </div>
    );
}

export default function AdminReportsPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Admin_Reports />
            </AdminLayout>
        </AdminGuard>
    );
}