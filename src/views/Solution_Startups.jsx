import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Globe, Cpu, Zap, Target, BookOpen, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

export default function Solution_Startups() {
    const faqs = [
        {
            question: "How fast can EyE PunE deploy an AI growth system?",
            answer: "We typically deploy core automation and lead-gen systems within 7-14 days, allowing your startup to start scaling immediately."
        },
        {
            question: "Is EyE PunE suitable for early-stage MVPs?",
            answer: "Absolutely. We specialize in building lean, high-conversion marketing stacks that help startups find product-market fit without bloated budgets."
        },
        {
            question: "What platforms do your AI systems integrate with?",
            answer: "Our systems integrate seamlessly with major CRMs (HubSpot, Salesforce), communications tools (WhatsApp, Slack), and marketing platforms (Meta, Google, LinkedIn)."
        }
    ];

    return (
        <div className="bg-transparent min-h-screen text-white pt-24">
            <SEOHead
                title="AI Growth & Tech Systems for Global Startups | EyE PunE"
                description="Scale your startup at the speed of Multi-Model AI. EyE PunE provides global startups with high-performance web development, automated sales engines (GPT-4, Claude 3.5), and elite growth stacks."
                keywords="startup growth agency, multi-model AI for startups, lean marketing systems, MVP development Pune, global startup scaling"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Startups", path: "/Solution-Startups" }
                    ]),
                    generateFAQSchema(faqs)
                ]}
            />

            {/* Hero Section */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(239,68,68,0.03)_0%,transparent_100%)]" />
                <HeroFloatingIcons opacity={0.5} />
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Rocket className="w-3 h-3" />
                        From MVP to Unicorn
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                        Launch <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Smarter.</span><br /> 
                        Scale Faster.
                    </h1>
                    
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Don't build just a product; build an automated growth machine. EyE PunE equips startups with the tech and AI systems needed to dominate the global market from day one.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-10 py-7 font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all">
                                Get Startup AI Roadmap →
                            </Button>
                        </Link>
                        <Link href={createPageUrl("Services")}>
                            <Button variant="outline" className="border-white/10 text-white rounded-full px-10 py-7 font-bold text-lg hover:bg-white/5">
                                Explore Services
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Success Pillars Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold leading-tight">The Tech Stack of the <br /><span className="text-orange-500">Global Startup.</span></h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Modern startups fail because they spend too much on manual operations and generic marketing. We replace bloat with high-performance AI.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "NVIDIA-powered Lead Generation Engines",
                                    "High-Performance Next.js Web Solutions",
                                    "Automated GTM (Go-to-Market) Workflows",
                                    "AI-Driven Customer Success Systems"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-orange-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-orange-600/10 blur-3xl rounded-full" />
                            <div className="relative p-1 bg-gradient-to-br from-orange-600 to-red-600 rounded-[2.5rem]">
                                <div className="bg-[#0c0c0c] rounded-[2.4rem] p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <Cpu className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">Sales Sniper AI</h4>
                                            <p className="text-xs text-gray-500">Active Deployment</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "85%" }}
                                                className="h-full bg-orange-500" 
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Leads Qualified</span>
                                            <span className="text-white font-bold">1,284 / month</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "94%" }}
                                                className="h-full bg-red-600" 
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Growth ROI</span>
                                            <span className="text-white font-bold">5.4x Average</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Startup Solutions Grid */}
            <section className="py-24 px-6 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Global GTM",
                                desc: "Strategic launch systems designed to gain traction in international markets from day one."
                            },
                            {
                                icon: Zap,
                                title: "Lean Ops AI",
                                desc: "Automate your entire backend so you can operate at 10x capacity without increasing headcount."
                            },
                            {
                                icon: Target,
                                title: "P-M Fit Engine",
                                desc: "Data-driven marketing tests that help you find and dominate your perfect audience niche."
                            }
                        ].map((solution, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/5 group transition-all"
                            >
                                <solution.icon className="w-10 h-10 text-orange-500 mb-6" />
                                <h3 className="text-xl font-bold mb-4">{solution.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{solution.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Startup FAQ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Startup Intelligence FAQ</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-[#080808] border border-white/5">
                                <h4 className="text-lg font-bold mb-3 text-white flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-orange-500" />
                                    {faq.question}
                                </h4>
                                <p className="text-gray-500 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-[#0c0c0c] border border-white/10 rounded-[3rem] p-16 sm:p-24 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to Engineer <br />Your Success?</h2>
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-orange-600 hover:bg-orange-500 text-white rounded-full px-12 py-8 font-black text-xl flex items-center gap-3 mx-auto">
                                Claim Startup Audit <ChevronRight className="w-6 h-6" />
                            </Button>
                        </Link>
                        <p className="mt-8 text-gray-500 font-medium">Limited to 5 startup audits per week.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
