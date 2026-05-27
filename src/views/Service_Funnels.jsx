import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Workflow, Target, Users, Zap, BarChart3, CheckCircle2, ArrowDownRight, Search } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

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
const programmaticSeoQueries = [
    "Sales funnel optimization services India",
    "Conversion rate optimization (CRO) agency global",
    "B2B lead generation funnel builder",
    "Top landing page optimization services Pune",
    "Automated sales funnel strategy",
    "E-commerce UX and funnel optimization",
    "High-ticket client acquisition funnels"
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
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services-Detail" },
                { "@type": "ListItem", "position": 3, "name": "Sales & System Funnels Pune", "item": "https://eyepune.com/Service-Funnels" }
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
        <>
            <SEOHead
                title="Sales Funnels & System Funnels | CRM Automation – EyE PunE"
                description="Build high-converting sales funnels and automated system funnels globally. EyE PunE designs end-to-end conversion pipelines, CRM automation, lead nurturing & WhatsApp sequences."
                keywords="sales funnel pune, system funnel pune, CRM automation pune, lead nurturing pune, WhatsApp automation pune, marketing funnel pune"
                canonicalUrl="https://eyepune.com/Service-Funnels"
                structuredData={faqSchema}
            />
            <div className="min-h-screen bg-transparent text-white overflow-x-hidden pt-20">

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-full max-w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6 mx-auto">
                                <Workflow className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Sales & System Funnels · Global</span>
                            </div>
                            <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.95]">
                                Sales & System<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                                Turn strangers into customers — automatically. We design high-converting sales funnels and build system funnels that automate your entire lead-to-revenue pipeline.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Build My Funnel <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Pricing")}>
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
                                    <f.icon className="w-5 h-5 text-white" />
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
            {/* Dynamic SEO Lead Magnet */}
            <div className="max-w-4xl mx-auto mb-24 px-4 mt-16">
              <div className="rounded-3xl bg-gradient-to-r from-red-950/50 to-black border border-red-500/30 p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-3/5 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-4 uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3" /> Free PDF Download
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                      The 2026 <span className="text-red-500">Sales Funnel</span> Growth Blueprint
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                      Steal the exact framework we use to generate highly-qualified leads and scale revenues for 100+ global clients. Enter your email to get instant access.
                    </p>
                    <LeadMagnetForm keyword="Sales Funnel Strategy" />
                  </div>
                  
                  <div className="md:w-2/5 flex justify-center">
                    <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                      <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                        <Zap className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Labs</div>
                        <div className="font-black text-white text-lg leading-tight">Sales Funnel Framework</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Programmatic SEO - Geo Targeting */}
            <section className="py-20 border-t border-white/[0.06] bg-black/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Search className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-300">People Also Search For (Global & India)</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {programmaticSeoQueries.map((query, i) => (
                            <Link href={`/Solutions/${query.toLowerCase().split(' ').join('-')}`} key={i} className="max-w-full">
                                <div className="px-4 py-2 h-auto bg-white/[0.02] border border-white/[0.05] rounded-3xl text-sm text-gray-400 hover:text-red-400 hover:bg-white/[0.04] transition-all cursor-pointer flex items-start sm:items-center gap-2 max-w-full">
                                    <Search className="w-3 h-3 flex-shrink-0 mt-1 sm:mt-0" />
                                    <span className="whitespace-normal text-left">{query}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-red-950/40 to-black border border-red-900/30 relative overflow-hidden mb-24 mt-12">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 md:mb-6 relative z-10 px-2 leading-tight">
                Ready to Build Your <span className="text-red-500 block sm:inline mt-1 sm:mt-0">Funnel?</span>
              </h2>
              <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10 px-4 leading-relaxed">
                Let's map out your entire sales and system funnel in a free 30-minute strategy call.
              </p>
              <div className="flex justify-center w-full relative z-10 mt-8">
                <Link href={createPageUrl("Booking")} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-auto min-h-[56px] py-3 px-4 sm:px-8 text-base sm:text-lg rounded-[28px] w-full sm:w-auto shadow-2xl hover:scale-105 transition-all whitespace-normal text-center leading-tight">
                    Book Free Strategy Call
                  </Button>
                </Link>
              </div>
            </div>
        </div>
        </>
    );
}
