import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Layers, FileText, Star, Image, Sparkles, Search, PenTool, Briefcase, Zap, TrendingUp } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

const faqs = [
    { question: "How much does branding cost in Pune?", answer: "EyE PunE's branding packages start at ₹20,000 for a logo and brand kit. Full brand identity packages including guidelines, collaterals, and templates range from ₹50,000 to ₹1,50,000." },
    { question: "What is included in a brand identity package?", answer: "Our full brand identity includes logo design (primary + variants), color palette, typography, business cards, letterhead, social media templates, brand guidelines document, and a brand assets kit." },
    { question: "How long does brand identity design take?", answer: "Logo and basic brand kit: 1-2 weeks. Full brand identity with guidelines: 3-4 weeks. We provide 3 initial concepts with unlimited revisions until you're 100% satisfied." },
    { question: "Do you also do rebranding for existing businesses?", answer: "Yes! We specialize in rebranding for businesses looking to modernize, reposition, or expand. We handle the full transition including updating all existing materials." },
    { question: "Will I own all the branding files?", answer: "Absolutely. Upon final payment, you receive all source files (AI, EPS, PNG, PDF) with full ownership rights. We also provide a comprehensive brand usage guide for your team." }
];

const features = [
    { icon: Sparkles, title: "Logo Design", desc: "Distinctive, memorable logos that capture your brand's essence and values." },
    { icon: Palette, title: "Brand Identity", desc: "Complete visual identity including colors, typography, and design system." },
    { icon: Briefcase, title: "Brand Guidelines", desc: "Comprehensive brand books ensuring consistency across all future marketing materials." },
    { icon: PenTool, title: "Copywriting & Tone", desc: "Developing a unique brand voice that resonates with your specific target audience." },
    { icon: Zap, title: "Rebranding", desc: "Modernizing outdated brands to reconnect with current markets and drive new growth." },
];

const programmaticSeoQueries = [
    "Brand identity design agency India",
    "Startup branding agencies global",
    "Custom logo design services Pune",
    "Top brand strategy agencies",
    "SaaS and Tech branding agency",
    "Corporate B2B brand identity design",
    "Brand style guide and positioning company"
];

const results = [
    { val: '500+', label: 'Brands Created' },
    { val: '48h', label: 'First Concepts Delivered' },
    { val: '100%', label: 'Satisfaction Guaranteed' },
    { val: '3', label: 'Initial Concepts Provided' },
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
                { "@type": "ListItem", "position": 3, "name": "Branding Agency Pune", "item": "https://eyepune.com/Service-Branding" }
            ]
        },
        {
            "@type": "Service",
            "name": "Branding Agency Pune",
            "description": "Professional branding agency in Pune. Logo design, brand identity, guidelines, and marketing collaterals starting from ₹20,000.",
            "provider": { "@type": "LocalBusiness", "name": "EyE PunE", "url": "https://eyepune.com", "telephone": "+91-9284712033", "address": { "@type": "PostalAddress", "addressLocality": "Pune", "addressRegion": "Maharashtra", "addressCountry": "IN" } },
            "areaServed": { "@type": "City", "name": "Pune" },
            "offers": { "@type": "Offer", "price": "20000", "priceCurrency": "INR" }
        }
    ]
};

export default function Service_Branding() {
    return (
        <>
            <SEOHead
                title="Branding Agency | Logo Design & Brand Identity – EyE PunE"
                description="Professional branding agency. EyE PunE creates stunning logos, brand identities, and marketing collaterals that make your business stand out globally. Packages from ₹20,000."
                keywords="branding agency pune, logo design pune, brand identity pune, logo designer pune, brand strategy pune, marketing collaterals pune, rebranding pune"
                canonicalUrl="https://eyepune.com/Service-Branding"
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
                                <Palette className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Branding & Design · Global</span>
                            </div>
                            <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.95]">
                                Branding Agency<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                                Build a brand that people remember, trust, and choose over competitors. From logo to full brand identity — we create brands that drive business growth.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Start Your Brand <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Pricing")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-5 rounded-full text-base">
                                        View Packages
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
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">What We Create</span>
                        <h2 className="text-4xl md:text-5xl font-black">A Brand That <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Makes You Unforgettable</span></h2>
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
                      The 2026 <span className="text-red-500">Brand Identity</span> Growth Blueprint
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                      Steal the exact framework we use to generate highly-qualified leads and scale revenues for 100+ global clients. Enter your email to get instant access.
                    </p>
                    <LeadMagnetForm keyword="Brand Identity Design" />
                  </div>
                  
                  <div className="md:w-2/5 flex justify-center">
                    <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                      <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                        <Zap className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Labs</div>
                        <div className="font-black text-white text-lg leading-tight">Brand Identity Framework</div>
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
                        <h2 className="text-4xl font-black">Branding FAQs</h2>
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
                Let's Build a Brand <span className="text-red-500 block sm:inline mt-1 sm:mt-0 pb-1">Worth Remembering</span>
              </h2>
              <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10 px-4 leading-relaxed">
                Book a free consultation — we'll share brand strategy insights specific to your industry.
              </p>
              <div className="flex justify-center w-full relative z-10 mt-8">
                <Link href={createPageUrl("Booking")} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-auto min-h-[56px] py-3 px-4 sm:px-8 text-base sm:text-lg rounded-[28px] w-full sm:w-auto shadow-2xl hover:scale-105 transition-all whitespace-normal text-center leading-tight">
                    Start Branding Project
                  </Button>
                </Link>
              </div>
            </div>
        </div>
        </>
    );
}
