import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Zap, ShieldCheck, Smartphone, Code2, BarChart3 } from 'lucide-react';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

const faqs = [
    { question: "How much does website development cost in Pune?", answer: "EyE PunE's website packages start at ₹25,000 for a professional 5-page website. E-commerce sites start at ₹50,000. Custom web applications are priced based on scope." },
    { question: "How long does it take to build a website?", answer: "A standard business website takes 2-3 weeks. E-commerce sites take 4-6 weeks. Custom web applications can take 6-12 weeks depending on complexity." },
    { question: "Do you build mobile-responsive websites?", answer: "Absolutely. Every website we build is fully responsive and optimized for mobile, tablet, and desktop. Mobile performance is a top priority for SEO and user experience." },
    { question: "Will my website rank on Google?", answer: "Yes! All our websites are built with technical SEO best practices — fast loading, clean code, schema markup, and on-page optimization from day one." },
    { question: "Do you provide website maintenance after launch?", answer: "Yes, we offer monthly maintenance packages including updates, security monitoring, backups, and performance optimization. Packages start at ₹5,000/month." }
];

const features = [
    { icon: Globe, title: "Business Websites", desc: "Professional, SEO-optimized websites that convert visitors into leads." },
    { icon: Code2, title: "Custom Web Apps", desc: "Scalable web applications built with modern frameworks and clean architecture." },
    { icon: Smartphone, title: "Mobile-First Design", desc: "Pixel-perfect responsive design that works flawlessly on every device." },
    { icon: Zap, title: "Performance Optimized", desc: "Fast-loading pages with Core Web Vitals optimization for better rankings." },
    { icon: ShieldCheck, title: "Secure & Reliable", desc: "SSL certificates, security hardening, and regular backups included." },
    { icon: BarChart3, title: "Built-in Analytics", desc: "Google Analytics, Search Console setup, and conversion tracking." },
];

const results = [
    { val: '200+', label: 'Websites Delivered' },
    { val: '<2s', label: 'Avg. Page Load Time' },
    { val: '40%', label: 'Avg. Conversion Lift' },
    { val: '5★', label: 'Client Satisfaction' },
];

export default function Service_WebDev() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                
                <HeroFloatingIcons opacity={0.2} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                <Globe className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Website Development · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                Website Development<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Pune</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                High-performance websites and web applications built to rank on Google and convert your visitors into paying customers.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Get Free Quote <ArrowRight className="w-4 h-4 ml-2" />
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
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">What We Build</span>
                        <h2 className="text-4xl md:text-5xl font-black">Websites That <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Work for You 24/7</span></h2>
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

            {/* Testimonials */}
            <section className="py-24 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Social Proof</span>
                            <h2 className="text-4xl font-black mb-6 italic">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Performance</span></h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                "Our previous website was slow and didn't generate any leads. EyE PunE rebuilt it from scratch with a focus on speed and SEO. Our organic traffic increased by 150% in just two months."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400">AS</div>
                                <div>
                                    <div className="font-bold text-white text-lg italic">Anjali S.</div>
                                    <div className="text-gray-500 text-sm">Marketing Director, Global Retail</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <div className="text-3xl font-black text-red-500 mb-1">150%</div>
                                <div className="text-gray-500 text-sm">Traffic Growth</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <div className="text-3xl font-black text-red-500 mb-1">&lt;2s</div>
                                <div className="text-gray-500 text-sm">Load Time</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <div className="text-3xl font-black text-red-500 mb-1">SEO</div>
                                <div className="text-gray-500 text-sm">Rank #1 Ready</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <div className="text-3xl font-black text-red-500 mb-1">24/7</div>
                                <div className="text-gray-500 text-sm">Uptime Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">FAQs</span>
                        <h2 className="text-4xl font-black">Frequently Asked Questions</h2>
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
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Let's Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Dream Website</span></h2>
                    <p className="text-gray-400 mb-8">Get a free consultation and quote within 24 hours.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={createPageUrl("Booking")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Start Your Project
                            </Button>
                        </Link>
                        <a href="https://wa.me/919284712033?text=Hi,%20I%20need%20a%20website%20for%20my%20business" target="_blank" rel="noopener noreferrer">
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