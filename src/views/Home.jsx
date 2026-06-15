import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import dynamic from 'next/dynamic';
import SEOHead, { generateOrganizationSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/components/seo/SEOHead";
import HeroSection from "@/components/home/HeroSection";

const TestimonialDisplay = dynamic(() => import("@/components/testimonials/TestimonialDisplay"), { ssr: false });
const SuccessTicker = dynamic(() => import("@/components/home/SuccessTicker"), { ssr: true });
const ServicesSection = dynamic(() => import("@/components/home/ServicesSection"), { ssr: true });
const WhyChooseUs = dynamic(() => import("@/components/home/WhyChooseUs"), { ssr: true });
const LexProSection = dynamic(() => import("@/components/home/LexProSection"), { ssr: false });
const CTASection = dynamic(() => import("@/components/home/CTASection"), { ssr: false });
const AIO_FAQ = dynamic(() => import("@/components/home/AIO_FAQ"), { ssr: false });
const Scroll3DReveal = dynamic(() => import("@/components/shared/Scroll3DReveal"), { ssr: true });
const RecentInsights = dynamic(() => import("@/components/home/RecentInsights"), { ssr: false });
const GlobalLeadMagnet = dynamic(() => import("@/components/home/GlobalLeadMagnet"), { ssr: false });
import { Zap } from 'lucide-react';

const HOME_FAQS = [
    {
        question: "What services does EyE PunE provide?",
        answer: "EyE PunE provides comprehensive digital growth services including Custom AI Chatbots, Multi-Agent Orchestration, Full-Stack Next.js Website Development, B2B Lead Generation (LinkedIn & cold email outreach), and Performance Marketing globally."
    },
    {
        question: "Where is EyE PunE located and who do they serve?",
        answer: "EyE PunE is headquartered in Pune, India, but operates globally, serving elite clients, startups, and founders across the United States, United Kingdom, Canada, Australia, and the Middle East."
    },
    {
        question: "How much does it cost to build a custom AI lead generation chatbot?",
        answer: "The cost of building a custom AI lead generation chatbot varies based on complexity and integration needs. At EyE PunE, our comprehensive Growth Engine packages start at $999, providing a fully automated, multi-model AI orchestration system tailored to scaling B2B businesses."
    },
    {
        question: "How does EyE PunE generate B2B leads autonomously?",
        answer: "We build automated B2B growth engines that utilize AI to scrape, enrich, and outreach to ideal client profiles on LinkedIn and via email. This creates a 24/7 autonomous sales pipeline for founders and agencies without requiring manual intervention."
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

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">Testimonials</span>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
                                Real Clients,{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 pb-1">Real Results</span>
                            </h2>
                            <div className="flex items-center justify-center gap-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-gray-500 ml-2 text-sm">Rated 5/5</span>
                            </div>
                        </motion.div>
                        <TestimonialDisplay featured={true} limit={6} isMarquee={true} />
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
                
                {/* 7. Recent Insights (Programmatic SEO Booster) */}
                <Scroll3DReveal direction="up" rotation={false}>
                    <RecentInsights />
                </Scroll3DReveal>

                {/* 8. Global Lead Magnet (AI Audit) */}
                <Scroll3DReveal direction="scale" rotation={true}>
                    <GlobalLeadMagnet />
                </Scroll3DReveal>

                {/* 9. AIO FAQ — optimized for AI bots and users */}
                <Scroll3DReveal direction="up" rotation={true}>
                    <AIO_FAQ />
                </Scroll3DReveal>

                {/* 10. Final CTA */}
                <Scroll3DReveal direction="scale" rotation={false}>
                    <CTASection />
                </Scroll3DReveal>

            </div>
        </>
    );
}
