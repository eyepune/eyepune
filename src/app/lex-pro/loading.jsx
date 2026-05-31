import React from 'react';

export default function LexProLoading() {
    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                </div>
            </div>
            <p className="mt-6 text-orange-400/80 font-medium animate-pulse tracking-wide text-sm">
                Loading Lex Pro OS...
            </p>
        </div>
    );
}
