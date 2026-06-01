"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Shield, Settings, Compass, X } from 'lucide-react';

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Lex Pro Enterprise",
            content: "You now have access to the ultimate legal infrastructure. Let's take a quick 3-step tour of your new tools.",
            icon: Shield,
            color: "text-blue-400"
        },
        {
            title: "1. AI Smart Redlining",
            content: "Upload contracts in the Analyze tab. Our AI will automatically flag risks and instantly generate track-changes redline responses and emails for counter-parties.",
            icon: Compass,
            color: "text-orange-400"
        },
        {
            title: "2. Multi-Party Routing",
            content: "Draft agreements and trigger sequential routing. Party A gets notified to sign securely, then Party B. We handle the entire audit trail automatically.",
            icon: CheckCircle2,
            color: "text-green-400"
        },
        {
            title: "3. Developer APIs & Webhooks",
            content: "Head to Settings to generate API keys. Integrate Lex Pro directly into your enterprise ERP to trigger contract generation on autopilot.",
            icon: Settings,
            color: "text-purple-400"
        }
    ];

    useEffect(() => {
        // Only run on client
        const hasCompleted = localStorage.getItem('lex_pro_tour_completed');
        if (!hasCompleted) {
            // Delay start to let UI load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const completeTour = () => {
        localStorage.setItem('lex_pro_tour_completed', 'true');
        setIsVisible(false);
    };

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            completeTour();
        }
    };

    if (!isVisible) return null;

    const CurrentIcon = steps[step].icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={completeTour}
                />
                
                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Top Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-orange-500 to-green-500" />
                    
                    <button 
                        onClick={completeTour}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <motion.div 
                                key={step} // Force re-animation on step change
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center"
                            >
                                <CurrentIcon className={`w-10 h-10 ${steps[step].color}`} />
                            </motion.div>
                        </div>
                        
                        <div className="text-center space-y-3 mb-8 min-h-[100px]">
                            <motion.h2 
                                key={`title-${step}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-bold text-white"
                            >
                                {steps[step].title}
                            </motion.h2>
                            <motion.p 
                                key={`content-${step}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-400 leading-relaxed"
                            >
                                {steps[step].content}
                            </motion.p>
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Step Indicators */}
                            <div className="flex gap-2">
                                {steps.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === step ? 'bg-white w-4' : 'bg-white/20'}`} 
                                    />
                                ))}
                            </div>
                            
                            <Button 
                                onClick={nextStep}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                {step < steps.length - 1 ? (
                                    <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                                ) : (
                                    <>Enter Workspace</>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
