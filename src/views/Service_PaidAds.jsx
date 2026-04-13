import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target, BarChart3, DollarSign, Search, Megaphone } from 'lucide-react';
import SEOHead from "@/components/seo/SEOHead";

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
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services_Detail" },
                { "@type": "ListItem", "position": 3, "name": "Google & Meta Ads Pune", "item": "https://eyepune.com/Service_PaidAds" }
            ]
        },
        {
            "@type": "Service",
            "name": "Google Ads & Meta Ads Management Pune",
            "description": "Expert Google Ads and Meta Ads management in Pune delivering 4x+ ROAS. PPC campaigns on Google, Facebook & Instagram.",
            "provider": { "@type": "LocalBusiness", "name": "EyE PunE", "url": "https://eyepune.com", "telephone": "+91-9284712033", "address": { "@type": "PostalAddress", "addressLocality": "Pune", "addressRegion": "Maharashtra", "addressCountry": "IN" } },
            "areaServed": { "@type": "City", "name": "Pune" },
            "offers": { "@type": "Offer", "price": "8000", "priceCurrency": "INR", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "8000", "priceCurrency": "INR", "unitText": "MONTH" } }
        }
    ]
};

export default function Service_PaidAds() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            <SEOHead
                title="Google Ads & Meta Ads Management Pune | PPC Agency – EyE PunE"
                description="Expert Google Ads and Meta Ads management in Pune. EyE PunE delivers 4x+ ROAS with data-driven PPC campaigns on Google, Facebook & Instagram. Management from ₹8,000/month."
                keywords="Google Ads pune, Meta Ads pune, Facebook Ads pune, Instagram Ads pune, PPC agency pune, paid advertising pune, Google Ads management pune"
                canonicalUrl="https://eyepune.com/Service_PaidAds"
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
                                <Target className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Google Ads & Meta Ads · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                Paid Ads Management<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Pune</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                Stop burning money on ads that don't convert. Our PPC experts build campaigns that deliver measurable ROI on Google, Facebook, and Instagram.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Free Ads Audit <ArrowRight className="w-4 h-4 ml-2" />
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

            {/* Features */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-black">Full-Funnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Paid Advertising</span></h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
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

            {/* CTA */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">4x ROI on Ads?</span></h2>
                    <p className="text-gray-400 mb-8">Get a free audit of your existing ad campaigns — we'll show you exactly where you're losing money.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl("Booking")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Get Free Ads Audit
                            </Button>
                        </Link>
                        <a href="https://wa.me/919284712033?text=Hi,%20I%20need%20help%20with%20Google%20and%20Meta%20Ads" target="_blank" rel="noopener noreferrer">
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