import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, TrendingUp, Users, Heart, MessageSquare, BarChart3, Instagram } from 'lucide-react';
import SEOHead from "@/components/seo/SEOHead";
import TestimonialDisplay from "@/components/testimonials/TestimonialDisplay";

const faqs = [
    { question: "How much does social media management cost in Pune?", answer: "EyE PunE's social media management packages start at ₹30,000/month for 2 platforms, including content creation, scheduling, and monthly reporting. Custom packages are available for enterprise clients." },
    { question: "Which social media platforms do you manage?", answer: "We manage Instagram, Facebook, LinkedIn, Twitter/X, YouTube, and WhatsApp Business. We recommend the best platform mix based on your target audience and industry." },
    { question: "How many posts per week will you create?", answer: "Our starter package includes 12 posts/month (3/week). Growth packages include daily posting across multiple platforms including Reels, Stories, and carousels." },
    { question: "Do you run paid social media ads as well?", answer: "Yes! We offer combined organic + paid social packages. Our Meta Ads and Instagram Ads management delivers measurable ROI with detailed performance reporting." },
    { question: "How long before I see results from social media marketing?", answer: "Most clients see engagement improvements within 30-60 days. Significant follower growth and lead generation typically takes 3-6 months of consistent posting." }
];

const features = [
    { icon: Instagram, title: "Content Creation", desc: "Professional graphics, Reels, carousels, and copy tailored to your brand voice." },
    { icon: TrendingUp, title: "Growth Strategy", desc: "Data-driven hashtag research, posting schedules, and audience targeting." },
    { icon: Users, title: "Community Management", desc: "Daily engagement, comment responses, and DM management." },
    { icon: BarChart3, title: "Monthly Analytics", desc: "Detailed reports with reach, engagement, follower growth, and ROI." },
    { icon: MessageSquare, title: "Influencer Outreach", desc: "Connect with relevant micro and macro influencers in Pune and across India." },
    { icon: Heart, title: "Brand Consistency", desc: "Cohesive visual identity across all platforms with custom templates." },
];

const results = [
    { val: '3x', label: 'Avg. Engagement Increase' },
    { val: '10K+', label: 'Followers Grown for Clients' },
    { val: '50+', label: 'Brands Managed' },
    { val: '98%', label: 'Client Retention Rate' },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://eyepune.com" },
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services_Detail" },
                { "@type": "ListItem", "position": 3, "name": "Social Media Management Pune", "item": "https://eyepune.com/Service_SocialMedia" }
            ]
        },
        {
            "@type": "Service",
            "name": "Social Media Management Pune",
            "description": "Professional social media management in Pune including content creation, community management, and growth strategy for Instagram, Facebook, and LinkedIn.",
            "provider": { "@type": "LocalBusiness", "name": "EyE PunE", "url": "https://eyepune.com", "telephone": "+91-9284712033", "address": { "@type": "PostalAddress", "addressLocality": "Pune", "addressRegion": "Maharashtra", "addressCountry": "IN" } },
            "areaServed": { "@type": "City", "name": "Pune" },
            "offers": { "@type": "Offer", "price": "30000", "priceCurrency": "INR", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "30000", "priceCurrency": "INR", "unitText": "MONTH" } }
        }
    ]
};

export default function Service_SocialMedia() {
    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">
            <SEOHead
                title="Social Media Management Pune | Instagram, Facebook, LinkedIn – EyE PunE"
                description="Professional social media management in Pune. EyE PunE creates engaging content, grows followers, and drives leads on Instagram, Facebook & LinkedIn. Packages from ₹30,000/month."
                keywords="social media management pune, instagram marketing pune, facebook marketing pune, linkedin marketing pune, social media agency pune, content creation pune"
                canonicalUrl="https://eyepune.com/Service_SocialMedia"
                structuredData={faqSchema}
            />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                <Instagram className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Social Media Management · Pune</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[0.95]">
                                Social Media<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Management Pune</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                From content creation to community management — we handle your entire social media presence so you can focus on running your business.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Get Free Audit <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link to={createPageUrl("Pricing")}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-5 rounded-full text-base">
                                        View Packages
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
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">What's Included</span>
                        <h2 className="text-4xl md:text-5xl font-black">Everything You Need to<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Dominate Social Media</span></h2>
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

            {/* FAQ */}
            <section className="py-24 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">FAQs</span>
                        <h2 className="text-4xl font-black">Common Questions</h2>
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

            {/* Testimonials */}
            <section className="py-16 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center mb-10">What Our Clients Say</h2>
                    <TestimonialDisplay limit={3} serviceType="social_media" />
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-[#040404]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Social Presence?</span></h2>
                    <p className="text-gray-400 mb-8">Get a free social media audit — we'll identify exactly what's holding you back.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl("Booking")}>
                            <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                Book Free Consultation
                            </Button>
                        </Link>
                        <a href="https://wa.me/919284712033?text=Hi,%20I%20need%20social%20media%20management%20for%20my%20business" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-6 rounded-full text-lg">
                                WhatsApp Us
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}