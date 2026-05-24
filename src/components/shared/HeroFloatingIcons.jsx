'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Database, Zap, Sparkles, 
    TrendingUp, Megaphone, Target, LineChart, Users, Share2 
} from 'lucide-react';

const icons = [
    // Mathematically perfect horizontal and vertical spacing to prevent clumping
    { Icon: Bot, x: "4.1%", delay: 0, duration: 30, color: "text-white" },
    { Icon: TrendingUp, x: "12.4%", delay: 15, duration: 30, color: "text-red-500", hideOnMobile: true },
    { Icon: Cpu, x: "20.7%", delay: 7.5, duration: 30, color: "text-white" },
    { Icon: Sparkles, x: "29.0%", delay: 22.5, duration: 30, color: "text-red-600", hideOnMobile: true },
    { Icon: Megaphone, x: "37.3%", delay: 2.5, duration: 30, color: "text-white" },
    { Icon: Database, x: "45.6%", delay: 17.5, duration: 30, color: "text-red-500", hideOnMobile: true },
    { Icon: Target, x: "53.9%", delay: 10, duration: 30, color: "text-white" },
    { Icon: Code, x: "62.2%", delay: 25, duration: 30, color: "text-red-600", hideOnMobile: true },
    { Icon: LineChart, x: "70.5%", delay: 5, duration: 30, color: "text-white" },
    { Icon: Share2, x: "78.8%", delay: 20, duration: 30, color: "text-red-500", hideOnMobile: true },
    { Icon: Zap, x: "87.1%", delay: 12.5, duration: 30, color: "text-white" },
    { Icon: Users, x: "95.4%", delay: 27.5, duration: 30, color: "text-red-600", hideOnMobile: true },
];

export default function HeroFloatingIcons({ opacity = 0.5 }) {
    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ 
                opacity: opacity,
                maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
            }}
        >
            {icons.map((item, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${item.color || "text-white"} ${item.hideOnMobile ? 'hidden md:block' : ''}`}
                    style={{ left: item.x, top: "-10%" }}
                    initial={{ opacity: 0, y: 0, rotate: 0 }}
                    animate={{ 
                        opacity: [0, 0.2, 0.6, 0.1, 0.5, 0.1, 0.4, 0], 
                        y: ["-10vh", "120vh"],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ 
                        duration: item.duration, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: item.delay
                    }}
                >
                    <item.Icon className="w-6 h-6 sm:w-10 sm:h-10 md:w-16 md:h-16 opacity-100" strokeWidth={0.3} />
                </motion.div>
            ))}
        </div>
    );
}
