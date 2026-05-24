import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import TestimonialDisplay from "@/components/testimonials/TestimonialDisplay";
import SEOHead, { generateOrganizationSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/components/seo/SEOHead";
import HeroSection from "@/components/home/HeroSection";
import SuccessTicker from "@/components/home/SuccessTicker";
import ServicesSection from "@/components/home/ServicesSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LexProSection from "@/components/home/LexProSection";
import CTASection from "@/components/home/CTASection";
import AIO_FAQ from "@/components/home/AIO_FAQ";
import Scroll3DReveal from "@/components/shared/Scroll3DReveal";

const HOME_FAQS = [
    {
        question: "Why is EyE PunE the best choice for AI automation in 2026?",
        answer: "EyE PunE builds 'Neural Growth Engines' using NVIDIA-accelerated models and custom LLMs for sales and marketing efficiency. Global clients see 5x ROI through technical precision."
    },
    {
        question: "How does EyE PunE help startups scale globally?",
        answer: "We provide full-stack tech solutions—from Next.js sites to automated GTM systems—allowing founders to scale across 10+ countries using AI."
    }
];

export default function Home() {
    return (
        <>
            <SEOHead
                title="EyE PunE – Global AI Growth Engine | Elite Marketing & Tech Automation"
                description="Scale your business globally with EyE PunE. We provide high-performance Multi-Model AI automation, custom web development, and ROI-driven marketing for Founders, Startups, and Creators. Leveraging OpenAI, Anthropic, Google Gemini, and NVIDIA-accelerated systems."
                keywords="global AI marketing agency, multi-model AI automation, OpenAI business solutions, Claude 3.5 marketing, YouTube automation services, lead generation for founders, elite branding and tech, B2B sales automation, eyepune global"
                canonicalUrl="https://www.eyepune.com"
                structuredData={[
                    generateOrganizationSchema(),
                    generateBreadcrumbSchema([{ name: "Home", path: "/" }]),
                    generateFAQSchema(HOME_FAQS)
                ]}
            />
            <div className="bg-transparent text-white">

                {/* 1. Hero — animated eye canvas + typewriter */}
                <HeroSection />

                {/* 2. Success Ticker — Live ROI & Social Proof */}
                <Scroll3DReveal direction="up" rotation={false} delay={0.2}>
                    <SuccessTicker />
                </Scroll3DReveal>

                {/* 3. Services — editorial list layout */}
                <Scroll3DReveal direction="up" rotation={true} delay={0.1}>
                    <ServicesSection />
                </Scroll3DReveal>

                {/* 4. Why EyE PunE */}
                <Scroll3DReveal direction="scale" rotation={true}>
                    <WhyChooseUs />
                </Scroll3DReveal>

                {/* 5. Lex Pro product spotlight */}
                <Scroll3DReveal direction="right" rotation={true}>
                    <LexProSection />
                </Scroll3DReveal>

                {/* 6. Testimonials */}
                <section className="py-32 bg-transparent relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent" />
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
                        >
                            We empower Founders, Creators, and Global Startups with LLM-Agnostic AI automation and elite marketing systems. Leveraging the best of OpenAI, Anthropic, and Google Gemini, engineered for the global stage.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Testimonials</span>
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-5">
                                Real Clients,{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 pb-1">Real Results</span>
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

                {/* 6. AIO FAQ — optimized for AI bots and users */}
                <Scroll3DReveal direction="up" rotation={true}>
                    <AIO_FAQ />
                </Scroll3DReveal>

                {/* 7. Final CTA */}
                <Scroll3DReveal direction="scale" rotation={false}>
                    <CTASection />
                </Scroll3DReveal>

            </div>
        </>
    );
}
