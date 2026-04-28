'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Globe, Bot, BarChart3, Zap, ArrowRight, CheckCircle2, ChevronRight, Sparkles, Command, Code, Database, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Hash, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import TestimonialDisplay from "@/components/testimonials/TestimonialDisplay";
import SEOHead from "@/components/seo/SEOHead";
import ROICalculator from "@/components/shared/ROICalculator";

const serviceLinks = [
    '/Booking',
    '/Service_SocialMedia',
    '/Service_WebDev',
    '/Service_AI',
    '/Service_PaidAds',
    '/Service_Branding',
];

const services = [
    {
        icon: TrendingUp,
        num: '01',
        title: "Sales Systems & Funnels",
        description: "End-to-end sales infrastructure that converts leads into loyal customers with predictable revenue.",
        features: ["Sales funnel design & optimization", "CRM setup (HubSpot, Salesforce)", "Lead scoring and qualification", "Sales automation & workflows", "Performance tracking & analytics"],
    },
    {
        icon: Users,
        num: '02',
        title: "Marketing Automation",
        description: "Multi-channel campaigns that nurture leads and close deals at scale without manual effort.",
        features: ["Email campaigns & sequences", "WhatsApp Business automation", "Social media management & ads", "Content marketing strategy", "Marketing analytics & attribution"],
    },
    {
        icon: Globe,
        num: '03',
        title: "Website & App Development",
        description: "Fast, beautiful, conversion-optimized digital experiences that work 24/7 for your business.",
        features: ["Custom website design & dev", "E-commerce platforms", "Mobile app development", "Landing page optimization", "Maintenance & hosting"],
    },
    {
        icon: Bot,
        num: '04',
        title: "AI Tools for Business",
        description: "Custom AI solutions that automate, predict, and scale your business without scaling costs.",
        features: ["AI chatbots for customer service", "Lead qualification automation", "Content generation tools", "Predictive analytics", "Custom AI solutions"],
    },
    {
        icon: BarChart3,
        num: '05',
        title: "Analytics & Reporting",
        description: "Real-time data-driven insights that drive better decisions and measurable ROI.",
        features: ["Custom dashboard creation", "Sales & marketing analytics", "ROI tracking & reporting", "Conversion rate optimization", "Business intelligence setup"],
    },
    {
        icon: Zap,
        num: '06',
        title: "Branding & Content",
        description: "Bold brand identity and content strategy that makes you impossible to ignore.",
        features: ["Brand identity development", "Content strategy & creation", "Social media branding", "Video production", "Copywriting services"],
    }
];

function SectionTag({ children }) {
    return <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">{children}</span>;
}

const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Digital Marketing Services by EyE PunE",
    "description": "Full-service digital marketing and technology services in Pune, India.",
    "itemListElement": services.map((s, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
            "@type": "Service",
            "name": s.title,
            "description": s.description,
            "provider": { "@type": "Organization", "name": "EyE PunE", "url": "https://eyepune.com" }
        }
    }))
};

export default function Services_Detail() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
        <SEOHead
            title="Digital Marketing Services in Pune | Social Media, Web Dev, AI Automation – EyE PunE"
            description="EyE PunE offers complete digital marketing services in Pune: social media management, website development, AI automation, paid ads, branding and lead generation. Get a free consultation today."
            keywords="digital marketing services pune, social media management pune, website development pune, AI automation pune, Google Ads pune, Meta Ads pune, branding agency pune, lead generation pune"
            canonicalUrl="https://eyepune.com/Services_Detail"
            structuredData={servicesSchema}
        />

            {/* ── HERO ── */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#040404] via-transparent to-[#040404]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />

                {/* Floating Tech Icons */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {[
                        { Icon: Bot, x: "5%", y: "20%", delay: 0 },
                        { Icon: Zap, x: "90%", y: "15%", delay: 1 },
                        { Icon: Globe, x: "75%", y: "40%", delay: 2 },
                        { Icon: Code, x: "15%", y: "65%", delay: 3 },
                        { Icon: TrendingUp, x: "40%", y: "10%", delay: 4 },
                        { Icon: BarChart3, x: "60%", y: "20%", delay: 5 },
                        { Icon: Database, x: "30%", y: "80%", delay: 1.5 },
                        { Icon: Sparkles, x: "50%", y: "45%", delay: 2.5 },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                            className="absolute text-red-500"
                            style={{ left: item.x, top: item.y }}
                        >
                            <item.Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={0.5} />
                        </motion.div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-red-400 text-sm font-medium">Full-Service Growth Agency</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.95]">
                                Our<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Services</span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                                Everything your business needs to Connect, Engage, and Grow — all under one roof with dedicated experts who treat your business like their own.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── SERVICES LIST ── */}
            <section className="py-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="space-y-0">
                        {services.map((service, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="group py-12 border-b border-white/[0.06] hover:border-red-500/15 transition-all"
                            >
                                <div className="grid sm:grid-cols-[60px_1fr] lg:grid-cols-[80px_1fr_1fr] gap-5 sm:gap-8 items-start">
                                    {/* Number */}
                                    <span className="text-4xl sm:text-5xl font-black text-red-500/10 group-hover:text-red-500/25 transition-colors">{service.num}</span>

                                    {/* Title + desc + features on mobile */}
                                    <div className="lg:contents">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-white">{service.title}</h3>
                                            </div>
                                            <p className="text-gray-400 leading-relaxed text-sm sm:text-base mb-3">{service.description}</p>
                                            <Link href={serviceLinks[i]} className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors mb-3 lg:mb-0">
                                                Learn More <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>

                                            {/* Features shown inline on mobile */}
                                            <ul className="space-y-2 lg:hidden">
                                                {service.features.map((f, fi) => (
                                                    <li key={fi} className="flex items-center gap-2 text-gray-400 text-sm">
                                                        <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />{f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Features — desktop only */}
                                    <ul className="space-y-2.5 hidden lg:block">
                                        {service.features.map((f, fi) => (
                                            <li key={fi} className="flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4 text-red-500/60 flex-shrink-0" />
                                                <span className="text-gray-400 text-sm">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ROI CALCULATOR ── */}
            <section className="py-24 border-t border-white/[0.06] bg-[#060606]">
                <ROICalculator />
            </section>

            {/* ── LEX PRO PROMO ── */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 to-[#040404]" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)' }}
                />
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-orange-400 text-sm font-medium">⚖️ New Product Launch</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Introducing{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Lex Pro</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                            India's #1 AI Contract Management platform. Draft, review, risk-score, and e-sign contracts fully compliant with Indian law — in minutes, not days.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                            {['Indian Law Compliance', 'Risk Score Analysis', 'Full Contract Lifecycle'].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.025] border border-orange-500/10 hover:border-orange-500/30 transition-all text-sm text-gray-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                        <a href="https://lex-pro.base44.app" target="_blank" rel="noopener noreferrer">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-6 text-lg rounded-full font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                                Try Lex Pro Free <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <SectionTag>Social Proof</SectionTag>
                        <h2 className="text-5xl font-black">Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Success Stories</span></h2>
                    </motion.div>
                    <TestimonialDisplay limit={6} />
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] opacity-[0.1]" style={{ background: 'radial-gradient(ellipse, #ef4444 0%, transparent 70%)' }} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Transform?</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10">Get a custom proposal tailored to your business goals</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={createPageUrl("Booking")}>
                                <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 text-lg rounded-full font-bold shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                    Book Free Consultation
                                </Button>
                            </Link>
                            <Link href={createPageUrl("Pricing")}>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 text-lg rounded-full">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}