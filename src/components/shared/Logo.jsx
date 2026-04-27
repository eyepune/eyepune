import React from 'react';

export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
    const sizes = {
        xs: { container: 'w-8 h-8', text: 'hidden' },
        sm: { container: 'w-10 h-10', text: 'text-xl' },
        md: { container: 'w-14 h-14', text: 'text-2xl' },
        lg: { container: 'w-24 h-24', text: 'text-5xl' }
    };

    const s = sizes[size];
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${s.container} flex items-center justify-center transition-all hover:rotate-3 duration-500`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer Frame - Sleek Almond */}
                    <path 
                        d="M5 50 C20 20 80 20 95 50 C80 80 20 80 5 50 Z" 
                        stroke="#ef4444" 
                        strokeWidth="4" 
                        strokeLinejoin="round"
                    />
                    
                    {/* Inner Iris - Glowing Gradient Look */}
                    <circle cx="50" cy="50" r="22" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* The Pupil - Solid Center */}
                    <circle cx="50" cy="50" r="12" fill="#ef4444" />
                    
                    {/* Highlight / Sparkle */}
                    <circle cx="44" cy="44" r="3" fill="white" fillOpacity="0.8" />

                    {/* Cyber Accents */}
                    <path d="M15 50 L5 50" stroke="#ef4444" strokeWidth="2" />
                    <path d="M95 50 L85 50" stroke="#ef4444" strokeWidth="2" />
                </svg>
            </div>
            <span className={`${s.text} font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                EyE<span className="text-red-500">PunE</span>
            </span>
        </div>
    );
}