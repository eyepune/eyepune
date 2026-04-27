import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function ExitIntentPopup() {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Only show once per session
        if (sessionStorage.getItem('exit_popup_shown')) return;

        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !dismissed) {
                setShow(true);
                sessionStorage.setItem('exit_popup_shown', '1');
            }
        };

        // Also show after 45 seconds of inactivity on mobile
        const timer = setTimeout(() => {
            if (!dismissed && !sessionStorage.getItem('exit_popup_shown')) {
                setShow(true);
                sessionStorage.setItem('exit_popup_shown', '1');
            }
        }, 45000);

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [dismissed]);

    const handleDismiss = () => {
        setShow(false);
        setDismissed(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        await base44.entities.Inquiry.create({
            email,
            name: 'Exit Intent Lead',
            message: 'Requested free audit via exit popup',
            service_interest: 'custom',
            status: 'new'
        });
        setSubmitted(true);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={handleDismiss}
                >
                    <motion.div
                        initial={{ scale: 0.85, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.85, y: 30, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }}
                        />

                        <button onClick={handleDismiss} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>

                        {!submitted ? (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2">Wait — Get a Free Audit!</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Before you go, let us analyse your business's digital presence for <span className="text-white font-semibold">FREE</span>. No commitment, just actionable insights.
                                </p>

                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-6 space-y-2">
                                    {['Social media audit', 'Website SEO score', 'Lead generation gaps', 'Competitor analysis'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
                                    />
                                    <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl py-5 font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                        Get My Free Audit <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </form>

                                <div className="mt-4 text-center">
                                    <Link href={createPageUrl("AI_Assessment")} onClick={handleDismiss} className="text-red-400 hover:text-red-300 text-xs underline">
                                        Or take our full AI Assessment →
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-2xl font-black text-white mb-2">You're all set!</h2>
                                <p className="text-gray-400 text-sm mb-6">We'll send your free audit within 24 hours. Keep an eye on your inbox!</p>
                                <Button onClick={handleDismiss} className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl px-8">
                                    Close
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}