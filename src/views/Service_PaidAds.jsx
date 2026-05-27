import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target, BarChart3, DollarSign, Search, Megaphone, Zap } from 'lucide-react';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import SEOHead from '@/components/seo/SEOHead';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

const faqs = [
    { question: "What is the minimum budget for Google Ads in Pune?", answer: "We recommend a minimum ad spend of ₹15,000/month for Google Ads to see meaningful results. Our management fee starts at ₹8,000/month. Total minimum investment: ₹23,000/month." },
    { question: "Which paid advertising platforms do you manage?", answer: "We manage Google Ads (Search, Display, Shopping, YouTube), Meta Ads (Facebook & Instagram), LinkedIn Ads, and Google Performance Max campaigns." },
    { question: "What ROI can I expect from paid advertising?", answer: "Most of our clients achieve 3-5x ROAS (Return on Ad Spend) within 3 months. Results depend on your industry, competition, and offer. We share monthly performance reports." },
    { question: "How do you measure the success of paid ads?", answer: "We track ROAS, CPL (Cost Per Lead), CPA (Cost Per Acquisition), CTR, Quality Score, and conversion rate. You get access to a live dashboard with real-time data." },
    { question: "Do you handle ad creatives as well?", answer: "Yes! Our team handles ad copywriting, image creatives, video ads, and landing page optimization — everything needed for a high-converting campaign." }
];

const features = [
    { icon: Search, title: "Google Search Ads", desc: "Capture high-intent buyers actively searching for your products and services." },
    { icon: Megaphone, title: "Meta Ads", desc: "Facebook & Instagram ads with precise audience targeting and retargeting." },
    { icon: Target, title: "Performance Max", desc: "AI-powered Google campaigns that optimize across all channels automatically." },
    { icon: TrendingUp, title: "Landing Page Optimization", desc: "Conversion-optimized landing pages that maximize your ad spend ROI." },
    { icon: BarChart3, title: "Analytics & Reporting", desc: "Weekly reports with ROAS, CPL, conversions, and optimization recommendations." },
    { icon: DollarSign, title: "Budget Optimization", desc: "Smart bidding strategies to squeeze maximum ROI from every rupee spent." },
];
const programmaticSeoQueries = [
    "B2B paid ads agency India",
    "Best Google Ads agency for startups",
    "Meta Ads management services global",
    "B2B SaaS performance marketing agency",
    "Account-based marketing (ABM) paid advertising Pune",
    "Top paid advertising company for lead generation",
    "Performance-based marketing agency India"
];

const results = [
    { val: '4.2x', label: 'Average ROAS' },
    { val: '₹180', label: 'Avg. Cost Per Lead' },
    { val: '60%', label: 'Avg. CTR Improvement' },
    { val: '100+', label: 'Campaigns Managed' },
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
                { "@type": "ListItem", "position": 3, "name": "Paid Advertising Management", "item": "https://eyepune.com/Service-PaidAds" }
            ]
        },
        {
            "@type": "Service",
            "name": "Paid Advertising Management",
            "description": "Stop burning money on ads. Our global PPC experts manage Google Search, Meta Ads, and Performance Max campaigns that deliver measurable leads and 4.2x average ROAS.",
            "provider": { "@type": "Organization", "name": "EyE PunE", "url": "https://eyepune.com" },
            "areaServed": "Global"
        }
    ]
};

export default function Service_PaidAds() {
    return (
        <>
            <SEOHead
                title="Google & Meta Ads Management – Achieve 4x ROI | EyE PunE"
                description="Stop burning money on ads. Our global PPC experts manage Google Search, Meta Ads, and Performance Max campaigns that deliver measurable leads and 4.2x average ROAS. Get a free ads audit."
                keywords="google ads agency pune, meta ads management pune, facebook ads company pune, PPC experts pune, best ad agency for ROI pune"
                canonicalUrl="https://eyepune.com/Service-PaidAds"
                structuredData={faqSchema}
            />

            <div className="min-h-screen bg-transparent text-white overflow-x-hidden pt-20">
            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-full max-w-full max-w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                <Target className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Google Ads & Meta Ads · Global</span>
                            </div>
                            <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.95]">
                                Paid Ads Management<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                                Stop burning money on ads that don't convert. Our PPC experts build campaigns that deliver measurable ROI on Google, Facebook, and Instagram.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Free Ads Audit <ArrowRight className="w-4 h-4 ml-2" />
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

            {/* Features */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Our Services</span>
                        <h2 className="text-3xl md:text-5xl font-black">Full-Funnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Paid Advertising</span></h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
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
                      The 2026 <span className="text-red-500">Paid Advertising</span> Growth Blueprint
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                      Steal the exact framework we use to generate highly-qualified leads and scale revenues for 100+ global clients. Enter your email to get instant access.
                    </p>
                    <LeadMagnetForm keyword="Paid Advertising" />
                  </div>
                  
                  <div className="md:w-2/5 flex justify-center">
                    <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                      <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                        <Zap className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Labs</div>
                        <div className="font-black text-white text-lg leading-tight">Advertising Framework</div>
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
                        <h2 className="text-4xl font-black">Paid Advertising FAQs</h2>
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
                Ready to Get <span className="text-red-500 block sm:inline mt-1 sm:mt-0">4x ROI on Ads?</span>
              </h2>
              <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10 px-4 leading-relaxed">
                Get a free audit of your existing ad campaigns — we'll show you exactly where you're losing money.
              </p>
              <div className="flex justify-center w-full relative z-10 mt-8">
                <Link href={createPageUrl("Booking")} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-auto min-h-[56px] py-3 px-4 sm:px-8 text-base sm:text-lg rounded-[28px] w-full sm:w-auto shadow-2xl hover:scale-105 transition-all whitespace-normal text-center leading-tight">
                    Get Free Ads Audit
                  </Button>
                </Link>
              </div>
            </div>
        </div>
        </>
    );
}
