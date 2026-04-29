'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 250 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = 
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('a') || 
                target.closest('button') ||
                target.classList.contains('cursor-pointer');
            
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
            {/* The Eye Logo Cursor */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -25,
                    top: -25,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    rotate: isHovering ? 5 : 0,
                }}
                className="absolute w-[50px] h-[50px] flex items-center justify-center"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    {/* Eyelashes/Rays */}
                    <motion.g 
                        stroke="#ef4444" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        animate={{ opacity: isHovering ? 1 : 0.6 }}
                    >
                        <line x1="15" y1="47" x2="5" y2="36" />
                        <line x1="27" y1="40" x2="18" y2="28" />
                        <line x1="38" y1="36" x2="33" y2="22" />
                        <line x1="50" y1="35" x2="50" y2="20" />
                        <line x1="62" y1="36" x2="67" y2="22" />
                        <line x1="73" y1="40" x2="82" y2="28" />
                        <line x1="85" y1="47" x2="95" y2="36" />
                    </motion.g>
                    {/* Eye Shape */}
                    <motion.path 
                        d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z" 
                        stroke="#ef4444" 
                        strokeWidth="6" 
                        strokeLinejoin="round" 
                        fill="rgba(5, 5, 5, 0.4)"
                    />
                    {/* Iris */}
                    <motion.circle 
                        cx="50" cy="55" r="14" 
                        stroke="#ef4444" 
                        strokeWidth="5"
                        animate={{ r: isHovering ? 16 : 14 }}
                    />
                    {/* Pupil */}
                    <motion.circle 
                        cx="50" cy="55" r="6" 
                        fill="#ef4444"
                        animate={{ scale: isHovering ? 1.3 : 1 }}
                    />
                </svg>
            </motion.div>
            
            {/* Glowing Aura Follower */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -40,
                    top: -40,
                }}
                animate={{
                    opacity: isHovering ? 0.4 : 0.15,
                    scale: isHovering ? 1.4 : 1,
                }}
                className="absolute w-20 h-20 bg-red-600/20 rounded-full blur-2xl pointer-events-none"
            />
        </div>
    );
}
