import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Layers, FileText, Star, Image, Sparkles } from 'lucide-react';
import SEOHead from "@/components/seo/SEOHead";

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
    { icon: Layers, title: "Brand Guidelines", desc: "Comprehensive brand manual for consistent application across all touchpoints." },
    { icon: Image, title: "Marketing Collaterals", desc: "Business cards, brochures, banners, presentation templates, and more." },
    { icon: FileText, title: "Social Media Kit", desc: "Custom templates for posts, Stories, covers, and profile assets." },
    { icon: Star, title: "Brand Strategy", desc: "Positioning, messaging, tone of voice, and competitive differentiation." },
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
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services_Detail" },
                { "@type": "ListItem", "position": 3, "name": "Branding Agency Pune", "item": "https://eyepune.com/Service_Branding" }
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
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            <SEOHead
                title="Branding Agency Pune | Logo Design & Brand Identity – EyE PunE"
                description="Professional branding agency in Pune. EyE PunE creates stunning logos, brand identities, and marketing collaterals that make your business stand out. Packages from ₹20,000."
                keywords="branding agency pune, logo design pune, brand identity pune, logo designer pune, brand strategy pune, marketing collaterals pune, rebranding pune"
                canonicalUrl="https://eyepune.com/Service_Branding"
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
                                <Palette className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Branding & Design · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                Branding Agency<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Pune</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                Build a brand that people remember, trust, and choose over competitors. From logo to full brand identity — we create brands that drive business growth.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Start Your Brand <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link to={createPageUrl("Pricing")}>
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

            {/* CTA */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Let's Build a Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Worth Remembering</span></h2>
                    <p className="text-gray-400 mb-8">Book a free consultation — we'll share brand strategy insights specific to your industry.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl("Booking")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Start Branding Project
                            </Button>
                        </Link>
                        <a href="https://wa.me/919284712033?text=Hi,%20I%20need%20branding%20and%20logo%20design%20for%20my%20business" target="_blank" rel="noopener noreferrer">
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