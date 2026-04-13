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
            <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/0566ff2d5_Free_Sample_By_Wix_edited-removebg-preview.png" 
                alt="EyE PunE Logo" 
                className={`${s.container} object-contain`}
                style={{ objectPosition: 'center' }}
            />
            <span className={`${s.text} font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                EyE<span className="text-red-500">PunE</span>
            </span>
        </div>
    );
}