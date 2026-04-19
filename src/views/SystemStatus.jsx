'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Database, Key } from 'lucide-react';
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

    if (loading) {
        return (
            <Layout currentPageName="System Status">
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                </div>
            </Layout>
        );
    }

    const allTablesExist = status && Object.values(status.tables).every(s => s === 'exists');
    const hasAdmin = status && status.auth.has_admin;

    return (
        <Layout currentPageName="System Status">
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">System Status</h1>
                        <p className="text-gray-500">Diagnostic dashboard for EyE PunE infrastructure</p>
                    </div>
                    <Button onClick={fetchStatus} variant="outline" size="sm">Refresh</Button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-500 font-semibold">Critical Error</p>
                            <p className="text-red-500/80 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Database Tables */}
                    <Card className="bg-[#111] border-white/[0.06]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" />
                                Database Integrity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {status && Object.entries(status.tables).map(([table, state]) => (
                                <div key={table} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                    <span className="text-gray-400 font-mono text-sm">{table}</span>
                                    {state === 'exists' ? (
                                        <div className="flex items-center text-green-500 text-xs gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Ready
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-500 text-xs gap-1">
                                            <XCircle className="w-3 h-3" /> Missing
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!allTablesExist && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-500 text-xs font-medium mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" /> Action Required
                                    </p>
                                    <p className="text-gray-400 text-[10px] leading-relaxed">
                                        Some tables are missing. Please run the <strong>SETUP_DATABASE.sql</strong> script in your Supabase SQL Editor.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Authentication & Admin */}
                    <Card className="bg-[#111] border-white/[0.06]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-red-600" />
                                Auth & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Registered Users</span>
                                <span className="text-white font-bold">{status?.auth.users_count || 0}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Admin Account</span>
                                {hasAdmin ? (
                                    <div className="flex items-center text-green-500 text-xs gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </div>
                                ) : (
                                    <div className="flex items-center text-yellow-500 text-xs gap-1">
                                        <AlertTriangle className="w-3 h-3" /> None Found
                                    </div>
                                )}
                            </div>

                            {!hasAdmin && status?.auth.users_count > 0 && (
                                <div className="space-y-3">
                                    <p className="text-gray-500 text-xs">
                                        You have users but no admin. You can promote the first user to admin using the setup tool.
                                    </p>
                                    <Link href="/MakeAdmin">
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-9">
                                            Open Setup Tool
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {!hasAdmin && status?.auth.users_count === 0 && (
                                <div className="space-y-3 text-center">
                                    <p className="text-gray-500 text-xs">
                                        No users registered yet. Please sign up first.
                                    </p>
                                    <Link href="/Login">
                                        <Button variant="outline" className="w-full h-9">Sign Up Page</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* troubleshooting */}
                <Card className="bg-[#111] border-white/[0.06] border-red-500/20">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                           <Key className="w-5 h-5 text-red-500" /> Troubleshooting Guide
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <h4 className="text-white font-bold">1. Supabase Connection</h4>
                                <p className="text-gray-500 text-xs">Check <strong>.env</strong> in your root. It must have <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>. Ensure there are no spaces around the equals sign.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-bold">2. Local Development</h4>
                                <p className="text-gray-500 text-xs">If you just changed your .env file, you <strong>must restart</strong> your development server for changes to take effect.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-bold">3. Database Runtime</h4>
                                <p className="text-gray-500 text-xs">Ensure your Supabase project is not "Paused". Log into Supabase Dashboard to check the project status.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
