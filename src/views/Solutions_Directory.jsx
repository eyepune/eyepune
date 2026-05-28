import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateBreadcrumbSchema } from "@/components/seo/SEOHead";
import { ArrowRight, Globe, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";

const programmaticSeoQueries = [
    "B2B paid ads agency India",
    "Best Google Ads agency for startups",
    "Meta Ads management services global",
    "B2B SaaS performance marketing agency",
    "Account-based marketing (ABM) paid advertising Pune",
    "Top paid advertising company for lead generation",
    "Performance-based marketing agency India",
    "Website development AI tools in Pune",
    "Website development and design services Pune",
    "Free website development consultation Pune",
    "Best website development company Pune",
    "Website development course and training",
    "Custom AI website development company",
    "E-commerce website development services",
    "Sales funnel optimization services India",
    "Conversion rate optimization (CRO) agency global",
    "B2B lead generation funnel builder",
    "Top landing page optimization services Pune",
    "Automated sales funnel strategy",
    "E-commerce UX and funnel optimization",
    "High-ticket client acquisition funnels",
    "Social media marketing services in India",
    "Best social media agency for global brands",
    "B2B LinkedIn marketing agency Pune",
    "Instagram marketing and management services",
    "Social media content creation agency",
    "Affordable digital marketing agency for startups",
    "Influencer marketing and social analytics company",
    "Brand identity design agency India",
    "Startup branding agencies global",
    "Custom logo design services Pune",
    "Top brand strategy agencies",
    "SaaS and Tech branding agency",
    "Corporate B2B brand identity design",
    "Brand style guide and positioning company",
    "Top AI automation agencies India",
    "AI business automation consultants global",
    "Hire AI automation specialist Pune",
    "Generative AI integration services",
    "Best AI agency for small businesses",
    "Business Process Automation (BPA) companies India",
    "Custom AI agent development company"
];

export default function Solutions_Directory() {
    return (
        <div className="bg-transparent text-white overflow-hidden min-h-screen">
            <SEOHead 
                title="Global Solutions Directory | EyE PunE"
                description="Explore EyE PunE's comprehensive directory of digital marketing, AI automation, and web development solutions tailored for global businesses."
                keywords="solutions directory, SEO sitemap, digital marketing services, AI automation solutions, EyE PunE directory"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Solutions Directory", path: "/Solutions-Directory" }
                    ])
                ]}
            />

            <section className="relative pt-32 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8"
                    >
                        <Globe className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold tracking-widest uppercase text-red-400">Global Reach</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 leading-tight"
                    >
                        Solutions <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Directory</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Browse our complete index of specialized AI and marketing solutions tailored to dominate your specific industry and market.
                    </motion.p>
                </div>
            </section>

            <section className="py-10 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programmaticSeoQueries.map((query, i) => {
                            const slug = query.split(' ').join('-');
                            return (
                                <Link 
                                    key={i} 
                                    href={`/Solutions/${slug}`}
                                    className="p-4 bg-white/[0.02] border border-white/5 hover:border-red-500/30 rounded-xl hover:bg-white/[0.04] transition-all group flex items-center justify-between"
                                >
                                    <span className="text-sm text-gray-300 group-hover:text-white capitalize">{query}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-red-900/20 to-orange-900/10 border border-red-500/20 rounded-[3rem] p-12 relative overflow-hidden">
                    <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        We build custom AI engines and marketing systems for businesses worldwide. Book a call to discuss your specific needs.
                    </p>
                    <Link href={createPageUrl("Booking")}>
                        <Button className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 py-6 text-md font-bold">
                            Book a Consultation
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
