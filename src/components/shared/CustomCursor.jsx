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
            {/* Outer Ring */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -16,
                    top: -16,
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    borderColor: isHovering ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)',
                    backgroundColor: isHovering ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0)',
                }}
                className="absolute w-8 h-8 rounded-full border border-red-500/30 transition-colors duration-300"
            />
            
            {/* Inner Dot */}
            <motion.div
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    left: -2,
                    top: -2,
                }}
                animate={{
                    scale: isHovering ? 0 : 1,
                }}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
            />

            {/* Glowing Aura */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -40,
                    top: -40,
                }}
                animate={{
                    opacity: isHovering ? 0.15 : 0,
                    scale: isHovering ? 1.5 : 0.8,
                }}
                className="absolute w-20 h-20 bg-red-500 rounded-full blur-2xl transition-opacity duration-500"
            />
        </div>
    );
}
