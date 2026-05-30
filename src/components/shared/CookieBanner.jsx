'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Slight delay so it doesn't pop up instantly and ruin CLS
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none flex justify-center"
                >
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-w-4xl w-full pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-white font-bold mb-2">Cookies & Privacy</h3>
                            <p className="text-gray-400 text-sm">
                                We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking accept, you agree to this, as outlined in our{' '}
                                <Link href="/Privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>.
                            </p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Button 
                                variant="outline" 
                                className="bg-transparent text-white border-white/20 hover:bg-white/10"
                                onClick={acceptCookies}
                            >
                                Essential Only
                            </Button>
                            <Button 
                                className="bg-white text-black hover:bg-gray-200"
                                onClick={acceptCookies}
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
