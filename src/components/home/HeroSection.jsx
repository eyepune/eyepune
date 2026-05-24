import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

function AnimatedEye() {
    return (
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Outer Glow */}
            <motion.div
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-red-600/20 blur-[60px] rounded-full"
            />
            
            {/* The Eye SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Eyelashes/Lines */}
                <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                    {[
                        { x1: 15, y1: 47, x2: 5, y2: 36 },
                        { x1: 27, y1: 40, x2: 18, y2: 28 },
                        { x1: 38, y1: 36, x2: 33, y2: 22 },
                        { x1: 50, y1: 35, x2: 50, y2: 20 },
                        { x1: 62, y1: 36, x2: 67, y2: 22 },
                        { x1: 73, y1: 40, x2: 82, y2: 28 },
                        { x1: 85, y1: 47, x2: 95, y2: 36 },
                    ].map((line, i) => (
                        <motion.line
                            key={i}
                            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                        />
                    ))}
                </g>

                {/* Eye Shape */}
                <motion.path
                    d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Iris */}
                <motion.circle
                    cx="50" cy="55" r="14"
                    stroke="#ef4444"
                    strokeWidth="3"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                />

                {/* Pupil */}
                <motion.circle
                    cx="50" cy="55" r="6"
                    fill="#ef4444"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Scanning Line Effect */}
                <motion.line
                    x1="10" y1="55" x2="90" y2="55"
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    animate={{ 
                        y1: [30, 80, 30],
                        y2: [30, 80, 30],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
    );
}

export default function HeroSection() {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 600], [0, 100]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);

    const words = ["Automation", "Intelligence", "Growth"];
    const [index, setIndex] = useState(0);
    const [url, setUrl] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section ref={heroRef} className="relative min-h-[100svh] pt-20 pb-32 flex items-center justify-center overflow-hidden bg-transparent">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-800/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />

                {/* Floating Tech & Social Symbols */}
                <HeroFloatingIcons opacity={0.5} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    
                    {/* Centered Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/30 border border-rose-900/50 text-rose-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
                        >
                            <Sparkles className="w-3 h-3" />
                            Global Growth Engine
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-2xl">
                            <div className="relative inline-flex flex-col h-[1.5em] overflow-hidden align-bottom">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={words[index]}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -40 }}
                                        transition={{ 
                                            duration: 0.6, 
                                            ease: [0.23, 1, 0.32, 1] 
                                        }}
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 pb-2"
                                    >
                                        {words[index]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <br />
                            for Global Visionaries
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
                        >
                            We empower Founders, Creators, and Global Startups with Multi-Model AI automation and elite marketing systems. Leveraging the power of OpenAI, Anthropic, and Google Gemini.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="w-full max-w-xl mb-12"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-800 to-red-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0a0000] border border-white/10 rounded-2xl sm:rounded-full p-2 gap-2 sm:gap-0 focus-within:border-red-600/70 transition-all">
                                    <div className="flex items-center flex-1">
                                        <Globe className="w-5 h-5 text-gray-500 ml-4 hidden sm:block" />
                                        <input 
                                            type="text" 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Enter your global business URL"
                                            className="bg-transparent border-none focus:ring-0 text-white text-base py-3.5 px-4 flex-1 placeholder:text-gray-600 outline-none w-full"
                                        />
                                    </div>
                                    <Link href={url ? `/AI-Assessment?url=${encodeURIComponent(url)}` : createPageUrl("AI_Assessment")} className="w-full sm:w-auto">
                                        <Button className="magnetic bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-full px-6 py-4 font-bold transition-all shadow-lg sm:px-8 hover:scale-105 active:scale-95 duration-300 w-full justify-center">
                                            <span>Start Global AI Audit</span>
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-4 ml-6 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-rose-500" />
                                Instant Global Analysis · No Credit Card Required
                            </p>
                        </motion.div>

                        {/* Trust markers */}
                        <div className="flex items-center justify-center gap-6 md:gap-12 border-t border-white/10 pt-8 mt-4 w-full">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-white drop-shadow-md">10+</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Countries</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-white drop-shadow-md">5X</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Avg ROI</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-white drop-shadow-md">NVIDIA</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Accelerated</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-red-600 to-transparent" />
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Discover</span>
            </motion.div>
        </section>
    );
}
