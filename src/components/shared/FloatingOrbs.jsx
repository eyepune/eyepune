import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
                    top: '-10%',
                    right: '-10%',
                }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
                    bottom: '-5%',
                    left: '-5%',
                }}
                animate={{ scale: [1.2, 1, 1.2], rotate: [0, -30, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)',
                    top: '40%',
                    left: '30%',
                }}
                animate={{ scale: [1, 1.3, 1], y: [-20, 20, -20] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
        </div>
    );
}