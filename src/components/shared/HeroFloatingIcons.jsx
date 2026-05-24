'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Database, Zap, Sparkles, 
    TrendingUp, Megaphone, Target, LineChart, Users, Share2 
} from 'lucide-react';

const icons = [
    // Tech & AI
    { Icon: Bot, x: "8%", delay: 0, duration: 25 },
    { Icon: Cpu, x: "22%", delay: 10, duration: 22 },
    { Icon: Database, x: "45%", delay: 7, duration: 35 },
    { Icon: Code, x: "65%", delay: 8, duration: 29 },
    { Icon: Zap, x: "85%", delay: 12, duration: 26 },
    { Icon: Sparkles, x: "28%", delay: 15, duration: 27 },
    
    // Marketing & Growth
    { Icon: TrendingUp, x: "15%", delay: 5, duration: 30 },
    { Icon: Megaphone, x: "35%", delay: 2, duration: 28 },
    { Icon: Target, x: "55%", delay: 1, duration: 24 },
    { Icon: LineChart, x: "75%", delay: 4, duration: 31 },
    { Icon: Users, x: "92%", delay: 6, duration: 33 },
    { Icon: Share2, x: "80%", delay: 18, duration: 32 },
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
