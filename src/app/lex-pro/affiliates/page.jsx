"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Users, DollarSign, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LexProAffiliates() {
    const [copied, setCopied] = useState(false);
    
    // In production, this would be fetched from Supabase auth profile
    const partnerId = "cc_legal_8f92j";
    const affiliateLink = `https://eyepune.com/lex-pro?ref=${partnerId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Partner & Affiliate Hub</h1>
                <p className="text-gray-400">Manage your referrals, track commissions, and access marketing assets.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: "Total Referrals", value: "14", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { title: "Active Subscriptions", value: "8", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
                    { title: "Pending Commission", value: "₹24,500", icon: DollarSign, color: "text-orange-400", bg: "bg-orange-500/10" },
                    { title: "Paid Commission", value: "₹12,000", icon: CheckCircle2, color: "text-slate-400", bg: "bg-slate-500/10" }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Affiliate Link Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-[#0D1425] to-black border border-blue-900/30 rounded-2xl p-6 md:p-8 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-blue-400" />
                            Your Unique Referral Link
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Share this link with your clients or network. When they sign up for Lex Pro Enterprise, you will automatically earn a 20% recurring commission for the lifetime of their subscription.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono truncate">
                                {affiliateLink}
                            </div>
                            <Button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4">Recent Referrals</h3>
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-500 border-b border-white/10">
                                <tr>
                                    <th className="pb-3">Client/Firm Name</th>
                                    <th className="pb-3">Date Joined</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { name: "ClearClause Legal", date: "May 28, 2026", status: "Active" },
                                    { name: "Nexus Startups Inc", date: "May 25, 2026", status: "Active" },
                                    { name: "Global Tech Solutions", date: "May 12, 2026", status: "Pending Trial" }
                                ].map((ref, idx) => (
                                    <tr key={idx} className="text-gray-300">
                                        <td className="py-4 font-medium text-white">{ref.name}</td>
                                        <td className="py-4 text-gray-400">{ref.date}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                ref.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Partner Integration Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white mb-2">Partner Integration</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Are you a specialized law firm like <strong className="text-blue-300">ClearClause Legal</strong>? 
                            Embed Lex Pro directly into your website to offer instant AI drafting to your clients.
                        </p>
                        <Button className="w-full bg-white text-black hover:bg-gray-200">
                            Get Embed Code
                        </Button>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4">Payout Settings</h3>
                        <p className="text-xs text-gray-400 mb-4">Commissions are paid out on the 1st of every month via Razorpay X.</p>
                        <div className="space-y-4">
                            <div className="bg-black/40 rounded p-3 border border-white/5">
                                <p className="text-xs text-gray-500">Bank Account</p>
                                <p className="text-sm font-medium text-gray-200">HDFC Bank ****4592</p>
                            </div>
                            <Button variant="outline" className="w-full border-white/10 text-gray-300">
                                Update Payment Method
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
