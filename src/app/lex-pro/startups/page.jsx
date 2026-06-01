"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StartupsPage() {
    return (
        <div className="min-h-screen bg-[#0A0F1C] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="relative z-50 flex items-center px-4 md:px-8 py-6 max-w-7xl mx-auto">
                <Link href="/lex-pro" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium text-sm md:text-base">Back to LexPro</span>
                </Link>
            </nav>

            <section className="relative z-10 pt-12 pb-24 px-4 max-w-5xl mx-auto text-center flex flex-col items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-[#0A0F1C]/0 to-[#0A0F1C]/0 rounded-full pointer-events-none" />
                
                <Rocket className="w-12 h-12 md:w-16 md:h-16 text-blue-400 mb-8" />
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1]"
                >
                    Bulletproof Legals for <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">High-Growth Startups.</span>
                </motion.h1>
                <p className="text-base md:text-xl text-gray-400 max-w-2xl mb-10 md:mb-12 leading-relaxed px-2">
                    Generate co-founder agreements, NDAs, and ESOP policies instantly without exorbitant legal retainers. Ensure total compliance from Day 1.
                </p>
                <Link href="/lex-pro/login">
                    <Button className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold bg-white text-[#0A0F1C] hover:bg-gray-100 rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        Protect Your Startup
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </Button>
                </Link>
            </section>
        </div>
    )
}
