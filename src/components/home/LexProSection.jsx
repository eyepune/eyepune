import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Scale, ShieldCheck, FileText, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

const features = [
    { icon: FileText, text: 'AI drafting for 15+ Indian contract types' },
    { icon: ShieldCheck, text: 'Clause risk analysis & compliance scoring' },
    { icon: Scale, text: 'Indian Contract Act & IPC alignment' },
    { icon: Zap, text: 'E-sign & full lifecycle management' },
];

export default function LexProSection() {
    return (
        <section className="py-32 relative overflow-hidden bg-[#040404]">
            {/* Orange accent glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px]"
                    style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left — visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative order-2 lg:order-1"
                    >
                        {/* Decorative card stack */}
                        <div className="relative h-[500px]">
                            {/* BG glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-2xl" />

                            {/* Card stack layers */}
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute top-8 left-8 right-8 bottom-8 rounded-3xl bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/10"
                            />
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                                className="absolute top-4 left-4 right-4 bottom-4 rounded-3xl bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/15"
                            />

                            {/* Main card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-3xl overflow-hidden border border-orange-500/20 bg-[#0a0604]"
                            >
                                <img
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/b532a4c62_generated_image.png"
                                    alt="Lex Pro Dashboard"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604] via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-orange-500/20">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-white text-sm font-medium">AI Analysis Complete — 3 risks flagged</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating badge */}
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold shadow-[0_0_30px_rgba(249,115,22,0.5)] z-10"
                            >
                                ✨ AI-Powered
                            </motion.div>

                            {/* Risk badge */}
                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl bg-[#111] border border-orange-500/20 shadow-xl z-10"
                            >
                                <div className="text-xs text-gray-500 mb-1">Contract Risk Score</div>
                                <div className="text-xl font-black text-orange-400">8.4 / 10 ✓</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right — content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-orange-400 text-sm font-medium">⚖️ New from EyE PunE</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                            Meet{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Lex Pro</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-3 leading-relaxed">
                            India's #1 AI Contract Management platform — built specifically for Indian law.
                        </p>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Draft, review, risk-score, and e-sign contracts in minutes. Trusted by 500+ law firms and businesses across India.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 sm:mb-10">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-orange-500/20 transition-all"
                                >
                                    <f.icon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-300 text-sm">{f.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="https://lex-pro.base44.app" target="_blank" rel="noopener noreferrer">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all">
                                        Start Free 7-Day Trial
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </motion.div>
                            </a>
                        </div>
                        <p className="text-gray-600 text-xs mt-3">No credit card · 7-day free trial · Trusted by 500+ firms</p>
                    </motion.div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </section>
    );
}