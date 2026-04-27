import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";

function Grid3D() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId, t = 0;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width, h = canvas.height;
            const cols = 12, rows = 8;
            const cellW = w / cols, cellH = h / rows;

            for (let r = 0; r <= rows; r++) {
                for (let c = 0; c <= cols; c++) {
                    const wave = Math.sin(t + c * 0.4 + r * 0.3) * 12;
                    const x = c * cellW;
                    const y = r * cellH + wave;
                    const alpha = 0.04 + Math.abs(Math.sin(t * 0.5 + c + r)) * 0.06;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(239,68,68,${alpha})`;
                    ctx.fill();
                }
            }

            // Horizontal wave lines
            for (let r = 0; r <= rows; r++) {
                ctx.beginPath();
                for (let c = 0; c <= cols; c++) {
                    const wave = Math.sin(t + c * 0.4 + r * 0.3) * 12;
                    const x = c * cellW;
                    const y = r * cellH + wave;
                    c === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(239,68,68,0.04)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            t += 0.02;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function CTASection() {
    return (
        <section className="py-32 relative overflow-hidden bg-[#040404]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-[#040404] to-[#040404]" />
            <Grid3D />

            {/* Center glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[500px] rounded-full opacity-[0.12]"
                    style={{ background: 'radial-gradient(ellipse, #ef4444 0%, transparent 70%)' }}
                />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {/* Top pill */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 mb-10">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 text-sm font-medium">Ready to Scale?</span>
                    </div>

                    <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                        Let's Build
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-400">
                            Something Big.
                        </span>
                    </h2>

                    <p className="text-xl text-gray-400 mb-14 max-w-2xl mx-auto leading-relaxed">
                        Get your free AI-powered business assessment — a personalised growth roadmap in under 5 minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg mx-auto sm:max-w-none">
                        <Link href={createPageUrl("AI_Assessment")}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full font-black shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_70px_rgba(255,255,255,0.3)] transition-all">
                                    <Bot className="w-5 h-5 mr-2" />
                                    Start Free Assessment
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.div>
                        </Link>
                        <a href="https://wa.me/919284712033" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-white/25 w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full backdrop-blur-sm">
                                    <Phone className="w-5 h-5 mr-2" />
                                    WhatsApp Us
                                </Button>
                            </motion.div>
                        </a>
                    </div>

                    {/* Trust row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-6 mt-14 text-sm text-gray-600"
                    >
                        {['No commitment required', 'Results in 5 minutes', 'Used by 100+ businesses', 'Based in Pune, India'].map((t, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-500" />
                                {t}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}