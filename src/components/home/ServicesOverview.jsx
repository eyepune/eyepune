import React from 'react';
import { motion } from 'framer-motion';
import { 
    Megaphone, 
    Code2, 
    Bot, 
    Palette, 
    TrendingUp,
    Workflow,
    ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const services = [
    {
        icon: Megaphone,
        title: "Social Media & Ads",
        description: "Performance-driven campaigns across Meta, Google & LinkedIn that deliver measurable ROI.",
        color: "from-red-500 to-orange-500",
        page: "Service_SocialMedia"
    },
    {
        icon: Code2,
        title: "Web & App Development",
        description: "Stunning, conversion-optimized websites and mobile apps built for scale.",
        color: "from-red-600 to-red-400",
        page: "Service_WebDev"
    },
    {
        icon: Bot,
        title: "AI Automations",
        description: "Smart workflows and lead generation systems powered by cutting-edge AI.",
        color: "from-red-500 to-pink-500",
        page: "Service_AI"
    },
    {
        icon: Palette,
        title: "Branding & Content",
        description: "Memorable brand identities and content strategies that resonate with your audience.",
        color: "from-red-400 to-red-600",
        page: "Service_Branding"
    },
    {
        icon: TrendingUp,
        title: "Sales Funnels",
        description: "End-to-end sales funnel design — from awareness to conversion — built to maximize revenue.",
        color: "from-orange-500 to-red-500",
        page: "Service_Funnels"
    },
    {
        icon: Workflow,
        title: "System Funnels",
        description: "Automated CRM pipelines, follow-up systems, and lead nurturing that work 24/7 for your business.",
        color: "from-red-700 to-pink-600",
        page: "Service_Funnels"
    }
];

export default function ServicesOverview() {
    return (
        <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/5 to-transparent" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="text-red-500 font-medium tracking-widest text-sm uppercase">What We Do</span>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
                        Full-Stack Digital
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                            Growth Solutions
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Everything your brand needs to dominate the digital landscape, 
                        under one roof.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Link to={createPageUrl(service.page)}>
                                <div className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 transition-all duration-500 hover:bg-white/[0.04] cursor-pointer h-full">
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-600/0 to-red-500/0 group-hover:from-red-600/5 group-hover:to-red-500/5 transition-all duration-500" />
                                    
                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                                            <service.icon className="w-7 h-7 text-white" />
                                        </div>
                                        
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-gray-400 leading-relaxed">
                                                    {service.description}
                                                </p>
                                            </div>
                                            <ArrowUpRight className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 flex-shrink-0 ml-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-3xl bg-gradient-to-r from-red-950/30 to-red-900/20 border border-red-500/10"
                >
                    {[
                        { value: "100+", label: "Brands Scaled" },
                        { value: "₹10Cr+", label: "Revenue Generated" },
                        { value: "500%", label: "Avg. ROAS" },
                        { value: "24/7", label: "Support" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-gray-400 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}