import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', glowColor = 'rgba(239,68,68,0.3)' }) {
    const cardRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);

    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`relative overflow-hidden ${className} border border-white/5 transition-all duration-500 hover:border-red-500/30 group bg-white/[0.02] backdrop-blur-md`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {hovered && (
                <div
                    className="pointer-events-none absolute z-0 rounded-full transition-opacity duration-300"
                    style={{
                        width: 300,
                        height: 300,
                        left: pos.x - 150,
                        top: pos.y - 150,
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    }}
                />
            )}
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}