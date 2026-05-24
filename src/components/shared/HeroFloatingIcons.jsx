'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
    Bot, Instagram, Facebook, Linkedin, Twitter, Cpu, Code, 
    Globe, Zap, Sparkles, Command, Hash, Database, MessageCircle, 
    ShieldCheck 
} from 'lucide-react';

const icons = [
    // Left side (strictly edge)
    { Icon: Bot, x: "5%", y: "20%", delay: 0 },
    { Icon: Database, x: "10%", y: "55%", delay: 2 },
    { Icon: Globe, x: "8%", y: "85%", delay: 4 },
    
    // Right side (strictly edge)
    { Icon: Linkedin, x: "85%", y: "15%", delay: 1 },
    { Icon: ShieldCheck, x: "90%", y: "50%", delay: 3 },
    { Icon: Instagram, x: "82%", y: "80%", delay: 1.5 },
];

export default function HeroFloatingIcons({ opacity = 0.5 }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 50, stiffness: 100, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ 
                opacity: opacity,
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
            }}
        >
            {icons.map((item, i) => {
                const depth = (i % 3 + 1) * 35; 
                const xOffset = useTransform(smoothX, [-1, 1], [-depth, depth]);
                const yOffset = useTransform(smoothY, [-1, 1], [-depth, depth]);

                return (
                    <motion.div
                        key={i}
                        className="absolute text-white"
                        style={{ 
                            left: item.x, 
                            top: item.y,
                            x: xOffset,
                            y: yOffset
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ 
                                opacity: 1, 
                                y: [0, -30, 0],
                                rotate: [0, 15, -15, 0]
                            }}
                            transition={{ 
                                opacity: { duration: 2, delay: item.delay * 0.2 },
                                y: { duration: 12 + Math.random() * 8, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                                rotate: { duration: 15 + Math.random() * 10, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                            }}
                        >
                            <item.Icon className="w-12 h-12 md:w-24 md:h-24 opacity-100" strokeWidth={0.2} />
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
}
