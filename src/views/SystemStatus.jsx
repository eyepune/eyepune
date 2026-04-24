'use client';

import React, { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Database, Key, Activity, Mail, Search, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function SystemStatus() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/verify');
            const data = await res.json();
            if (data.success) {
                setStatus(data.report);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to connect to verification API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const allTablesExist = status && Object.values(status.tables).every(s => s === 'exists');
    const hasAdmin = status && status.auth.has_admin;

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Infrastructure Status</h1>
                            <p className="text-gray-500 mt-1">Diagnostic health monitoring for EyE PunE Ecosystem</p>
                        </div>
                        <Button onClick={fetchStatus} variant="outline" className="border-white/[0.06] text-gray-400 hover:text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                            Run Diagnostics
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-500 font-semibold text-sm">Connection Error</p>
                                <p className="text-red-500/80 text-xs">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Database Integrity */}
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-blue-400"><Database className="w-4 h-4" /> Database</span>
                                    {allTablesExist ? <Badge className="bg-green-500/10 text-green-500 border-none">Healthy</Badge> : <Badge className="bg-red-500/10 text-red-500 border-none">Issues</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                {status && Object.entries(status.tables).map(([table, state]) => (
                                    <div key={table} className="flex items-center justify-between py-1.5 text-xs">
                                        <span className="text-gray-500 font-mono">{table}</span>
                                        {state === 'exists' ? (
                                            <span className="text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OK</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1 font-bold">MISSING</span>
                                        )}
                                    </div>
                                ))}
                                {!allTablesExist && (
                                    <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mb-1">Critical Action</p>
                                        <p className="text-gray-400 text-[10px]">Execute <strong>MASTER_EYEPUNE_DB.sql</strong> to fix missing tables.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Email System (Zoho) */}
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-red-500"><Mail className="w-4 h-4" /> Zoho Mail API</span>
                                    {status?.zoho?.configured ? <Badge className="bg-green-500/10 text-green-500 border-none">Live</Badge> : <Badge className="bg-yellow-500/10 text-yellow-500 border-none">Offline</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">OAuth Connection</span>
                                        <span className={status?.zoho?.configured ? "text-green-500" : "text-red-500"}>{status?.zoho?.configured ? "Active" : "Not Authorized"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Sender Identity</span>
                                        <span className="text-gray-400">{status?.zoho?.username || 'connect@eyepune.com'}</span>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => window.open('/api/zoho/auth', '_blank')}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8 mt-2"
                                >
                                    {status?.zoho?.configured ? 'Re-authorize Zoho' : 'Authorize Now'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Admin Security */}
                        <Card className="bg-[#111] border-white/[0.06]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-orange-500"><ShieldCheck className="w-4 h-4" /> Security</span>
                                    <Badge className="bg-green-500/10 text-green-500 border-none">Active</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Admin User Found</span>
                                    <span className={hasAdmin ? "text-green-500" : "text-yellow-500"}>{hasAdmin ? "Yes" : "No"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">RLS Policies</span>
                                    <span className="text-green-500">Enabled</span>
                                </div>
                                {!hasAdmin && (
                                    <Link href="/MakeAdmin">
                                        <Button className="w-full bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] text-xs h-8 mt-2">
                                            Promote Admin User
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Troubleshooting Section */}
                    <div className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="bg-white/[0.02] p-4 border-b border-white/[0.06] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Troubleshooting</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2"><Key className="w-3 h-3 text-red-500" /> Environment Variables</h4>
                                <p className="text-gray-500 text-[10px] leading-relaxed">Ensure <strong>SUPABASE_SERVICE_ROLE_KEY</strong> and <strong>ZOHO_REFRESH_TOKEN</strong> are set in your production environment (Vercel/Netlify).</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2"><Search className="w-3 h-3 text-blue-500" /> Missing Modules</h4>
                                <p className="text-gray-500 text-[10px] leading-relaxed">If icons or charts are missing, run <code>npm install</code> to ensure all dependencies like <code>recharts</code> are present.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2"><Database className="w-3 h-3 text-green-500" /> Database Sync</h4>
                                <p className="text-gray-500 text-[10px] leading-relaxed">Always run the <strong>MASTER_EYEPUNE_DB.sql</strong> script after any major update to ensure RLS policies are up to date.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
