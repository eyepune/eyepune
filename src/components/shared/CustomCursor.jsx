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
            {/* The Eye Shape (Outer) */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -20,
                    top: -12,
                }}
                animate={{
                    scale: isHovering ? 1.2 : 1,
                    borderColor: isHovering ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.4)',
                    backgroundColor: isHovering ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)',
                    rotateX: isHovering ? 0 : 20,
                }}
                className="absolute w-10 h-6 rounded-[100%] border-2 border-red-500/40 backdrop-blur-[2px] transition-colors duration-300 flex items-center justify-center overflow-hidden"
            >
                {/* Iris/Pupil Container */}
                <motion.div 
                    animate={{
                        scale: isHovering ? 1.5 : 1,
                    }}
                    className="w-4 h-4 rounded-full border border-red-500/30 flex items-center justify-center"
                >
                    {/* Pupil */}
                    <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                </motion.div>
                
                {/* Scanning line */}
                <motion.div 
                    animate={{
                        y: [-10, 10, -10],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-full h-[1px] bg-red-400/30"
                />
            </motion.div>
            
            {/* Glowing Aura */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -30,
                    top: -30,
                }}
                animate={{
                    opacity: isHovering ? 0.3 : 0.1,
                    scale: isHovering ? 1.2 : 0.8,
                }}
                className="absolute w-15 h-15 bg-red-600/20 rounded-full blur-xl pointer-events-none"
            />
        </div>
    );
}
