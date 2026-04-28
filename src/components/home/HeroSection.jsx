import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Bot, ArrowRight, ChevronDown, Sparkles, ShieldCheck, Zap, Cpu, Globe, Code, MessageCircle, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";

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

    const words = ["Precision", "Growth", "Systems"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section ref={heroRef} className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden bg-[#040404]">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px]" />

                {/* Floating Tech & Social Symbols */}
                {[
                    { Icon: Bot, x: "10%", y: "20%", delay: 0 },
                    { Icon: Instagram, x: "85%", y: "15%", delay: 2 },
                    { Icon: Facebook, x: "75%", y: "70%", delay: 4 },
                    { Icon: Linkedin, x: "15%", y: "75%", delay: 1 },
                    { Icon: Twitter, x: "50%", y: "10%", delay: 3 },
                    { Icon: Cpu, x: "90%", y: "60%", delay: 5 },
                    { Icon: Code, x: "5%", y: "45%", delay: 2.5 },
                    { Icon: Globe, x: "80%", y: "40%", delay: 1.5 },
                    { Icon: Zap, x: "30%", y: "85%", delay: 0.5 },
                    { Icon: MessageCircle, x: "70%", y: "80%", delay: 3.5 },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0.15, 0.25, 0.15],
                            y: [0, -40, 0],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                            duration: 10 + Math.random() * 5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: item.delay
                        }}
                        className="absolute text-white"
                        style={{ left: item.x, top: item.y }}
                    >
                        <item.Icon className="w-12 h-12 md:w-20 md:h-20" strokeWidth={0.6} />
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Column: Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-8"
                        >
                            <Sparkles className="w-3 h-3" />
                            Connect · Engage · Grow
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                            <div className="relative inline-flex flex-col h-[1.2em] overflow-hidden align-bottom">
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
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"
                                    >
                                        {words[index]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <br />
                            for Ambitious Brands
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed"
                        >
                            We combine deep-tech automation with elite sales strategy to scale your business predictably. No fluff, just performance-driven results.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="flex flex-wrap gap-4 mb-12"
                        >
                            <Link href={createPageUrl("AI_Assessment")}>
                                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all">
                                    Start AI Assessment
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href={createPageUrl("Booking")}>
                                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 py-6 text-lg font-semibold">
                                    Book Strategy Call
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Trust markers */}
                        <div className="flex items-center gap-8 border-t border-white/5 pt-8">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">100+</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Global Clients</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">5X</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Avg ROI</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">24/7</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">AI Support</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Animated Eye */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex justify-center lg:justify-end items-center"
                    >
                        <div className="relative group">
                            {/* Floating decorative elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 p-4 rounded-2xl bg-[#111] border border-white/10 shadow-2xl z-20 hidden md:block"
                            >
                                <Zap className="w-8 h-8 text-orange-500" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-10 p-4 rounded-2xl bg-[#111] border border-white/10 shadow-2xl z-20 hidden md:block"
                            >
                                <ShieldCheck className="w-8 h-8 text-red-500" />
                            </motion.div>

                            <AnimatedEye />
                            
                            {/* Orbital Rings */}
                            <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.5] pointer-events-none" />
                            <div className="absolute inset-0 border border-white/5 rounded-full scale-[2] pointer-events-none opacity-50" />
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-red-600 to-transparent" />
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Discover</span>
            </motion.div>
        </section>
    );
}
