'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Globe, Zap, MessageCircle, 
    Facebook, Instagram, Linkedin, Twitter, 
    Hash, Database, Sparkles, Command
} from 'lucide-react';

const ICONS = [
    { Icon: Bot, x: "3%", y: "5%", delay: 0 },
    { Icon: Instagram, x: "95%", y: "15%", delay: 2 },
    { Icon: Facebook, x: "92%", y: "85%", delay: 4 },
    { Icon: Linkedin, x: "5%", y: "70%", delay: 1 },
    { Icon: Twitter, x: "96%", y: "40%", delay: 3 },
    { Icon: Cpu, x: "4%", y: "30%", delay: 5 },
    { Icon: Code, x: "94%", y: "55%", delay: 2.5 },
    { Icon: Globe, x: "2%", y: "50%", delay: 1.5 },
    { Icon: Zap, x: "97%", y: "25%", delay: 0.5 },
    { Icon: MessageCircle, x: "6%", y: "90%", delay: 3.5 },
    { Icon: Sparkles, x: "93%", y: "10%", delay: 2.8 },
    { Icon: Command, x: "3%", y: "65%", delay: 0.8 },
];

export default function FloatingBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-600/[0.015] rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-orange-600/[0.015] rounded-full blur-[150px]" />

            {/* Icons */}
            {ICONS.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0.02, 0.05, 0.02],
                        y: [0, -15, 0],
                    }}
                    transition={{ 
                        duration: 20 + Math.random() * 10, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                    className="absolute text-white/10"
                    style={{ left: item.x, top: item.y }}
                >
                    <item.Icon className="w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={0.3} />
                </motion.div>
            ))}
        </div>
    );
}
