import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Sparkles, Zap, Share2, Play, Users, MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

export default function Solution_YouTubers() {
    const faqs = [
        {
            question: "How does AI help in content distribution?",
            answer: "We use AI to automatically slice your long-form videos into high-intent shorts/reels, write viral-optimized captions, and schedule them across 5+ platforms to maximize reach."
        },
        {
            question: "Can AI help me grow my subscriber base faster?",
            answer: "Yes. Our systems analyze real-time audience data to suggest trending topics and optimize your thumbnails and titles for maximum CTR based on current algorithm shifts."
        },
        {
            question: "What is the 'YouTuber Content Engine'?",
            answer: "It's an all-in-one automation stack that handles everything from research and scripting to post-production and cross-platform distribution."
        }
    ];

    return (
        <div className="bg-transparent min-h-screen text-white pt-24">
            <SEOHead
                title="YouTube Growth & Content Automation Systems | EyE PunE"
                description="Maximize your reach and minimize your workload. EyE PunE provides YouTubers and Creators with Multi-Model AI content engines (OpenAI, Anthropic, Meta), viral distribution, and growth systems."
                keywords="YouTube automation, multi-model content engine, AI video distribution, viral growth systems, YouTuber marketing agency"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "YouTubers", path: "/Solution-YouTubers" }
                    ]),
                    generateFAQSchema(faqs)
                ]}
            />

            {/* Hero Section */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.08)_0%,transparent_60%)]" />
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Youtube className="w-3 h-3" />
                        For the New Media Elite
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
                        Go <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Viral</span><br /> 
                        On Autopilot.
                    </h1>
                    
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Stop spending hours in the editor. EyE PunE builds the automation engines that turn your ideas into a cross-platform empire while you focus on the camera.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-4 md:px-10 md:py-7 font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                Audit My Channel AI →
                            </Button>
                        </Link>
                        <Link href={createPageUrl("Pricing")}>
                            <Button variant="outline" className="border-white/10 text-white rounded-full px-6 py-4 md:px-10 md:py-7 font-bold text-lg hover:bg-white/5">
                                View Packages
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Creator Tools Grid */}
            <section className="py-24 px-6 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: "Viral Slicer AI",
                                desc: "Automatically converts 1 video into 10+ high-engagement shorts, reels, and TikToks with burned-in captions."
                            },
                            {
                                icon: Share2,
                                title: "Omni-Channel Sync",
                                desc: "Post once, distribute everywhere. Our system handles cross-platform optimization and scheduling."
                            },
                            {
                                icon: Play,
                                title: "CTR Optimizer",
                                desc: "AI-driven thumbnail and title testing that predicts which variation will get the most clicks."
                            }
                        ].map((tool, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/[0.015] backdrop-blur-md border border-white/5 hover:bg-white/[0.03] transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{tool.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{tool.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why for Creators Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Built for the Algorithm</h2>
                        <p className="text-gray-400 text-lg">
                            The YouTube algorithm favors consistency and high-intent engagement. Our systems ensure you never miss a upload and every post is optimized for retention.
                        </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xl flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-500" /> Community Automation
                            </h4>
                            <p className="text-gray-500">Automatically reply to comments, manage your Discord/Telegram groups, and turn fans into superfans with AI engagement.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xl flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500" /> Rapid Content R&D
                            </h4>
                            <p className="text-gray-500">Use our proprietary AI models to research trending niche topics before they go mainstream, giving you the first-mover advantage.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Creator FAQ */}
            <section className="py-24 px-6 bg-transparent">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Creator Intelligence FAQ</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group p-6 rounded-2xl bg-white/[0.015] backdrop-blur-md border border-white/5 cursor-pointer">
                                <summary className="text-lg font-bold text-white flex items-center justify-between list-none">
                                    <span className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-red-500" />
                                        {faq.question}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-600 transition-transform group-open:rotate-90" />
                                </summary>
                                <p className="mt-4 text-gray-500 leading-relaxed pl-8">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto p-1 text-center bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 rounded-[3rem]">
                    <div className="bg-transparent rounded-[2.9rem] p-12 sm:p-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-8">Build Your Content Empire.</h2>
                        <p className="text-gray-400 text-lg mb-12">
                            Join 50+ creators who have automated their distribution and scaled their reach by 500%.
                        </p>
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 py-5 md:px-12 md:py-8 font-black text-xl shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                                Audit My Creator Stack →
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
