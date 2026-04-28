'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Cpu, Code, Globe, Zap, MessageCircle, 
    Facebook, Instagram, Linkedin, Twitter, 
    Hash, Database, Sparkles, Command
} from 'lucide-react';

const ICONS = [
    { Icon: Bot, x: "2%", y: "15%", delay: 0 },
    { Icon: Instagram, x: "94%", y: "20%", delay: 2 },
    { Icon: Facebook, x: "96%", y: "75%", delay: 4 },
    { Icon: Linkedin, x: "4%", y: "80%", delay: 1 },
    { Icon: Twitter, x: "92%", y: "45%", delay: 3 },
    { Icon: Cpu, x: "3%", y: "40%", delay: 5 },
    { Icon: Code, x: "95%", y: "10%", delay: 2.5 },
    { Icon: Globe, x: "5%", y: "60%", delay: 1.5 },
    { Icon: Zap, x: "93%", y: "90%", delay: 0.5 },
    { Icon: MessageCircle, x: "1%", y: "95%", delay: 3.5 },
    { Icon: Sparkles, x: "98%", y: "30%", delay: 2.8 },
    { Icon: Command, x: "2%", y: "5%", delay: 0.8 },
];

export default function FloatingBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-600/[0.02] rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-orange-600/[0.02] rounded-full blur-[150px]" />

            {/* Icons */}
            {ICONS.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0.03, 0.08, 0.03],
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                        duration: 15 + Math.random() * 10, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                    className="absolute text-white/20"
                    style={{ left: item.x, top: item.y }}
                >
                    <item.Icon className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={0.4} />
                </motion.div>
            ))}
        </div>
    );
}
