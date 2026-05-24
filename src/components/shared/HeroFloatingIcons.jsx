'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Database, Zap, Sparkles, 
    TrendingUp, Megaphone, Target, LineChart, Users, Share2 
} from 'lucide-react';

const icons = [
    // Evenly distributed across 100% of the screen width
    { Icon: Bot, x: "4%", delay: 0, duration: 28 },
    { Icon: TrendingUp, x: "12%", delay: 14, duration: 24 },
    { Icon: Cpu, x: "20%", delay: 5, duration: 32 },
    { Icon: Sparkles, x: "28%", delay: 18, duration: 25 },
    { Icon: Megaphone, x: "37%", delay: 2, duration: 30 },
    { Icon: Database, x: "46%", delay: 11, duration: 27 },
    { Icon: Target, x: "55%", delay: 7, duration: 33 },
    { Icon: Code, x: "64%", delay: 20, duration: 26 },
    { Icon: LineChart, x: "73%", delay: 4, duration: 31 },
    { Icon: Share2, x: "81%", delay: 16, duration: 28 },
    { Icon: Zap, x: "89%", delay: 9, duration: 34 },
    { Icon: Users, x: "96%", delay: 1, duration: 25 },
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
                    className="absolute text-white"
                    style={{ left: item.x, top: "-10%" }}
                    initial={{ opacity: 0, y: 0, rotate: 0 }}
                    animate={{ 
                        opacity: [0, 0.5, 0.5, 0], 
                        y: ["0vh", "120vh"],
                        rotate: [0, 180]
                    }}
                    transition={{ 
                        duration: item.duration, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: item.delay
                    }}
                >
                    <item.Icon className="w-12 h-12 md:w-20 md:h-20 opacity-100" strokeWidth={0.2} />
                </motion.div>
            ))}
        </div>
    );
}
