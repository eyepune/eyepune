import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Megaphone, Code2, Bot, Palette, Package } from 'lucide-react';
import PackageCard from "@/components/services/PackageCard";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import SEOHead, { generateOrganizationSchema } from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

const categories = [
    { id: 'all', label: 'All Packages', icon: Package },
    { id: 'social_media', label: 'Social Media', icon: Megaphone },
    { id: 'web_app', label: 'Web & App', icon: Code2 },
    { id: 'ai_automation', label: 'AI Automation', icon: Bot },
    { id: 'branding', label: 'Branding', icon: Palette },
];

export default function Services() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedPackage, setSelectedPackage] = useState(null);

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const { data, error } = await supabase.from('service_packages').select('*').order('created_at');
            if (error) { console.warn('[Services] fetch error:', error.message); return []; }
            return data || [];
        },
    });

    const filteredPackages = activeCategory === 'all' 
        ? packages 
        : packages.filter(pkg => pkg.category === activeCategory);

    return (
        <div className="min-h-screen bg-[#040404] text-white py-20 relative overflow-hidden">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#040404] via-transparent to-[#040404] pointer-events-none" />
            
            <HeroFloatingIcons opacity={0.15} />

            <SEOHead
                title="Service Packages – Social Media, Web & AI Automation Pune | EyE PunE"
                description="Expert digital growth packages for Pune businesses. Social media management, Next.js web development, AI business automation, and premium branding. Transparent pricing, no hidden fees."
                keywords="digital marketing packages pune, social media management price, web development packages india, AI automation services pune, branding packages, EyEPunE services"
                canonicalUrl="https://eyepune.com/Services"
                structuredData={generateOrganizationSchema()}
            />
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <span className="text-red-500 font-medium tracking-widest text-sm uppercase">
                        Transparent Pricing
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
                        Service Packages
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Choose a package that fits your needs. No hidden fees, 
                        clear deliverables, and secure payment via Razorpay.
                    </p>
                </motion.div>

                {/* Category tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-12 flex justify-center"
                >
                    <div className="inline-flex flex-wrap gap-2 p-2 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Packages grid */}
            <div className="max-w-7xl mx-auto px-6">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                ) : filteredPackages.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No packages available in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg, index) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                index={index}
                                onSelect={setSelectedPackage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Trust section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-4xl mx-auto px-6 mt-20 text-center"
            >
                <div className="p-8 rounded-3xl bg-gradient-to-r from-red-950/30 to-red-900/20 border border-red-500/10">
                    <h3 className="text-2xl font-bold text-white mb-3">Need a Custom Solution?</h3>
                    <p className="text-gray-400 mb-6">
                        Every brand is unique. Let's discuss your specific requirements 
                        and create a tailored growth strategy.
                    </p>
                    <a 
                        href="/Contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                        Get Custom Quote
                    </a>
                </div>
            </motion.div>

            {/* Checkout Modal */}
            {selectedPackage && (
                <CheckoutModal
                    pkg={selectedPackage}
                    isOpen={!!selectedPackage}
                    onClose={() => setSelectedPackage(null)}
                />
            )}
        </div>
    );
}