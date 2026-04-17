import React from 'react';

export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
    const sizes = {
        sm: { container: 'w-10 h-10', text: 'text-lg' },
        md: { container: 'w-14 h-14', text: 'text-2xl' },
        lg: { container: 'w-20 h-20', text: 'text-3xl' }
    };

    const s = sizes[size];
    const isDark = variant === 'dark';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${s.container} rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]`}>
                <svg viewBox="0 0 40 40" className="w-[65%] h-[65%]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="2.5" fill="none" />
                    <circle cx="20" cy="20" r="5" fill="white" />
                    <circle cx="20" cy="20" r="2" fill="#ef4444" />
                </svg>
            </div>
            <span className={`${s.text} font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                EyE<span className="text-red-500">PunE</span>
            </span>
        </div>
    );
}