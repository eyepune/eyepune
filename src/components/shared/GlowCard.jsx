import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', glowColor = 'rgba(239,68,68,0.2)' }) {
    const cardRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`relative overflow-hidden ${className} border border-white/10 transition-all duration-700 hover:border-red-500/40 group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl shadow-2xl rounded-3xl`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            {hovered && (
                <div
                    className="pointer-events-none absolute z-0 rounded-full transition-opacity duration-500 opacity-100"
                    style={{
                        width: 400,
                        height: 400,
                        left: pos.x - 200,
                        top: pos.y - 200,
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        mixBlendMode: 'screen'
                    }}
                />
            )}
            {/* Subtle top glare effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}