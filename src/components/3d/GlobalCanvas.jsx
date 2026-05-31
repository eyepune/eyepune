'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Instagram, Facebook, Linkedin, Twitter, Youtube, 
    MonitorSmartphone, Brain, Rocket, Bot, Code, Zap,
    Cpu, Database, Command, ShieldCheck, Network, Binary
} from 'lucide-react';

const ICONS = [
    { Icon: Instagram, x: "5%", y: "15%", delay: 0 },
    { Icon: Facebook, x: "25%", y: "10%", delay: 2 },
    { Icon: Linkedin, x: "45%", y: "25%", delay: 4 },
    { Icon: Twitter, x: "65%", y: "15%", delay: 1 },
    { Icon: Youtube, x: "85%", y: "10%", delay: 3 },
    
    { Icon: MonitorSmartphone, x: "15%", y: "45%", delay: 5 },
    { Icon: Brain, x: "35%", y: "35%", delay: 2.5 },
    { Icon: Rocket, x: "55%", y: "50%", delay: 1.5 },
    { Icon: Bot, x: "75%", y: "40%", delay: 0.5 },
    { Icon: Code, x: "90%", y: "55%", delay: 4 },
    
    { Icon: Zap, x: "10%", y: "75%", delay: 1.5 },
    { Icon: Cpu, x: "30%", y: "85%", delay: 2 },
    { Icon: Database, x: "50%", y: "70%", delay: 5 },
    { Icon: Command, x: "70%", y: "80%", delay: 3 },
    { Icon: ShieldCheck, x: "88%", y: "90%", delay: 1.2 },
    
    { Icon: Network, x: "20%", y: "90%", delay: 2.8 },
    { Icon: Binary, x: "80%", y: "25%", delay: 3.5 }
];

export default function GlobalCanvas() {
    const [isVisible, setIsVisible] = useState(false);

    // Globally hide red icons in the Hero section of EVERY page. 
    // Only fade them in when the user scrolls down.
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 pointer-events-none z-[-100] overflow-hidden"
                >
                    {ICONS.map((item, i) => {
                        // Generate a deterministic pseudo-random depth factor based on index
                        const depth = 1 + (i % 3) * 0.5; // 1.0, 1.5, 2.0
                        const scale = 1 / depth; 
                        const blur = depth > 1.5 ? 'blur(4px)' : depth > 1.0 ? 'blur(2px)' : 'none';
                        const opacityBase = depth > 1.5 ? 0.2 : depth > 1.0 ? 0.35 : 0.6;
                        
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ 
                                    opacity: opacityBase,
                                    y: [0, -40 / depth, 0],
                                    rotate: [0, 15 / depth, -15 / depth, 0]
                                }}
                                transition={{ 
                                    duration: (12 + (i % 5) * 2) * depth, 
                                    repeat: Infinity, 
                                    ease: "easeInOut",
                                    delay: item.delay
                                }}
                                className="absolute text-red-600"
                                style={{ 
                                    left: item.x, 
                                    top: item.y,
                                    filter: blur,
                                    transform: `scale(${scale})`
                                }}
                            >
                                <item.Icon className="w-12 h-12 md:w-24 md:h-24 opacity-100" strokeWidth={0.2} />
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
