'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Target, Users, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const EVENTS = [
    { type: 'lead', text: 'New high-intent lead captured for Real Estate Partner', icon: Target, color: 'text-blue-400' },
    { type: 'campaign', text: 'Instagram Ads campaign launched for E-commerce Client', icon: Zap, color: 'text-orange-400' },
    { type: 'conversion', text: '5x ROI achieved for SaaS Onboarding Flow', icon: TrendingUp, color: 'text-green-400' },
    { type: 'automation', text: 'AI Sales Assistant deployed for Education Group', icon: MessageCircle, color: 'text-purple-400' },
    { type: 'design', text: 'Premium Landing Page delivered for Fintech Startup', icon: Sparkles, color: 'text-red-400' },
    { type: 'social', text: 'Viral content reached 1M+ impressions for Fashion Brand', icon: Users, color: 'text-pink-400' },
];

export default function LivePulse() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % EVENTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const event = EVENTS[index];

    return (
        <section className="relative py-4 bg-[#050505] border-y border-white/[0.05] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping absolute inset-0" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 relative z-10" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500 whitespace-nowrap">
                        Live Growth Stream
                    </span>
                </div>

                <div className="flex-1 h-8 flex items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className="flex items-center gap-3 w-full"
                        >
                            <event.icon className={cn("w-4 h-4", event.color)} />
                            <p className="text-sm font-medium text-gray-300 truncate">
                                <span className="text-white font-bold">{event.text?.includes(' for ') ? event.text.split(' for ')[0] : event.text}</span>
                                {event.text?.includes(' for ') && <span className="text-gray-600"> for </span>}
                                {event.text?.includes(' for ') && <span className="text-red-400/80 font-bold">{event.text.split(' for ')[1]}</span>}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Clients</span>
                        <span className="text-sm font-black text-white">124</span>
                    </div>
                </div>
            </div>

            {/* Subtle light sweep */}
            <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
            />
        </section>
    );
}
