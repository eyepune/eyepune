import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Cpu, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

export default function Solution_Founders() {
    const faqs = [
        {
            question: "How can EyE PunE help a solo founder scale?",
            answer: "We deploy 'Sales Snipers'—automated AI systems that handle lead research, outreach, and qualifying, allowing founders to focus solely on high-value closing calls."
        },
        {
            question: "Does the AI replace my personal brand?",
            answer: "No. Our systems are designed to amplify your voice. We train custom LLMs on your unique writing style and values to ensure every automated interaction feels authentic."
        },
        {
            question: "What is the ROI for AI automation?",
            answer: "Most founders see a 40-60% reduction in operational hours within the first 30 days, coupled with a 3x increase in qualified lead volume."
        }
    ];

    return (
        <div className="bg-transparent min-h-screen text-white pt-24">
            <SEOHead
                title="AI Growth Systems for Founders & CEOs | EyE PunE"
                description="Engineered for high-stakes growth. EyE PunE provides founders with Multi-Model AI automated sales engines (OpenAI, Claude, Gemini), personal brand amplification, and elite productivity systems."
                keywords="AI for founders, multi-model AI automation, founder sales automation, CEO productivity systems, personal branding AI, global growth for entrepreneurs"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Founders", path: "/Solution-Founders" }
                    ]),
                    generateFAQSchema(faqs)
                ]}
            />

            {/* Hero Section */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
                
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Target className="w-3 h-3" />
                        Built for Visionaries
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                        Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Output,</span><br /> 
                        Not Your Hours.
                    </h1>
                    
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        You're a founder, not a data entry clerk. EyE PunE builds the technical infrastructure that automates your growth so you can stay in your zone of genius.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-10 py-7 font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                Claim Founder AI Audit →
                            </Button>
                        </Link>
                        <Link href={createPageUrl("Booking")}>
                            <Button variant="outline" className="border-white/10 text-white rounded-full px-10 py-7 font-bold text-lg hover:bg-white/5">
                                Book Vision Sync
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Sales Sniper Engine",
                                desc: "Automated LinkedIn and Email systems that find, pitch, and qualify your ideal clients 24/7."
                            },
                            {
                                icon: Cpu,
                                title: "Brand Clone LLM",
                                desc: "We train a custom AI model on your past content to ghostwrite posts that sound exactly like you."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Ops Optimization",
                                desc: "Internal AI tools that manage your CRM, scheduling, and follow-ups without a VA."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/[0.015] backdrop-blur-md border border-white/5 hover:border-red-500/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">Why Elite Founders Choose EyE PunE</h2>
                    <div className="prose prose-invert max-w-none space-y-8 text-gray-400">
                        <p>
                            In the competitive global market, the bottleneck is almost always the founder's time. Most agencies give you "more work" to do. EyE PunE gives you your time back.
                        </p>
                        <p>
                            We specialize in <strong>Semantic Sales Automation</strong>. This means our AI doesn't just send spam; it understands the sentiment and intent of the prospect, engaging in natural conversations that build trust before you ever hop on a call.
                        </p>
                        <p>
                            Whether you are raising your next round or aiming for $1M ARR solo, our systems are built to scale with your ambition.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 bg-transparent">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Founder Intelligence FAQ</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.015] backdrop-blur-md border border-white/5">
                                <h4 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-red-500" />
                                    {faq.question}
                                </h4>
                                <p className="text-gray-500">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-red-600 to-orange-600 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
                    <h2 className="text-4xl font-black text-white mb-6">Ready to Engineer Your Growth?</h2>
                    <p className="text-white/80 mb-10 text-lg">
                        Get your custom 90-day AI Growth Roadmap today. No fluff, just results.
                    </p>
                    <Link href={createPageUrl("AI_Assessment")}>
                        <Button className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-12 py-8 font-black text-xl">
                            Start Free Assessment
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
