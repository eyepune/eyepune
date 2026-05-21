import React from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Target, Zap, BarChart3, Mail, Linkedin, 
    ChevronRight, CheckCircle2, Globe, ShieldCheck,
    ArrowRight, MessageSquare, Sparkles, Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateServiceSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";

const FEATURES = [
    {
        title: "Hyper-Targeted Sourcing",
        description: "We don't just 'search.' We use AI to identify prospects with high intent based on recent hiring, funding, or technology shifts.",
        icon: Target,
        color: "from-blue-600 to-cyan-500"
    },
    {
        title: "AI LinkedIn Persona",
        description: "Automated profile optimization and connection strategies that build trust before you even send a message.",
        icon: Linkedin,
        color: "from-blue-500 to-blue-700"
    },
    {
        title: "Multi-Channel Sequences",
        description: "Orchestrated LinkedIn, Email, and Twitter outreach that hits the prospect where they are most active.",
        icon: Mail,
        color: "from-orange-600 to-red-500"
    },
    {
        title: "Automated Qualification",
        description: "Our bots handle the 'tire-kickers.' Only high-intent, qualified leads ever reach your calendar.",
        icon: Filter,
        color: "from-purple-600 to-pink-500"
    }
];

const STEPS = [
    {
        step: "01",
        name: "ICP Deep Dive",
        text: "We map your Ideal Customer Profile using data from 10+ sources to find your highest-value prospects."
    },
    {
        step: "02",
        name: "Content Engine",
        text: "We write personality-driven, AI-optimized scripts that avoid the 'spam' folder and get responses."
    },
    {
        step: "03",
        name: "Scale & Optimize",
        text: "We launch across multiple channels, A/B testing every word to find the winning pitch for your business."
    }
];

export default function Solution_B2BGrowth() {
    return (
        <div className="bg-[#040404] text-white overflow-hidden">
            <SEOHead 
                title="B2B Automated Growth Engine | LinkedIn & Email Outreach by EyE PunE"
                description="The ultimate 24/7 client acquisition system. We build automated LinkedIn and Email engines that find, pitch, and qualify your ideal B2B clients globally."
                keywords="B2B growth engine, automated lead generation, LinkedIn outreach automation, cold email AI, sales qualification bot, EyE PunE growth"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "B2B Growth Engine", path: "/Solution-B2BGrowth" }
                    ]),
                    generateServiceSchema(
                        "B2B Automated Growth Engine",
                        "End-to-end automated client acquisition systems using AI-powered LinkedIn and Email outreach.",
                        "95000"
                    )
                ]}
            />

            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
                    >
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold tracking-widest uppercase text-blue-400">24/7 Client Acquisition</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black mb-8 leading-[0.9]"
                    >
                        Automated <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600">
                            Growth Engine
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Stop chasing leads. Build a system that finds, pitches, and qualifies your ideal clients while you sleep. Engineered for Founders and B2B Agencies.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href={createPageUrl("Booking")}>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-10 h-16 text-lg font-bold shadow-xl shadow-blue-600/20">
                                Launch Your Engine <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-10 h-16 text-lg font-bold">
                                See How It Works
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 2. Visual Hook - The "System" */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full" />
                    
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black mb-6">The End of <br /><span className="line-through text-gray-600">Cold Calling</span></h2>
                            <p className="text-gray-400 mb-8 text-lg">
                                Traditional outreach is dead. Buyers are smarter. Our system uses behavioral triggers and multi-model AI to start conversations that feel 100% human but scale to 1000s.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "LinkedIn Connection & Follow-up Bot",
                                    "AI Cold Email Scribe (Gmail/Outlook)",
                                    "Daily Lead Dashboard & CRM Sync",
                                    "Automated Meeting Booking (Calendly)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">growth_engine_v2.log</div>
                                </div>
                                <div className="space-y-4 font-mono text-[12px]">
                                    <div className="text-blue-400">[09:41] Scraping LinkedIn for "CEO" + "SaaS" in USA...</div>
                                    <div className="text-green-400">[09:42] Found 142 qualified leads. Syncing to CRM...</div>
                                    <div className="text-purple-400">[09:45] AI drafting personalized connection for Mark Z...</div>
                                    <div className="text-blue-400">[10:02] Mark Z accepted connection. Sending follow-up...</div>
                                    <div className="text-orange-400">[10:15] REPLY DETECTED: "Tell me more about your AI."</div>
                                    <div className="text-red-500 font-bold animate-pulse">[10:16] FAST-TRACKING TO SALES CALENDAR...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Features Grid */}
            <section className="py-32 px-6 bg-gradient-to-b from-transparent to-blue-900/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black mb-6">Engineered for Dominance</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Every component of our growth engine is built to maximize your conversion rate and minimize your manual work.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg shadow-black/50`}>
                                    <f.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Three Step Process */}
            <section className="py-32 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex-1 relative">
                                <span className="text-8xl font-black text-white/[0.03] absolute -top-12 -left-6">{s.step}</span>
                                <h4 className="text-2xl font-bold mb-4 relative z-10">{s.name}</h4>
                                <p className="text-gray-500 leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[3rem] p-16 shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <Sparkles className="w-12 h-12 text-white/20 absolute top-10 right-10 animate-pulse" />
                    
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to Scale Your Sales?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                        Stop wasting time on leads that don't convert. Let's build your 24/7 Growth Engine and start filling your calendar today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={createPageUrl("Booking")}>
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-12 h-16 text-lg font-bold shadow-xl">
                                Book Your Growth Audit
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-8 text-blue-200/60 text-xs font-bold uppercase tracking-[0.2em]">Zero Setup Fee for First 5 Clients this Month</p>
                </div>
            </section>
        </div>
    );
}
