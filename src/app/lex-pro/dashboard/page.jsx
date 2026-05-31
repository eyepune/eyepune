"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldAlert, CheckCircle2, Clock, Plus, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function LexProDashboard() {
    const router = useRouter();
    const [recentContracts, setRecentContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dbError, setDbError] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await fetch('/api/lex-pro/contracts');
                const data = await response.json();
                
                if (data.success) {
                    setRecentContracts(data.contracts);
                } else {
                    setDbError(data.error || 'Failed to fetch contracts');
                }
            } catch (err) {
                setDbError('Network error connecting to database');
            } finally {
                setIsLoading(false);
            }
        };
        fetchContracts();
    }, []);

    const stats = [
        { label: 'Total Contracts', value: recentContracts.length.toString(), icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'High Risk Clauses Found', value: '0', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Ready for Signature', value: recentContracts.filter(c => c.status === 'Ready').length.toString(), icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Pending Review', value: recentContracts.filter(c => c.status === 'Reviewing' || c.status === 'Draft').length.toString(), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Lex Pro</span></h1>
                    <p className="text-gray-400">Here's an overview of your contract lifecycle and AI insights.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/lex-pro/analyze">
                        <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300">
                            Analyze Document
                        </Button>
                    </Link>
                    <Link href="/lex-pro/draft">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <Plus className="w-4 h-4 mr-2" />
                            New Draft
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Recent Contracts</h2>
                    <Button variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-sm h-8">
                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 flex justify-center items-center">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                        </div>
                    ) : dbError ? (
                        <div className="p-8 text-center border border-red-500/20 bg-red-500/10 m-4 rounded-xl">
                            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <h3 className="text-red-400 font-bold">Database Connection Error</h3>
                            <p className="text-red-300 text-sm mt-1">{dbError}</p>
                            <p className="text-red-400/70 text-xs mt-2">Did you run the supabase_lex_pro_schema.sql script in your Supabase SQL editor?</p>
                        </div>
                    ) : recentContracts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No contracts found. Start by drafting a new one!
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Contract Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">AI Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {recentContracts.map((contract, i) => {
                                    // For MVP, if risk_score isn't set, default to Pending
                                    const risk = contract.risk_score ? (contract.risk_score < 40 ? 'High' : contract.risk_score < 70 ? 'Medium' : 'Low') : 'Pending';
                                    return (
                                    <tr 
                                        key={contract.id || i} 
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => router.push(`/lex-pro/draft?id=${contract.id}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-orange-300 transition-colors">
                                            {contract.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
                                                {contract.contract_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {contract.created_at ? formatDistanceToNow(new Date(contract.created_at), { addSuffix: true }) : 'Just now'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-medium ${
                                                contract.status === 'Draft' ? 'text-blue-400' :
                                                contract.status === 'Ready' ? 'text-green-400' :
                                                contract.status === 'High Risk' ? 'text-red-400' :
                                                'text-orange-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    contract.status === 'Draft' ? 'bg-blue-400' :
                                                    contract.status === 'Ready' ? 'bg-green-400' :
                                                    contract.status === 'High Risk' ? 'bg-red-400' :
                                                    'bg-orange-400'
                                                }`} />
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                                risk === 'Low' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                                                risk === 'Medium' ? 'bg-orange-400/10 text-orange-400 border border-orange-400/20' :
                                                risk === 'Pending' ? 'bg-gray-400/10 text-gray-400 border border-gray-400/20' :
                                                'bg-red-400/10 text-red-400 border border-red-400/20'
                                            }`}>
                                                {risk}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
