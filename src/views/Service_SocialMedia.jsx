import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, TrendingUp, Users, Heart, MessageSquare, BarChart3, Instagram, Search, Zap } from 'lucide-react';
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';
import SEOHead from '@/components/seo/SEOHead';
import LeadMagnetForm from '@/components/seo/LeadMagnetForm';

const faqs = [
    { question: "How much does social media management cost in Pune?", answer: "EyE PunE's social media management packages start at ₹30,000/month for 2 platforms, including content creation, scheduling, and monthly reporting. Custom packages are available for enterprise clients." },
    { question: "Which social media platforms do you manage?", answer: "We manage Instagram, Facebook, LinkedIn, Twitter/X, YouTube, and WhatsApp Business. We recommend the best platform mix based on your target audience and industry." },
    { question: "How many posts per week will you create?", answer: "Our packages range from 12 to 24+ content pieces per month. The Starter package includes 12 deliverables (Posts, Carousels & Reels), while our Growth and Authority plans offer high-frequency posting including viral Reels strategy and story-driven content." },
    { question: "Do you run paid social media ads as well?", answer: "Yes! We offer combined organic + paid social packages. Our Meta Ads and Instagram Ads management delivers measurable ROI with detailed performance reporting." },
    { question: "How long before I see results from social media marketing?", answer: "Most clients see engagement improvements within 30-60 days. Significant follower growth and lead generation typically takes 3-6 months of consistent posting." }
];

const features = [
    { icon: Instagram, title: "Content Creation", desc: "Professional graphics, Reels, carousels, and copy tailored to your brand voice." },
    { icon: TrendingUp, title: "Growth Strategy", desc: "Data-driven hashtag research, posting schedules, and audience targeting." },
    { icon: Users, title: "Community Management", desc: "Daily engagement, comment responses, and DM management." },
    { icon: BarChart3, title: "Monthly Analytics", desc: "Detailed reports with reach, engagement, follower growth, and ROI." },
    { icon: MessageSquare, title: "Influencer Outreach", desc: "Connect with relevant micro and macro influencers globally." },
    { icon: Heart, title: "Brand Consistency", desc: "Cohesive visual identity across all platforms with custom templates." },
];
const programmaticSeoQueries = [
    "Social media marketing services in India",
    "Best social media agency for global brands",
    "B2B LinkedIn marketing agency Pune",
    "Instagram marketing and management services",
    "Social media content creation agency",
    "Affordable digital marketing agency for startups",
    "Influencer marketing and social analytics company"
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
                { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://eyepune.com/Services-Detail" },
                { "@type": "ListItem", "position": 3, "name": "Social Media Management", "item": "https://eyepune.com/Service-SocialMedia" }
            ]
        },
        {
            "@type": "Service",
            "name": "Social Media Management",
            "description": "Dominate Instagram, Facebook, and LinkedIn globally. We handle content creation, Reels strategy, community management, and growth analytics.",
            "provider": { "@type": "Organization", "name": "EyE PunE", "url": "https://eyepune.com" },
            "areaServed": "Global",
            "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": "30000",
                "description": "Social Media Management for 2 platforms"
            }
        }
    ]
};

export default function Service_SocialMedia() {
    return (
        <>
            <SEOHead
                title="Social Media Management – Grow Your Brand & Engagement"
                description="Dominate Instagram, Facebook, and LinkedIn globally. We handle content creation, Reels strategy, community management, and growth analytics to turn followers into customers."
                keywords="social media agency pune, instagram marketing pune, social media manager pune, best social media marketing pune, content creation services pune"
                canonicalUrl="https://eyepune.com/Service-SocialMedia"
                structuredData={faqSchema}
            />

            <div className="min-h-screen bg-transparent text-white overflow-x-hidden pt-20">
            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-full max-w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
                />
                
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
                                <Instagram className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Social Media Management · Global</span>
                            </div>
                            <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.95]">
                                Social Media<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                                From content creation to community management — we handle your entire social media presence so you can focus on running your business.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={createPageUrl("Booking")}>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-5 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] text-base">
                                        Get Free Audit <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={createPageUrl("Pricing")}>
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
                                    <f.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Dynamic SEO Lead Magnet */}
            <div className="max-w-4xl mx-auto mb-24 px-4">
              <div className="rounded-3xl bg-gradient-to-r from-red-950/50 to-black border border-red-500/30 p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-3/5 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-4 uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3" /> Free PDF Download
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                      The 2026 <span className="text-red-500">Social Media</span> Growth Blueprint
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                      Steal the exact framework we use to generate highly-qualified leads and scale revenues for 100+ global clients. Enter your email to get instant access.
                    </p>
                    <LeadMagnetForm keyword="Social Media Marketing" />
                  </div>
                  
                  <div className="md:w-2/5 flex justify-center">
                    <div className="relative w-48 h-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400" />
                      <div className="p-6 pt-10 flex flex-col items-center text-center h-full">
                        <Zap className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">EyE PunE Labs</div>
                        <div className="font-black text-white text-lg leading-tight">Social Media Framework</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Programmatic SEO - Geo Targeting */}
            <section className="py-20 border-t border-white/[0.06] bg-black/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Search className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-300">People Also Search For (Global & India)</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {programmaticSeoQueries.map((query, i) => (
                            <Link href={`/Solutions/${query.toLowerCase().split(' ').join('-')}`} key={i} className="max-w-full">
                                <div className="px-4 py-2 h-auto bg-white/[0.02] border border-white/[0.05] rounded-3xl text-sm text-gray-400 hover:text-red-400 hover:bg-white/[0.04] transition-all cursor-pointer flex items-start sm:items-center gap-2 max-w-full">
                                    <Search className="w-3 h-3 flex-shrink-0 mt-1 sm:mt-0" />
                                    <span className="whitespace-normal text-left">{query}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-red-950/40 to-black border border-red-900/30 relative overflow-hidden mb-24">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 md:mb-6 relative z-10 px-2 leading-tight">
                Ready to Grow Your <span className="text-red-500 block sm:inline mt-1 sm:mt-0">Social Presence?</span>
              </h2>
              <p className="text-base md:text-xl text-gray-400 mb-8 relative z-10 px-4 leading-relaxed">
                Book a 15-minute discovery call and we'll map out a custom blueprint for you.
              </p>
              <div className="flex justify-center w-full relative z-10 mt-8">
                <Link href="/Contact" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold h-auto min-h-[56px] py-3 px-4 sm:px-8 text-base sm:text-lg rounded-[28px] w-full sm:w-auto shadow-2xl hover:scale-105 transition-all whitespace-normal text-center leading-tight">
                    Claim Your Strategy Session Now
                  </Button>
                </Link>
              </div>
            </div>
        </div>
        </>
    );
}
