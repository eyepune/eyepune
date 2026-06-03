"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Database, ShieldAlert, CheckCircle2, Bot, Layers, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LexProLandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0F1C] text-gray-100 font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
            {/* Background ambient effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-[#0A0F1C]/0 to-[#0A0F1C]/0 rounded-full" />
                <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600/10 via-[#0A0F1C]/0 to-[#0A0F1C]/0 rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <Link href="/lex-pro" className="flex items-center -ml-4">
                    <img src="/lexpro_logo.png" alt="LexPro Logo" className="h-12 md:h-16 w-auto object-contain scale-[1.5] md:scale-[2.5] origin-left" style={{ filter: 'brightness(0) invert(1)' }} />
                </Link>
                <div className="flex items-center gap-6 font-medium text-sm">
                    <Link href="#features" className="text-gray-300 hover:text-blue-400 transition-colors hidden md:block">Features</Link>
                    <Link href="#pricing" className="text-gray-300 hover:text-blue-400 transition-colors hidden md:block">Pricing</Link>
                    <Link href="/lex-pro/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
                    <Link href="/lex-pro/login">
                        <Button className="bg-white text-[#0A0F1C] hover:bg-gray-200 rounded-full px-6 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-4 max-w-7xl mx-auto text-center flex flex-col items-center">

                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121B33]/50 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-8 backdrop-blur-sm"
                >
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-300">A Product by EyE PunE</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] max-w-4xl"
                >
                    The Autonomous Legal OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">India.</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
                >
                    Draft complex contracts, bulk-generate NDAs, and analyze legal risk clause-by-clause with pinpoint accuracy based on the Indian Contract Act.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                    <Link href="/lex-pro/login">
                        <Button className="h-14 px-8 rounded-full text-lg font-bold bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-500 hover:to-slate-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            Enter Workspace <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
                        Book a Demo
                    </Button>
                </motion.div>


            </section>

            {/* Features Bento Grid */}
            <section id="features" className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Enterprise Features</h2>
                    <p className="text-gray-400 text-lg">Built for speed, accuracy, and absolute legal defensibility.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Big Feature */}
                    <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors" />
                        <FileText className="w-12 h-12 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-3">AI Contract Drafting</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md">Instantly draft 16+ highly specific Indian corporate agreements. The engine automatically weaves your variables (salary, vesting, royalties) into watertight legal clauses.</p>
                    </div>

                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <Database className="w-12 h-12 text-slate-400 mb-6" />
                        <h3 className="text-xl font-bold mb-3">Bulk Generation</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">Upload a CSV dataset to autonomously generate and save hundreds of employee agreements or NDAs simultaneously.</p>
                    </div>

                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <ShieldAlert className="w-12 h-12 text-yellow-400 mb-6" />
                        <h3 className="text-xl font-bold mb-3">Risk Analysis</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">Upload any PDF contract. Our engine extracts the text and flags high-risk clauses against Indian law in seconds.</p>
                    </div>

                    <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-12" />
                        <Lock className="w-12 h-12 text-white mb-6 relative z-10" />
                        <h3 className="text-2xl font-bold mb-3 relative z-10">Multi-Tenant Isolation</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md relative z-10">Bank-grade security. Every law firm or corporate workspace is cryptographically isolated using Supabase Row Level Security.</p>
                    </div>
                </div>
            </section>

            {/* CTA Pre-footer */}
            <section className="relative z-10 py-24 px-4 max-w-5xl mx-auto text-center border-t border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to upgrade your firm?</h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join the elite Indian law firms and startups automating their legal drafting and risk analysis.</p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/lex-pro/login">
                        <Button className="h-14 px-8 text-lg font-bold bg-white text-[#0A0F1C] hover:bg-gray-100 rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                            Start Building Now
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-blue-900/30 bg-[#070B14] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-1">
                            <Link href="/lex-pro" className="inline-block mb-4 -ml-4">
                                <img src="/lexpro_logo.png" alt="LexPro Logo" className="h-12 md:h-16 w-auto object-contain scale-[1.5] md:scale-[2.5] origin-left" style={{ filter: 'brightness(0) invert(1)' }} />
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                The autonomous legal drafting and intelligence engine built specifically for the Indian legal framework.
                            </p>
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/10 border border-blue-500/10 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">A Product by EyE PunE</span>
                                </div>

                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/lex-pro/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link href="/lex-pro/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Solutions</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="/lex-pro/law-firms" className="hover:text-white transition-colors">For Law Firms</Link></li>
                                <li><Link href="/lex-pro/startups" className="hover:text-white transition-colors">For Startups</Link></li>
                                <li><Link href="/lex-pro/enterprise-api" className="hover:text-white transition-colors">Enterprise API</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="/PrivacyPolicy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/Terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/Disclaimer" className="hover:text-white transition-colors">Legal Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} EyE PunE. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>Built in Pune, India</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
