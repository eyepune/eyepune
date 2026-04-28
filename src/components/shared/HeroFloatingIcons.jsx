'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Instagram, Facebook, Linkedin, Twitter, Cpu, Code, 
    Globe, Zap, Sparkles, Command, Hash, Database, MessageCircle, 
    ShieldCheck 
} from 'lucide-react';

const icons = [
    { Icon: Bot, x: "15%", y: "15%", delay: 0 },
    { Icon: Instagram, x: "35%", y: "10%", delay: 2 },
    { Icon: Facebook, x: "55%", y: "15%", delay: 4 },
    { Icon: Linkedin, x: "75%", y: "10%", delay: 1 },
    { Icon: Twitter, x: "92%", y: "15%", delay: 3 },
    { Icon: Cpu, x: "10%", y: "45%", delay: 5 },
    { Icon: Code, x: "30%", y: "40%", delay: 2.5 },
    { Icon: Globe, x: "50%", y: "45%", delay: 1.5 },
    { Icon: Zap, x: "70%", y: "30%", delay: 0.5 },
    { Icon: Sparkles, x: "65%", y: "55%", delay: 4 },
    { Icon: Command, x: "35%", y: "70%", delay: 1.5 },
    { Icon: Hash, x: "55%", y: "75%", delay: 2 },
    { Icon: Database, x: "15%", y: "85%", delay: 5 },
    { Icon: MessageCircle, x: "5%", y: "65%", delay: 3 },
    { Icon: ShieldCheck, x: "85%", y: "25%", delay: 1.2 },
];

export default function HeroFloatingIcons({ opacity = 0.25 }) {
    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ 
                opacity: 0.25,
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)'
            }}
        >
            {icons.map((item, i) => (
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
                    <item.Icon className="w-12 h-12 md:w-20 md:h-20" strokeWidth={0.3} />
                </motion.div>
            ))}
        </div>
    );
}
