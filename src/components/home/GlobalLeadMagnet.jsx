import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalLeadMagnet() {
    return (
        <section className="py-24 relative overflow-hidden px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="rounded-[2.5rem] bg-gradient-to-r from-red-950/40 to-black border border-red-500/10 hover:border-red-500/30 p-8 md:p-16 relative overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.05)] group transition-all duration-700 backdrop-blur-sm"
                >
                    {/* Parallax glow background */}
                    <div className="absolute -right-40 -top-40 w-96 h-96 bg-red-600/15 blur-[120px] rounded-full pointer-events-none group-hover:bg-red-500/25 group-hover:scale-110 transition-all duration-1000" />
                    <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all duration-1000" />
                    
                    {/* Subtle noise overlay */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-3/5 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-6 uppercase tracking-[0.2em]">
                                <Zap className="w-3 h-3" /> Free Global AI Audit
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Stop Guessing. <br className="hidden md:block"/> Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Scaling.</span>
                            </h2>
                            
                            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto md:mx-0">
                                Claim your free custom AI & Growth Audit. We'll analyze your current marketing stack and show you exactly how to automate your workflows and 5x your ROI.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8">
                                <Link href="/AI-Assessment">
                                    <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-10 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all">
                                        Claim Your Free Audit
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-red-500" /> No commitment required
                                </div>
                                <div className="hidden sm:block text-gray-700">•</div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-red-500" /> 100% Custom Blueprint
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:w-2/5 flex justify-center">
                            <div className="relative w-full max-w-[280px] aspect-[4/5] bg-[#050505] border border-white/5 rounded-2xl p-8 shadow-2xl overflow-hidden flex flex-col justify-between group-hover:-translate-y-2 group-hover:border-red-500/20 transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                                <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-red-500 to-orange-500" />
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                                        <Zap className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Growth Audit</h3>
                                    <p className="text-sm text-gray-400 font-medium">Personalized strategy document.</p>
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500/40 rounded-full" style={{ width: `${Math.random() * 40 + 40}%` }} />
                                        </div>
                                    ))}
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">EyE PunE Labs</div>
                                        <div className="w-4 h-4 rounded-full border border-red-500/50 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
