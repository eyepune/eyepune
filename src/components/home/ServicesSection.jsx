import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Globe, Bot, BarChart3, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const services = [
    { icon: TrendingUp, title: "Sales Systems", tag: "01", desc: "Funnels, CRM, lead scoring & automation that convert browsers into buyers.", accent: '#ef4444' },
    { icon: Users, title: "Marketing Automation", tag: "02", desc: "Multi-channel campaigns — email, WhatsApp, social — that nurture and close.", accent: '#f97316' },
    { icon: Globe, title: "Web & App Development", tag: "03", desc: "Lightning-fast, beautiful digital experiences built to convert and impress.", accent: '#ef4444' },
    { icon: Bot, title: "AI Business Tools", tag: "04", desc: "Custom AI chatbots, automation, and predictive analytics to 10x your output.", accent: '#f97316' },
    { icon: BarChart3, title: "Analytics & Reporting", tag: "05", desc: "Real-time dashboards, ROI tracking and insights that drive smarter decisions.", accent: '#ef4444' },
    { icon: Zap, title: "Branding & Content", tag: "06", desc: "Brand identity, content strategy, and storytelling that makes you unforgettable.", accent: '#f97316' },
];

export default function ServicesSection() {
    return (
        <section className="py-32 relative bg-[#040404] overflow-hidden">
            {/* Section label watermark */}
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[180px] font-black text-white/[0.015] select-none pointer-events-none leading-none">
                SERVICES
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-3">What We Do</span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
                            Full-Stack<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Growth Engine</span>
                        </h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link to={createPageUrl("Services_Detail")}>
                            <button className="group flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-white transition-all text-sm font-medium">
                                Explore all services
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Services list — editorial layout */}
                <div className="space-y-0">
                    {services.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link to={createPageUrl("Services_Detail")}>
                                <div className="group relative flex items-start sm:items-center gap-4 sm:gap-8 py-7 sm:py-8 border-b border-white/[0.06] hover:border-red-500/20 transition-all cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-transparent opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-xl" />

                                    {/* Tag - hidden on mobile */}
                                    <span className="hidden sm:block text-red-500/30 group-hover:text-red-500/60 font-black text-xl w-12 flex-shrink-0 transition-colors">{s.tag}</span>

                                    {/* Icon */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/[0.03] border border-white/[0.06] group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-all">
                                        <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-red-400 transition-colors" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-red-50 transition-colors mb-1">{s.title}</h3>
                                        <p className="text-gray-500 group-hover:text-gray-400 transition-colors text-sm leading-relaxed">{s.desc}</p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-white/[0.06] group-hover:border-red-500/40 group-hover:bg-red-500/10 flex items-center justify-center flex-shrink-0 transition-all">
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}