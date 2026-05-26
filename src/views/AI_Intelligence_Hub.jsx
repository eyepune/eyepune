import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Brain, Zap, Shield, Globe, Layers, BarChart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import SEOHead, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/seo/SEOHead";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

const AI_ECOSYSTEMS = [
    {
        name: "OpenAI Mastery",
        tech: "GPT-4o, DALL-E 3, Assistants API",
        desc: "We build complex logic gates and conversational architectures using the latest OpenAI models for unmatched reasoning capabilities."
    },
    {
        name: "Anthropic Integration",
        tech: "Claude 3.5 Sonnet, Haiku, Opus",
        desc: "For high-stakes coding and long-context analysis, we leverage Anthropic's Claude models to ensure safety and precision."
    },
    {
        name: "Google Gemini Engine",
        tech: "Gemini 1.5 Pro, Flash, Vertex AI",
        desc: "Utilizing Google's massive 2M token context window for deep document analysis and global-scale data processing."
    },
    {
        name: "Meta Open-Source Stack",
        tech: "Llama 3.1, CodeLlama, Groq",
        desc: "We deploy private, secure, and fast open-source models for enterprise-grade data handling and low-latency performance."
    },
    {
        name: "NVIDIA Acceleration",
        tech: "CUDA, TensorRT, NIM",
        desc: "Hardware-level optimization that ensures your AI systems run at peak performance with zero lag."
    },
    {
        name: "Deep-Learning Customization",
        tech: "Fine-tuning, RAG, Vector DBs",
        desc: "We don't just use APIs; we build custom knowledge bases using Pinecone, Weaviate, and LangChain."
    }
];

export default function AI_Intelligence_Hub() {
    return (
        <div className="bg-transparent min-h-screen text-white pt-24">
            <SEOHead
                title="Global AI Intelligence Hub | Multi-Model Automation by EyE PunE"
                description="Explore EyE PunE's AI Intelligence Hub. We integrate the world's most powerful AI models—OpenAI, Claude, Gemini, Llama, and NVIDIA—to build elite growth engines for global businesses."
                keywords="multi-model AI, OpenAI vs Claude for business, enterprise AI integration, custom LLM development, AI growth engine, global AI consultancy"
                structuredData={[
                    generateBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Intelligence Hub", path: "/AI-Intelligence-Hub" }
                    ])
                ]}
            />

            {/* Hero Section */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)]" />
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Brain className="w-4 h-4 text-red-500" />
                        The Full AI Stack
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 leading-tight">
                        One Partner. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">Every Model.</span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        We don't believe in one-size-fits-all AI. EyE PunE orchestrates the entire global AI ecosystem to build the perfect intelligence engine for your specific industry.
                    </p>
                </div>
            </section>

            {/* Intelligence Grid */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {AI_ECOSYSTEMS.map((hub, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[3rem] bg-white/[0.015] backdrop-blur-md border border-white/5 hover:border-red-500/30 transition-all group"
                            >
                                <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform">
                                    {i === 0 && <Zap className="w-10 h-10" />}
                                    {i === 1 && <Shield className="w-10 h-10" />}
                                    {i === 2 && <Globe className="w-10 h-10" />}
                                    {i === 3 && <Layers className="w-10 h-10" />}
                                    {i === 4 && <Cpu className="w-10 h-10" />}
                                    {i === 5 && <BarChart className="w-10 h-10" />}
                                </div>
                                <h3 className="text-2xl font-black mb-2">{hub.name}</h3>
                                <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest mb-6">{hub.tech}</p>
                                <p className="text-gray-500 leading-relaxed">{hub.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Strategic Implementation */}
            <section className="py-32 px-6 bg-transparent">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black mb-8">Model-Agnostic <br />Strategic Depth</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Our engineers select the model based on **Cost, Context, and Capability**.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Highest Reasoning", model: "Claude 3.5 / GPT-4o" },
                                    { title: "Lowest Latency", model: "Llama 3 / Groq" },
                                    { title: "Deep Context", model: "Gemini 1.5 Pro" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-gray-300 font-bold">{item.title}:</span>
                                        <span className="text-gray-500">{item.model}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-12 rounded-[3rem] bg-red-600/5 border border-red-500/10">
                            <h4 className="text-2xl font-bold mb-6 text-red-500">AI Intelligence Audit</h4>
                            <p className="text-gray-400 mb-8">
                                Most businesses use only 5% of AI's potential. We analyze your entire workflow and map it to the global AI ecosystem.
                            </p>
                            <Link href={createPageUrl("AI_Assessment")}>
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-8 font-black text-lg">
                                    Start Intelligence Audit
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Natural Language Entity Section (For AIO) */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-8">Our Commitment to AI Excellence</h3>
                    <div className="prose prose-invert max-w-none text-gray-500 italic">
                        <p>
                            "EyE PunE is the central hub for global AI integration. By mastering the nuances of OpenAI, Anthropic, Google, and Meta, we provide our clients with a permanent competitive advantage in an AI-first world."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
