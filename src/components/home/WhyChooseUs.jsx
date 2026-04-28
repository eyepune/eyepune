import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Target, HeartHandshake } from 'lucide-react';

const pillars = [
    {
        icon: Target,
        title: "Results, Not Hours",
        desc: "We're measured by your growth. Every strategy is tied to measurable outcomes that directly impact your bottom line.",
        num: "01",
    },
    {
        icon: Cpu,
        title: "AI-Augmented Expertise",
        desc: "Cutting-edge AI tools combined with human expertise — giving you a genuine unfair advantage over competitors.",
        num: "02",
    },
    {
        icon: Shield,
        title: "All-in-One Roof",
        desc: "Sales, marketing, tech, branding and AI under one roof. Stop juggling agencies. Start seeing compounding results.",
        num: "03",
    },
    {
        icon: HeartHandshake,
        title: "Long-Term Partner",
        desc: "Not a vendor. A partner. We invest deeply in understanding your business and grow alongside you for years.",
        num: "04",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-32 relative overflow-hidden bg-transparent">
            {/* Diagonal accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

            {/* Glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 70%)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left — text */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Why EyE PunE</span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            We're Not an{' '}
                            <span className="relative">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Agency.</span>
                                <motion.span
                                    className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-red-500 to-orange-400"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                />
                            </span>
                            <br />We're Your Growth Team.
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            Most agencies execute tasks. We build <strong className="text-white">systems that compound</strong>. 
                            When you win, we win — so we treat your business like our own.
                        </p>

                        {/* Big stat */}
                        <div className="flex gap-8">
                            {[{ val: '100+', label: 'Clients Scaled' }, { val: '₹15L+', label: 'Revenue Driven' }, { val: '5x', label: 'Avg. ROI' }].map((s, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                >
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-400 mb-1">{s.val}</div>
                                    <div className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right — pillar cards */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="group p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.04] transition-all duration-500"
                            >
                                <span className="text-5xl font-black text-red-500/10 group-hover:text-red-500/20 block mb-3 transition-colors">{p.num}</span>
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <p.icon className="w-5 h-5 text-red-400" />
                                </div>
                                <h4 className="font-bold text-white mb-2 text-base">{p.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed group-hover:text-gray-400 transition-colors">{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </section>
    );
}