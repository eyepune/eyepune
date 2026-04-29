import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import TestimonialDisplay from "@/components/testimonials/TestimonialDisplay";
import SEOHead, { generateOrganizationSchema } from "@/components/seo/SEOHead";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LexProSection from "@/components/home/LexProSection";
import CTASection from "@/components/home/CTASection";
import LivePulse from "@/components/home/LivePulse";

export default function Home() {
    return (
        <>
            <SEOHead
                title="EyE PunE – Digital Marketing Agency Pune | Global Growth & AI Automation"
                description="Pune-based digital agency serving clients across the globe. We combine AI-driven marketing, web development, and sales systems to scale businesses worldwide."
                keywords="digital marketing agency pune, global marketing agency, social media marketing pune, AI automation pune, lead generation worldwide, branding pune, EyEPunE"
                canonicalUrl="https://www.eyepune.com"
                structuredData={[
                    generateOrganizationSchema(),
                    generateBreadcrumbSchema([{ name: "Home", path: "/" }])
                ]}
            />

            <div className="bg-[#040404] text-white overflow-x-hidden">

                {/* 1. Hero — animated eye canvas + typewriter */}
                <HeroSection />

                {/* 2. Live Pulse Ticker */}
                <LivePulse />

                {/* 3. Services — editorial list layout */}
                <ServicesSection />

                {/* 4. Why EyE PunE */}
                <WhyChooseUs />

                {/* 5. Lex Pro product spotlight */}
                <LexProSection />

                {/* 6. Testimonials */}
                <section className="py-32 bg-[#040404] relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent" />
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Testimonials</span>
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-5">
                                Real Clients,{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Real Results</span>
                            </h2>
                            <div className="flex items-center justify-center gap-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-gray-500 ml-2 text-sm">Rated 5/5 by 100+ businesses</span>
                            </div>
                        </motion.div>
                        <TestimonialDisplay featured={true} limit={3} />
                        <div className="text-center mt-12">
                            <Link href={createPageUrl("Testimonials")}>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-white/25 rounded-full px-8 py-5">
                                    View All Client Stories <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent" />
                </section>

                {/* 7. Final CTA */}
                <CTASection />

            </div>
        </>
    );
}