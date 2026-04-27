import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Zap, Users, ArrowRight, CheckCircle2, Shield, Cpu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/seo/SEOHead";

const timeline = [
    { year: 'Nov 2022', label: 'Day One', event: 'EyE PunE was born in Pune — founded with a bold vision to make world-class digital growth accessible to every Indian business.' },
    { year: '2023', label: 'First Wins', event: 'Onboarded our first 20+ clients, built a reputation for results-driven social media, branding, and web development across Pune.' },
    { year: 'Mid 2023', label: 'Going Deeper', event: 'Launched WhatsApp automation, CRM integration, and lead nurturing systems — helping clients convert more leads with less effort.' },
    { year: '2024', label: 'AI Era', event: 'Introduced AI-powered tools including automated campaigns, smart analytics, and launched Lex Pro — India\'s AI contract management platform.' },
    { year: '2025', label: 'Scale Up', event: 'Crossed 100+ happy clients across India. Expanded our team, refined our service bundles, and deepened our commitment to measurable ROI.' },
    { year: '2026', label: 'Present', event: 'Today, EyE PunE operates as a full-stack growth engine — serving clients across India and globally, combining human strategy, AI automation, and technology to scale businesses predictably.' },
];

const values = [
    { icon: Target, title: "Our Vision", description: "To be India's most trusted all-in-one growth partner — combining human expertise with AI-powered tools that deliver real results.", num: '01' },
    { icon: Heart, title: "Our Values", description: "Transparency, results-focus, long-term partnerships, and relentless innovation. Your success is our only metric.", num: '02' },
    { icon: Zap, title: "Our Approach", description: "We don't just execute tactics. We become an extension of your team, building systems that scale predictably.", num: '03' },
    { icon: Users, title: "Our Commitment", description: "24/7 support, dedicated account managers, and a focus on measurable outcomes that impact your bottom line.", num: '04' },
];

const differentiators = [
    { icon: Shield, title: "All-in-One Solution", desc: "Stop juggling agencies. Get sales, marketing, tech, and AI under one roof." },
    { icon: Target, title: "Results-Driven", desc: "Measured by your growth, not hours worked. Every rupee drives measurable ROI." },
    { icon: Cpu, title: "AI-Powered", desc: "Cutting-edge AI tools for automation, insights, and scale without the complexity." },
    { icon: Users, title: "Dedicated Support", desc: "Your own account manager who knows your business inside-out, responds within hours." },
];

function SectionTag({ children }) {
    return (
        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">{children}</span>
    );
}

export default function About() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
        <SEOHead
            title="About EyE PunE – Digital Marketing Agency in Pune | Our Story & Mission"
            description="EyE PunE is Pune's all-in-one digital growth agency founded in 2022. 100+ clients, 5x average ROI, 98% retention. Learn our story, mission and why businesses choose us."
            keywords="about eyepune, digital marketing agency pune, growth agency pune, EyEPunE team, pune marketing company, digital agency pune india"
            canonicalUrl="https://eyepune.com/About"
            structuredData={{"@context":"https://schema.org","@type":"AboutPage","name":"About EyE PunE","description":"EyE PunE is Pune's all-in-one digital growth agency, founded in 2022, serving 100+ clients across India.","url":"https://eyepune.com/About","mainEntity":{"@type":"Organization","name":"EyE PunE","foundingDate":"2022","areaServed":"India"}}}
        />

            {/* ── HERO ── */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Grid bg */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#040404] via-transparent to-[#040404] pointer-events-none" />

                {/* Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-red-400 text-sm font-medium">Our Story</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                About<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">EyE PunE</span>
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                Your long-term growth partner — not just another agency. We combine strategy, technology, and AI to build businesses that scale predictably and profitably.
                            </p>
                            <div className="flex gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-7 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                                        Work With Us <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Contact")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-7 py-5 rounded-full">
                                        Get in Touch
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Stats grid */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                { val: '100+', label: 'Clients Served', bg: 'from-red-600 to-red-500' },
                                { val: '3yr+', label: 'Of Excellence', bg: 'from-orange-600 to-red-500' },
                                { val: '5x', label: 'Average ROI', bg: 'from-red-500 to-pink-500' },
                                { val: '98%', label: 'Retention Rate', bg: 'from-orange-500 to-red-600' },
                            ].map((item, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className={`bg-gradient-to-br ${item.bg} rounded-2xl p-8 text-center`}
                                >
                                    <div className="text-4xl font-black mb-1">{item.val}</div>
                                    <div className="text-sm opacity-80">{item.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── MISSION ── */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center mb-16">
                        <SectionTag>Our Mission</SectionTag>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                            Empowering Businesses<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">to Thrive</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            To empower business owners with integrated sales, marketing, and technology solutions that drive predictable, sustainable growth. We believe every business deserves access to world-class growth systems.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                        {values.map((item, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-500"
                            >
                                <div className="flex items-start gap-5">
                                    <span className="text-5xl font-black text-red-500/10 group-hover:text-red-500/20 flex-shrink-0 transition-colors leading-none">{item.num}</span>
                                    <div>
                                        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <item.icon className="w-5 h-5 text-red-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ── */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)' }}
                />
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <SectionTag>Journey</SectionTag>
                        <h2 className="text-5xl font-black">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Story</span>
                        </h2>
                    </motion.div>
                    <div className="relative">
                        <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-red-500/0 via-red-500/30 to-red-500/0" />
                        <div className="space-y-8">
                            {timeline.map((item, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-8"
                                >
                                    <div className="w-20 text-right flex-shrink-0">
                                        <span className="text-red-400 font-black text-sm leading-tight block">{item.year}</span>
                                    </div>
                                    <div className="relative flex-shrink-0 mt-1.5">
                                        <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                                    </div>
                                    <div className="pt-0.5">
                                        <span className="text-white font-bold text-sm block mb-1">{item.label}</span>
                                        <p className="text-gray-400 leading-relaxed text-sm">{item.event}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── WHY DIFFERENT ── */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <SectionTag>Why Different</SectionTag>
                        <h2 className="text-5xl md:text-6xl font-black">
                            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">EyE PunE?</span>
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {differentiators.map((item, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-500 text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[700px] h-[400px] rounded-full opacity-[0.08]"
                        style={{ background: 'radial-gradient(ellipse, #ef4444 0%, transparent 70%)' }}
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                            Ready to Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">With Us?</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10">Let's build something remarkable together.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={createPageUrl("Booking")}>
                                <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 text-lg rounded-full font-bold shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                    Book Free Consultation <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href={createPageUrl("Contact")}>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 text-lg rounded-full">
                                    Get in Touch
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}