import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

export default function ServiceLanding({ config }) {
    const { title, subtitle, hero, seo, features, process, faqs, Icon } = config;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
    };

    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            <SEOHead
                title={seo.title}
                description={seo.description}
                keywords={seo.keywords}
                canonicalUrl={seo.canonical}
                structuredData={faqSchema}
            />

            {/* ── HERO ── */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                
                <HeroFloatingIcons opacity={0.2} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                {Icon && <Icon className="w-4 h-4 text-red-400" />}
                                <span className="text-red-400 text-sm font-medium">{subtitle}</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]"
                                dangerouslySetInnerHTML={{ __html: title }}
                            />
                            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">{hero.description}</p>
                            <div className="flex flex-wrap gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-6 rounded-full font-bold text-base shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                                        Book Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Pricing")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-6 rounded-full text-base">
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <section className="border-y border-white/[0.06] py-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {hero.stats.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-red-400 mb-1">{s.val}</div>
                                <div className="text-gray-500 text-sm">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">What's Included</span>
                        <h2 className="text-4xl md:text-5xl font-black">Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Dominate</span></h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                className="group p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-500"
                            >
                                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PROCESS ── */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Our Process</span>
                        <h2 className="text-4xl md:text-5xl font-black">How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Works</span></h2>
                    </motion.div>
                    <div className="space-y-6">
                        {process.map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="flex gap-6 items-start p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/20 transition-all"
                            >
                                <span className="text-5xl font-black text-red-500/15 flex-shrink-0 leading-none">{String(i + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">FAQ</span>
                        <h2 className="text-4xl font-black">Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Questions</span></h2>
                    </motion.div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06]"
                            >
                                <h3 className="font-bold text-white mb-3 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    {faq.q}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed pl-8">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl sm:text-5xl font-black mb-5">
                            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Get Started?</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10">Get a free consultation and custom proposal today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={createPageUrl("Booking")}>
                                <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 text-lg rounded-full font-bold shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                    Book Free Consultation
                                </Button>
                            </Link>
                            <Link href={createPageUrl("AI_Assessment")}>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 text-lg rounded-full">
                                    Free AI Assessment <ChevronRight className="w-5 h-5 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}