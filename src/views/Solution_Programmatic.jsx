import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { 
    Users, Target, Zap, 
    CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateServiceSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";

export default function Solution_Programmatic() {
    const pathname = usePathname();
    const [query, setQuery] = useState('Growth Solutions');
    
    useEffect(() => {
        if (pathname) {
            // Extract the last part of the path, e.g., /Solutions/B2B-paid-ads-agency-India
            const parts = pathname.split('/');
            const lastPart = parts[parts.length - 1];
            if (lastPart) {
                // Replace hyphens with spaces and decode URI
                const formattedQuery = decodeURIComponent(lastPart).replace(/-/g, ' ');
                setQuery(formattedQuery);
            }
        }
    }, [pathname]);

    const title = `${query} | EyE PunE`;
    const description = `Discover top-tier ${query.toLowerCase()} tailored for your business. EyE PunE provides elite digital marketing and AI automation services globally.`;

    return (
        <div className="bg-transparent text-white overflow-hidden">
            <SEOHead 
                title={title}
                description={description}
                keywords={`${query}, digital marketing, AI automation, EyE PunE`}
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Solutions", path: "/Solutions" },
                        { name: query, path: pathname }
                    ]),
                    generateServiceSchema(
                        query,
                        description,
                        "95000"
                    )
                ]}
            />

            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8"
                    >
                        <Zap className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold tracking-widest uppercase text-red-400">Customized Solutions</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 leading-tight capitalize"
                    >
                        {query}
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                    >
                        You searched for <strong>{query}</strong>. We engineer high-performance systems that convert traffic into revenue, utilizing advanced AI and elite marketing strategies tailored to your exact needs.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href={createPageUrl("Booking")}>
                            <Button size="lg" className="bg-red-600 hover:bg-red-500 text-white rounded-full px-10 h-16 text-lg font-bold shadow-xl shadow-red-600/20">
                                Get a Custom Strategy <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href={createPageUrl("AI_Assessment")}>
                            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-10 h-16 text-lg font-bold">
                                Free AI Assessment
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 2. Visual Hook */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full" />
                    
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black mb-6">Why EyE PunE for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 capitalize">{query}?</span></h2>
                            <p className="text-gray-400 mb-8 text-lg">
                                We combine technical excellence with psychological sales frameworks. Our systems are built to scale, ensuring that your investment translates directly into measurable growth.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Data-Driven Strategy & Execution",
                                    "End-to-End Automation & AI Integration",
                                    "Global Reach with Localized Precision",
                                    "Transparent Reporting & ROI Focus"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-red-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-white/[0.015] backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center min-h-[300px]">
                                <Target className="w-16 h-16 text-red-500 mb-6" />
                                <h3 className="text-2xl font-bold mb-2">Targeted Execution</h3>
                                <p className="text-gray-400">Our approach to {query.toLowerCase()} is designed to outpace the competition.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-red-600 to-orange-600 rounded-[3rem] p-16 shadow-2xl shadow-red-600/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <Sparkles className="w-12 h-12 text-white/20 absolute top-10 right-10 animate-pulse" />
                    
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to Dominate?</h2>
                    <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
                        Stop guessing. Let's engineer a bespoke system for your business and start driving predictable revenue today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={createPageUrl("Booking")}>
                            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-12 h-16 text-lg font-bold shadow-xl">
                                Book Your Growth Audit
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
