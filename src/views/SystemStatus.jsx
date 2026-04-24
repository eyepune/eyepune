'use client';

import React, { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Database, Key, Activity, Mail, Search, Zap, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SystemStatus() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-300">Diagnostics</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">System Infrastructure</h1>
                            <p className="text-gray-400 mt-2 text-sm max-w-xl">
                                Real-time health monitoring for the EyE PunE Ecosystem components.
                            </p>
                        </div>
                        <Button onClick={fetchStatus} disabled={loading} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-lg shadow-black/20 h-11 px-6">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                            Run Diagnostics
                        </Button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 relative z-10 shadow-lg shadow-red-500/5">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-500 font-semibold text-sm">Connection Error</p>
                                <p className="text-red-500/80 text-xs mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {/* Database Integrity */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className={cn(
                                "bg-[#0c0c0c]/80 backdrop-blur-xl transition-colors h-full flex flex-col relative overflow-hidden",
                                allTablesExist ? "border-white/5 hover:border-emerald-500/30" : "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            )}>
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-100 transition-opacity", allTablesExist ? "from-emerald-600/5 to-transparent" : "from-red-600/5 to-transparent")} />
                                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Database className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span>Database Tables</span>
                                        </div>
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        ) : allTablesExist ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Healthy</Badge>
                                        ) : (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Issues</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4 flex-grow">
                                    {status && Object.entries(status.tables).map(([table, state]) => (
                                        <div key={table} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 pb-2">
                                            <span className="text-gray-400 text-xs font-mono">{table}</span>
                                            {state === 'exists' ? (
                                                <span className="text-emerald-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> OK</span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><XCircle className="w-3.5 h-3.5" /> Missing</span>
                                            )}
                                        </div>
                                    ))}
                                    {!loading && !allTablesExist && status && (
                                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Critical Action Needed</p>
                                            <p className="text-red-500/80 text-[11px] leading-relaxed">Execute the setup SQL script in your Supabase dashboard to create missing tables.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Email System (Zoho) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className={cn(
                                "bg-[#0c0c0c]/80 backdrop-blur-xl transition-colors h-full flex flex-col relative overflow-hidden",
                                status?.zoho?.configured ? "border-white/5 hover:border-emerald-500/30" : "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            )}>
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-100 transition-opacity", status?.zoho?.configured ? "from-emerald-600/5 to-transparent" : "from-amber-600/5 to-transparent")} />
                                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                <Mail className="w-4 h-4 text-red-500" />
                                            </div>
                                            <span>Zoho Mail API</span>
                                        </div>
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        ) : status?.zoho?.configured ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Live</Badge>
                                        ) : (
                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Offline</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 flex flex-col flex-grow">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">OAuth Connection</span>
                                            <span className={cn("text-xs font-bold", status?.zoho?.configured ? "text-emerald-500" : "text-amber-500")}>
                                                {loading ? '...' : status?.zoho?.configured ? "Active" : "Not Authorized"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Sender Identity</span>
                                            <span className="text-gray-300 font-mono text-xs">{status?.zoho?.username || 'admin@eyepune.com'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-4">
                                        <Button 
                                            onClick={() => window.open('/api/zoho/auth', '_blank')}
                                            disabled={loading}
                                            className={cn(
                                                "w-full h-10 shadow-lg border-0",
                                                status?.zoho?.configured 
                                                    ? "bg-white/5 hover:bg-white/10 text-white" 
                                                    : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-500/20"
                                            )}
                                        >
                                            {status?.zoho?.configured ? 'Re-authorize Zoho' : 'Authorize Now'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Admin Security */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className={cn(
                                "bg-[#0c0c0c]/80 backdrop-blur-xl transition-colors h-full flex flex-col relative overflow-hidden",
                                hasAdmin ? "border-white/5 hover:border-emerald-500/30" : "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            )}>
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-100 transition-opacity", hasAdmin ? "from-emerald-600/5 to-transparent" : "from-amber-600/5 to-transparent")} />
                                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.01]">
                                    <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                <ShieldCheck className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <span>Access & Security</span>
                                        </div>
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        ) : hasAdmin ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Protected</Badge>
                                        ) : (
                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">Warning</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 flex flex-col flex-grow">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Master Admin Found</span>
                                            <span className={cn("text-xs font-bold", hasAdmin ? "text-emerald-500" : "text-amber-500")}>
                                                {loading ? '...' : hasAdmin ? "Yes" : "No"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">RLS Security Policies</span>
                                            <span className="text-emerald-500 text-xs font-bold">Enabled</span>
                                        </div>
                                    </div>
                                    
                                    {!loading && !hasAdmin && (
                                        <div className="mt-auto pt-4">
                                            <Link href="/MakeAdmin">
                                                <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20 border-0 h-10">
                                                    Promote First Admin
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Troubleshooting Section */}
                    <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative z-10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
                        <div className="bg-white/[0.01] p-5 border-b border-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                <Zap className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Troubleshooting</h3>
                                <p className="text-xs text-gray-500">Common fixes for platform configuration issues</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2 mb-3"><Key className="w-3.5 h-3.5 text-red-500" /> Environment Variables</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">Ensure <code className="bg-black/50 px-1 py-0.5 rounded text-gray-300 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> and <code className="bg-black/50 px-1 py-0.5 rounded text-gray-300 font-mono">ZOHO_REFRESH_TOKEN</code> are set in your production environment.</p>
                            </div>
                            <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2 mb-3"><Search className="w-3.5 h-3.5 text-blue-500" /> Build Artifacts</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">If icons or charts are missing, clear your package manager cache and reinstall dependencies to ensure all modules are present.</p>
                            </div>
                            <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <h4 className="text-white text-xs font-bold flex items-center gap-2 mb-3"><Database className="w-3.5 h-3.5 text-green-500" /> Database Sync</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">Execute the SQL migration scripts in your Supabase SQL editor after any major platform update to maintain schema integrity.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
