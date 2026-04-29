'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, Users, Zap, Award, BarChart3 } from 'lucide-react';

const stats = [
    { icon: TrendingUp, text: "₹3.5Cr+ Client ROI Generated", color: "text-red-500" },
    { icon: Globe, text: "124+ Global Projects Delivered", color: "text-orange-500" },
    { icon: Users, text: "98.4% Client Retention Rate", color: "text-red-400" },
    { icon: Award, text: "Top Rated Digital Agency in Pune", color: "text-orange-400" },
    { icon: BarChart3, text: "Avg 5X ROI Across All Industries", color: "text-red-500" },
    { icon: Zap, text: "24/7 AI-Powered Support Systems", color: "text-orange-500" },
];

export default function SuccessTicker() {
    return (
        <div className="relative w-full py-4 bg-[#080808] border-y border-white/5 overflow-hidden">
            {/* Gradient Masking for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#080808] to-transparent z-10" />

            <div className="flex whitespace-nowrap">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="flex gap-16 items-center px-8"
                >
                    {/* Double the list for infinite loop */}
                    {[...stats, ...stats].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2.5} />
                            <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                                {stat.text}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
