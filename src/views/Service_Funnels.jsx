import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Workflow, Target, Users, Zap, BarChart3, CheckCircle2, ArrowDownRight } from 'lucide-react';
import SEOHead from "@/components/seo/SEOHead";

const faqs = [
    { question: "What is a sales funnel?", answer: "A sales funnel is a step-by-step process that guides potential customers from first awareness of your brand all the way to making a purchase. We design, build, and optimize every stage — ads, landing pages, email follow-ups, and closing sequences." },
    { question: "What is a system funnel?", answer: "A system funnel automates your backend operations — CRM pipelines, lead nurturing sequences, WhatsApp/email follow-ups, and task assignments — so your team focuses on closing, not chasing." },
    { question: "How long does it take to build a funnel?", answer: "A basic sales funnel takes 7–14 days. A full system funnel with CRM integration and automation workflows takes 3–4 weeks depending on complexity." },
    { question: "Which CRMs do you integrate with?", answer: "We integrate with HubSpot, Zoho, Salesforce, Pipedrive, and custom CRMs. We also set up WhatsApp automation, email sequences via Zoho Mail, and lead scoring systems." },
    { question: "What results can I expect from a funnel?", answer: "Our clients typically see a 30–60% improvement in lead-to-customer conversion rates within 90 days. Results vary by industry and traffic volume, but every funnel is built to be data-driven and continuously optimized." }
];

const salesFeatures = [
    { icon: Target, title: "Lead Magnet Strategy", desc: "High-converting offers that attract qualified leads from cold traffic." },
    { icon: ArrowDownRight, title: "Landing Page Design", desc: "Conversion-optimized pages built to turn visitors into leads and leads into buyers." },
    { icon: TrendingUp, title: "Upsell & Cross-sell Flows", desc: "Post-purchase sequences that maximize customer lifetime value." },
    { icon: BarChart3, title: "Funnel Analytics", desc: "Real-time dashboards tracking every step — from click to close." },
];

const systemFeatures = [
    { icon: Workflow, title: "CRM Pipeline Automation", desc: "Auto-assign leads, update stages, and trigger tasks based on behavior." },
    { icon: Zap, title: "WhatsApp & Email Sequences", desc: "Automated multi-touch follow-up sequences that nurture leads 24/7." },
    { icon: Users, title: "Lead Scoring", desc: "AI-driven scoring to prioritize your hottest prospects for your sales team." },
    { icon: CheckCircle2, title: "Task & Notification Systems", desc: "Automatic reminders and alerts so no lead ever falls through the cracks." },
];

const results = [
    { val: '3x', label: 'Avg. Lead Conversion Lift' },
    { val: '60%', label: 'Reduction in Manual Work' },
    { val: '24/7', label: 'Automated Follow-ups' },
    { val: '50+', label: 'Funnels Built' },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://eyepune.com" },
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services_Detail" },
                { "@type": "ListItem", "position": 3, "name": "Sales & System Funnels Pune", "item": "https://eyepune.com/Service_Funnels" }
            ]
        },
        {
            "@type": "Service",
            "name": "Sales & System Funnels Pune",
            "description": "End-to-end sales funnel design and system funnel automation in Pune. CRM integration, lead nurturing, WhatsApp automation, and conversion-optimized landing pages.",
            "provider": { "@type": "LocalBusiness", "name": "EyE PunE", "url": "https://eyepune.com", "telephone": "+91-9284712033", "address": { "@type": "PostalAddress", "addressLocality": "Pune", "addressRegion": "Maharashtra", "addressCountry": "IN" } },
            "areaServed": { "@type": "City", "name": "Pune" }
        }
    ]
};

export default function Service_Funnels() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            <SEOHead
                title="Sales Funnels & System Funnels Pune | CRM Automation – EyE PunE"
                description="Build high-converting sales funnels and automated system funnels in Pune. EyE PunE designs end-to-end conversion pipelines, CRM automation, lead nurturing & WhatsApp sequences."
                keywords="sales funnel pune, system funnel pune, CRM automation pune, lead nurturing pune, WhatsApp automation pune, marketing funnel pune"
                canonicalUrl="https://eyepune.com/Service_Funnels"
                structuredData={faqSchema}
            />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                <Workflow className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Sales & System Funnels · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                Sales & System<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Funnels</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                Turn strangers into customers — automatically. We design high-converting sales funnels and build system funnels that automate your entire lead-to-revenue pipeline.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Build My Funnel <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link to={createPageUrl("Pricing")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-5 rounded-full text-base">
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="py-14 border-y border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {results.map((r, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-1">{r.val}</div>
                            <div className="text-gray-500 text-sm">{r.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sales Funnel Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Sales Funnels</span>
                        <h2 className="text-4xl md:text-5xl font-black">From Click to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Customer</span></h2>
                        <p className="text-gray-400 mt-4 max-w-xl">We architect every touchpoint — ads, pages, emails, and offers — into a seamless journey that converts.</p>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {salesFeatures.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="group p-7 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all"
                            >
                                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* System Funnel Section */}
            <section className="py-24 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">System Funnels</span>
                        <h2 className="text-4xl md:text-5xl font-black">Automate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Revenue Engine</span></h2>
                        <p className="text-gray-400 mt-4 max-w-xl">Backend systems that qualify, nurture, and convert leads while your team sleeps.</p>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {systemFeatures.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="group p-7 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all"
                            >
                                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-5 h-5 text-orange-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">FAQs</span>
                        <h2 className="text-4xl font-black">Funnel FAQs</h2>
                    </motion.div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="rounded-2xl bg-white/[0.025] border border-white/[0.06] p-6"
                            >
                                <h3 className="text-white font-bold mb-2">{faq.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Funnel?</span></h2>
                    <p className="text-gray-400 mb-8">Let's map out your entire sales and system funnel in a free 30-minute strategy call.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl("Booking")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Book Free Strategy Call
                            </Button>
                        </Link>
                        <a href="https://wa.me/919284712033?text=Hi,%20I%20want%20to%20build%20a%20sales%20and%20system%20funnel%20for%20my%20business" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 rounded-full text-lg">
                                WhatsApp Us
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}