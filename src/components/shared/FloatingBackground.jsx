'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Globe, Zap, MessageCircle, 
    Facebook, Instagram, Linkedin, Twitter, 
    Hash, Database, Sparkles, Command
} from 'lucide-react';

const ICONS = [
    { Icon: Bot, x: "5%", y: "10%", delay: 0 },
    { Icon: Instagram, x: "85%", y: "15%", delay: 2 },
    { Icon: Facebook, x: "75%", y: "70%", delay: 4 },
    { Icon: Linkedin, x: "15%", y: "75%", delay: 1 },
    { Icon: Twitter, x: "90%", y: "40%", delay: 3 },
    { Icon: Cpu, x: "40%", y: "85%", delay: 5 },
    { Icon: Code, x: "10%", y: "50%", delay: 2.5 },
    { Icon: Globe, x: "80%", y: "60%", delay: 1.5 },
    { Icon: Zap, x: "30%", y: "20%", delay: 0.5 },
    { Icon: MessageCircle, x: "60%", y: "10%", delay: 3.5 },
    { Icon: Hash, x: "50%", y: "90%", delay: 4.5 },
    { Icon: Database, x: "20%", y: "35%", delay: 1.2 },
    { Icon: Sparkles, x: "70%", y: "30%", delay: 2.8 },
    { Icon: Command, x: "45%", y: "55%", delay: 0.8 },
];

export default function FloatingBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.15]">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-600/[0.03] rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-orange-600/[0.03] rounded-full blur-[150px]" />

            {/* Icons */}
            {ICONS.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        y: [0, -30, 0],
                        rotate: [0, 15, -15, 0]
                    }}
                    transition={{ 
                        duration: 12 + Math.random() * 8, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                    className="absolute text-white"
                    style={{ left: item.x, top: item.y }}
                >
                    <item.Icon className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" strokeWidth={0.5} />
                </motion.div>
            ))}
        </div>
    );
}
