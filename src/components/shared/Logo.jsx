import React from 'react';

export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
    const sizes = {
        xs: { container: 'w-8 h-8', text: 'hidden' },
        sm: { container: 'w-10 h-10', text: 'text-xl' },
        md: { container: 'w-14 h-14', text: 'text-2xl' },
        lg: { container: 'w-24 h-24', text: 'text-4xl' }
    };

    const s = sizes[size];
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${s.container} flex items-center justify-center transition-transform hover:scale-110 duration-300`}>
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* The almond shape of the eye */}
                    <path 
                        d="M10 50 Q50 5 90 50 Q50 95 10 50 Z" 
                        stroke="#ef4444" 
                        strokeWidth="5" 
                        fill="none" 
                    />
                    
                    {/* The Iris (Outer Circle) */}
                    <circle cx="50" cy="50" r="16" stroke="#ef4444" strokeWidth="5" fill="none" />
                    
                    {/* The Pupil (Inner Circle) */}
                    <circle cx="50" cy="50" r="8" fill="#ef4444" />
                    
                    {/* Eyelashes - Top Fan */}
                    <g stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
                        <line x1="50" y1="5" x2="50" y2="20" /> {/* Center */}
                        <line x1="30" y1="10" x2="35" y2="24" /> {/* Left 1 */}
                        <line x1="15" y1="25" x2="25" y2="34" /> {/* Left 2 */}
                        <line x1="70" y1="10" x2="65" y2="24" /> {/* Right 1 */}
                        <line x1="85" y1="25" x2="75" y2="34" /> {/* Right 2 */}
                    </g>
                </svg>
            </div>
            <span className={`${s.text} font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                EyE<span className="text-red-500">PunE</span>
            </span>
        </div>
    );
}