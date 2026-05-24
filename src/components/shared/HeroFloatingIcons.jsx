'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bot, Instagram, Facebook, Linkedin, Twitter, Cpu, Code, 
    Globe, Zap, Sparkles, Command, Hash, Database, MessageCircle, 
    ShieldCheck 
} from 'lucide-react';

const icons = [
    { Icon: Bot, x: "15%", y: "20%", delay: 0 },
    { Icon: Instagram, x: "35%", y: "15%", delay: 2 },
    { Icon: Linkedin, x: "75%", y: "15%", delay: 1 },
    { Icon: ShieldCheck, x: "85%", y: "45%", delay: 3 },
    { Icon: Globe, x: "10%", y: "60%", delay: 5 },
    { Icon: MessageCircle, x: "50%", y: "75%", delay: 2.5 },
    { Icon: Sparkles, x: "70%", y: "80%", delay: 4 },
    { Icon: Database, x: "30%", y: "85%", delay: 1.5 },
];

export default function HeroFloatingIcons({ opacity = 0.5 }) {
    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ 
                opacity: opacity,
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)'
            }}
        >
            {icons.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: 1,
                        y: [0, -40, 0],
                        rotateX: [0, 20, -20, 0],
                        rotateY: [0, 30, -30, 0],
                        rotateZ: [0, 10, -10, 0]
                    }}
                    transition={{ 
                        duration: 15 + Math.random() * 10, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                    className="absolute text-white"
                    style={{ left: item.x, top: item.y }}
                >
                    <item.Icon className="w-24 h-24 md:w-32 md:h-32 opacity-100" strokeWidth={0.5} />
                </motion.div>
            ))}
        </div>
    );
}
