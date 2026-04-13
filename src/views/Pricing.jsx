import React, { useState } from 'react';
import SEOHead from "@/components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap, Globe, Share2, Code, TrendingUp, Palette, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const SERVICE_CATEGORIES = [
    { key: 'social_media', label: 'Social Media Management', icon: Share2, plans: ['Social Media Starter', 'Social Media Growth', 'Social Media Authority'] },
    { key: 'paid_ads', label: 'Paid Advertising', icon: TrendingUp, plans: ['Meta Ads Management', 'Google Ads Management'] },
    { key: 'website', label: 'Website Development', icon: Code, plans: ['Starter Website', 'Business Website', 'Advanced Website', 'Web Platform / SaaS Development'] },
    { key: 'sales', label: 'Sales & Growth Services', icon: Zap, plans: ['Sales & Growth Setup', 'Lead Generation', 'Appointment Generation'] },
    { key: 'branding', label: 'Branding & Creative', icon: Palette, plans: ['Brand Starter', 'Brand Identity', 'Creative Content Package'] },
    { key: 'ai', label: 'AI Solutions & Automation', icon: Bot, plans: ['AI Starter', 'AI Business Automation', 'AI Custom Systems'] },
];

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

export default function Pricing() {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['pricing-plans'],
        queryFn: () => base44.entities.Pricing_Plan.filter({ is_active: true }, 'name', 100),
    });

    const getPlansByCategory = (planNames) =>
        planNames.map(name => plans.find(p => p.name === name)).filter(Boolean);

    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
        <SEOHead
            title="Pricing – Digital Marketing Services Pune | EyE PunE"
            description="Transparent pricing for social media management (from ₹30,000/mo), website development (from ₹25,000), AI automation (from ₹40,000), paid ads, branding and more. EyE PunE, Pune."
            keywords="digital marketing pricing pune, social media management cost pune, website development price pune, AI automation cost, marketing agency pricing india, EyEPunE pricing"
            canonicalUrl="https://eyepune.com/Pricing"
            structuredData={{"@context":"https://schema.org","@type":"WebPage","name":"EyE PunE Pricing","url":"https://eyepune.com/Pricing"}}
        />

            {/* HERO */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 text-sm font-medium">Transparent Pricing</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.95]">
                            Simple,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Transparent</span>
                            <br />Pricing
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Choose the services that fit your business. All plans include dedicated support and a satisfaction guarantee.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CATEGORIES */}
            {isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-14 h-14 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6 pb-24 space-y-24">
                    {SERVICE_CATEGORIES.map((cat, ci) => {
                        const catPlans = getPlansByCategory(cat.plans);
                        if (!catPlans.length) return null;
                        const Icon = cat.icon;
                        return (
                            <motion.section key={cat.key}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: ci * 0.05 }}
                            >
                                {/* Category header */}
                                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/[0.06]">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">{cat.label}</h2>
                                    </div>
                                </div>

                                {/* Plans grid */}
                                <div className={`grid gap-5 ${catPlans.length === 1 ? 'sm:grid-cols-1 max-w-md' : catPlans.length === 2 ? 'sm:grid-cols-2 max-w-3xl' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                                    {catPlans.map((plan, i) => (
                                        <motion.div key={plan.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.08 }}
                                            className={`relative rounded-2xl overflow-hidden transition-all duration-500 group flex flex-col ${
                                                plan.is_popular
                                                    ? 'bg-gradient-to-br from-red-950/60 to-orange-950/30 border-2 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.15)]'
                                                    : 'bg-white/[0.025] border border-white/[0.08] hover:border-red-500/25'
                                            }`}
                                        >
                                            {plan.is_popular && (
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-orange-400" />
                                            )}
                                            <div className="p-7 flex flex-col flex-1">
                                                {plan.is_popular && (
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 flex items-center gap-1.5">
                                                            <Sparkles className="w-3 h-3" /> Most Popular
                                                        </div>
                                                    </div>
                                                )}
                                                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                                                <p className="text-gray-500 text-sm mb-5">{plan.description}</p>
                                                <div className="flex items-baseline gap-1 mb-6">
                                                    <span className="text-4xl font-black text-white">{formatPrice(plan.price)}</span>
                                                    {plan.billing_cycle !== 'one_time' && (
                                                        <span className="text-gray-500 text-sm">/{plan.billing_cycle === 'yearly' ? 'yr' : plan.billing_cycle === 'quarterly' ? 'qtr' : 'mo'}</span>
                                                    )}
                                                    {plan.billing_cycle === 'one_time' && (
                                                        <span className="text-gray-500 text-sm"> one-time</span>
                                                    )}
                                                </div>
                                                <ul className="space-y-2.5 mb-7 flex-1">
                                                    {plan.features?.map((f, fi) => (
                                                        <li key={fi} className="flex items-start gap-2.5">
                                                            <div className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Check className="w-2.5 h-2.5 text-red-400" />
                                                            </div>
                                                            <span className="text-gray-400 text-sm">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button onClick={() => setSelectedPlan(plan)}
                                                    className={`w-full py-5 rounded-xl font-bold mt-auto ${
                                                        plan.is_popular
                                                            ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                                            : 'bg-white/[0.07] hover:bg-white/[0.12] text-white border border-white/[0.08]'
                                                    } transition-all`}
                                                >
                                                    Get Started <ArrowRight className="w-4 h-4 ml-1 inline" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        );
                    })}
                </div>
            )}

            {/* CUSTOM SOLUTION */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                            <Sparkles className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Enterprise & Custom</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                            Need a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Custom Solution?</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            For enterprises with unique requirements — we'll build a bespoke growth solution tailored to you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={createPageUrl("Contact")}>
                                <Button className="bg-white text-red-600 hover:bg-red-50 px-10 py-6 text-lg rounded-full font-black shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                                    Contact Sales <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to={createPageUrl("Booking")}>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 text-lg rounded-full">
                                    Book a Call
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {selectedPlan && (
                <CheckoutModal
                    pkg={{ id: selectedPlan.id, name: selectedPlan.name, price: selectedPlan.price, features: selectedPlan.features, category: 'pricing_plan' }}
                    isOpen={!!selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </div>
    );
}