'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PremiumEffects() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        
        const handleMouseOver = (e) => {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.magnetic')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Cinematic Film Grain */}
            <div 
                className="fixed inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Custom Cursor - Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-3 h-3 bg-red-600 rounded-full pointer-events-none z-[100] hidden md:block"
                animate={{
                    x: mousePosition.x - 6,
                    y: mousePosition.y - 6,
                    scale: isHovering ? 0 : 1,
                    opacity: isHovering ? 0 : 1
                }}
                transition={{ type: 'spring', stiffness: 1000, damping: 28, mass: 0.1 }}
            />
            
            {/* Custom Cursor - Outer Magnetic Ring */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 border border-red-500/40 rounded-full pointer-events-none z-[99] hidden md:block backdrop-invert-[0.1]"
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(193, 18, 31, 0.1)' : 'transparent',
                    borderColor: isHovering ? 'rgba(193, 18, 31, 0.8)' : 'rgba(239, 68, 68, 0.4)'
                }}
                transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.5 }}
            />
        </>
    );
}
