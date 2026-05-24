import React from 'react';

export default function Logo({ variant = 'dark', size = 'md', className = '', showTagline = false }) {
    const sizes = {
        xs: { container: 'w-8 h-8', text: 'hidden', tagline: 'hidden' },
        sm: { container: 'w-10 h-10', text: 'text-xl', tagline: 'text-[8px] sm:text-[9px]' },
        md: { container: 'w-14 h-14', text: 'text-2xl', tagline: 'text-[10px]' },
        lg: { container: 'w-24 h-24', text: 'text-5xl', tagline: 'text-xs' }
    };

    const s = sizes[size];
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${s.container} flex items-center justify-center transition-all hover:rotate-3 duration-500`}>
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="#DC143C" strokeWidth="6" strokeLinecap="round">
                        <line x1="15" y1="47" x2="5" y2="36" />
                        <line x1="27" y1="40" x2="18" y2="28" />
                        <line x1="38" y1="36" x2="33" y2="22" />
                        <line x1="50" y1="35" x2="50" y2="20" />
                        <line x1="62" y1="36" x2="67" y2="22" />
                        <line x1="73" y1="40" x2="82" y2="28" />
                        <line x1="85" y1="47" x2="95" y2="36" />
                    </g>
                    <path d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z" stroke="#DC143C" strokeWidth="6" strokeLinejoin="round" />
                    <circle cx="50" cy="55" r="14" stroke="#DC143C" strokeWidth="5" />
                    <circle cx="50" cy="55" r="6" fill="#DC143C" />
                </svg>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className={`${s.text} font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'} leading-none`}>
                    EyE<span className="text-[#DC143C]">PunE</span>
                </span>
                {showTagline && (
                    <span className={`${s.tagline} tracking-[0.2em] uppercase text-red-500 font-bold mt-1.5 ml-[0.2em] text-center whitespace-nowrap`}>
                        Connect · Engage · Grow
                    </span>
                )}
            </div>
        </div>
    );
}