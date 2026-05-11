import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Settings, BarChart3, MessageSquare, RefreshCw } from 'lucide-react';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

const faqs = [
    { question: "What is AI automation for business?", answer: "AI automation uses artificial intelligence to handle repetitive tasks like lead follow-up, customer support, report generation, and data entry — saving you 20+ hours per week." },
    { question: "How much does AI automation cost in Pune?", answer: "Our AI automation packages start at ₹40,000/month. Implementation projects (CRM automation, chatbots, workflows) are priced separately based on complexity." },
    { question: "Can AI automation integrate with my existing software?", answer: "Yes! We integrate with 500+ tools including WhatsApp, Gmail, Google Sheets, Zoho CRM, HubSpot, Wix, Shopify, and more via APIs and automation platforms." },
    { question: "What tasks can be automated with AI?", answer: "Lead qualification, email follow-ups, WhatsApp broadcasting, social media scheduling, invoice generation, customer support chatbots, and sales pipeline management." },
    { question: "How long does AI automation setup take?", answer: "Basic automation workflows take 1-2 weeks. Complex multi-system integrations take 4-8 weeks. We provide full training and documentation for your team." }
];

const features = [
    { icon: Bot, title: "AI Chatbots", desc: "24/7 customer support bots for WhatsApp, website, and social media." },
    { icon: RefreshCw, title: "Workflow Automation", desc: "Automate repetitive tasks across CRM, email, and social platforms." },
    { icon: MessageSquare, title: "WhatsApp Automation", desc: "Automated follow-ups, broadcasts, and lead nurturing on WhatsApp." },
    { icon: Zap, title: "Lead Automation", desc: "Auto-qualify leads, assign to sales team, and trigger follow-up sequences." },
    { icon: Settings, title: "CRM Integration", desc: "Connect and sync your CRM with all business tools for seamless data flow." },
    { icon: BarChart3, title: "AI Reporting", desc: "Automated performance dashboards and weekly business insights." },
];

const results = [
    { val: '20h+', label: 'Weekly Hours Saved' },
    { val: '3x', label: 'Faster Lead Response' },
    { val: '60%', label: 'Cost Reduction' },
    { val: '500+', label: 'Tools Integrated' },
];

export default function Service_AI() {
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
                                <Bot className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">AI Automation · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                AI Automation<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">for Pune Businesses</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                Stop doing manual work. Automate your lead follow-ups, customer support, reports, and more — so your team can focus on closing deals.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href={createPageUrl("AI_Assessment")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Free AI Assessment <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Booking")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-5 rounded-full text-base">
                                        Book Demo
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
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">AI Solutions</span>
                        <h2 className="text-4xl md:text-5xl font-black">Automate the Work, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Scale the Results</span></h2>
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
                            <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Success Stories</span>
                            <h2 className="text-4xl font-black mb-6 italic">What our Pune partners say about <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">AI Transformation</span></h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                "EyE PunE didn't just build a chatbot; they re-wired our entire lead follow-up process. We're now responding to inquiries in seconds, not hours. Our conversion rate jumped by 40% in the first month."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400">RK</div>
                                <div>
                                    <div className="font-bold text-white text-lg italic">Rajesh K.</div>
                                    <div className="text-gray-500 text-sm">CEO, Pune Tech Solutions</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-3xl font-black text-red-500 mb-1">40%</div>
                                <div className="text-gray-500 text-sm">Higher Conversion</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-3xl font-black text-red-500 mb-1">20h</div>
                                <div className="text-gray-500 text-sm">Saved Weekly</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-3xl font-black text-red-500 mb-1">10k+</div>
                                <div className="text-gray-500 text-sm">Leads Managed</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="text-3xl font-black text-red-500 mb-1">Instant</div>
                                <div className="text-gray-500 text-sm">Lead Response</div>
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
                        <h2 className="text-4xl font-black">Common Questions about AI Automation</h2>
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
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Automate Your Business?</span></h2>
                    <p className="text-gray-400 mb-8">Take our free AI Assessment and discover which processes you should automate first.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Take Free AI Assessment
                            </Button>
                        </Link>
                        <Link href={createPageUrl("Booking")}>
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 rounded-full text-lg">
                                Book a Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}