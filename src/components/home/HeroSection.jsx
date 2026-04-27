import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Bot, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from "@/utils";

const WORDS = ['Connect', 'Engage', 'Grow'];

function TypewriterWords() {
    const [index, setIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [phase, setPhase] = useState('typing'); // typing | pause | erasing

    useEffect(() => {
        const word = WORDS[index];
        let timeout;

        if (phase === 'typing') {
            if (displayed.length < word.length) {
                timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
            } else {
                timeout = setTimeout(() => setPhase('pause'), 1400);
            }
        } else if (phase === 'pause') {
            timeout = setTimeout(() => setPhase('erasing'), 400);
        } else if (phase === 'erasing') {
            if (displayed.length > 0) {
                timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
            } else {
                setIndex((i) => (i + 1) % WORDS.length);
                setPhase('typing');
            }
        }

        return () => clearTimeout(timeout);
    }, [displayed, phase, index]);

    const colors = { Connect: '#ef4444', Engage: '#f97316', Grow: '#ef4444' };

    return (
        <span style={{ color: colors[WORDS[index]] }} className="relative inline-block min-w-[200px]">
            {displayed}
            <span className="animate-pulse ml-0.5 inline-block w-0.5 h-[0.85em] bg-current align-middle" />
        </span>
    );
}

// High-Fidelity Cyber-Eye Animation
function EyeCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let t = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            
            const cx = w / 2;
            const cy = h / 2;
            const scale = Math.min(w, h) / 120; // Scale based on 100x100 logo coord system

            // 1. Background Pulse Glow
            const glowSize = 40 * scale;
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize * 1.5);
            bgGrad.addColorStop(0, 'rgba(239,68,68,0.15)');
            bgGrad.addColorStop(1, 'rgba(239,68,68,0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. High-Tech Iris (Internal Animation)
            const irisR = 14 * scale;
            const pupilR = 6 * scale + Math.sin(t * 3) * 1;
            
            // Iris Base
            ctx.beginPath();
            ctx.arc(cx, cy + 5 * scale, irisR, 0, Math.PI * 2);
            const irisGrad = ctx.createRadialGradient(cx, cy + 5 * scale, 0, cx, cy + 5 * scale, irisR);
            irisGrad.addColorStop(0, '#000');
            irisGrad.addColorStop(0.5, '#ef4444');
            irisGrad.addColorStop(1, '#000');
            ctx.fillStyle = irisGrad;
            ctx.fill();

            // Neural Fibers
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 40; i++) {
                const angle = (i / 40) * Math.PI * 2 + t * 0.2;
                const len = irisR * (0.6 + Math.random() * 0.4);
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * pupilR, cy + 5 * scale + Math.sin(angle) * pupilR);
                ctx.lineTo(cx + Math.cos(angle) * len, cy + 5 * scale + Math.sin(angle) * len);
                ctx.strokeStyle = `rgba(239,68,68,${0.3 + Math.random() * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Scanning Ring
            ctx.beginPath();
            ctx.arc(cx, cy + 5 * scale, irisR * 1.2, t, t + 1);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pupil
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(cx, cy + 5 * scale, pupilR, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();

            // 3. Authentic Logo Frame (7 Eyelashes + Almond)
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4 * scale;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Eyelashes
            const lashes = [
                [15, 47, 5, 36], [27, 40, 18, 28], [38, 36, 33, 22],
                [50, 35, 50, 20],
                [62, 36, 67, 22], [73, 40, 82, 28], [85, 47, 95, 36]
            ];
            lashes.forEach(([x1, y1, x2, y2]) => {
                ctx.beginPath();
                ctx.moveTo(cx + (x1 - 50) * scale, cy + (y1 - 50) * scale);
                ctx.lineTo(cx + (x2 - 50) * scale, cy + (y2 - 50) * scale);
                ctx.stroke();
            });

            // Almond Outline
            ctx.beginPath();
            ctx.moveTo(cx - 45 * scale, cy + 5 * scale);
            ctx.quadraticCurveTo(cx, cy - 35 * scale, cx + 45 * scale, cy + 5 * scale);
            ctx.quadraticCurveTo(cx, cy + 45 * scale, cx - 45 * scale, cy + 5 * scale);
            ctx.stroke();

            // 4. Tech Glints
            ctx.beginPath();
            ctx.arc(cx - irisR * 0.3, cy + 5 * scale - irisR * 0.3, 2 * scale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();

            t += 0.02;
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-90" />;
}

export default function HeroSection() {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 600], [0, 80]);
    const opacity = useTransform(scrollY, [0, 600], [1, 0]);

    return (
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#040404]">
            {/* Eye animation */}
            <EyeCanvas />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
            />

            {/* Red glow center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] md:w-[700px] md:h-[700px] rounded-full opacity-[0.07]"
                    style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
                />
            </div>

            <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
                {/* Pill badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10 border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/5 backdrop-blur-sm"
                >
                    <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tracking-wide">
                        Pune's #1 All-in-One Growth Partner
                    </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 }}
                    className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.95] tracking-tight"
                >
                    <span className="block text-white">We Help</span>
                    <span className="block text-white">Businesses</span>
                    <span className="block mt-2">
                        <TypewriterWords />
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    EyE PunE is your all-in-one growth partner — combining <span className="text-white font-medium">sales strategy</span>, <span className="text-white font-medium">marketing automation</span>, and <span className="text-white font-medium">AI technology</span> to scale ambitious businesses.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 md:mb-20 w-full"
                >
                    <Link href={createPageUrl("AI_Assessment")}>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Button size="lg" className="relative overflow-hidden group bg-red-600 hover:bg-red-600 text-white w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full font-bold shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_rgba(239,68,68,0.7)] transition-all">
                                <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    Get Free AI Assessment
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </motion.div>
                    </Link>
                    <Link href={createPageUrl("Booking")}>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 hover:border-white/30 w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full backdrop-blur-sm font-semibold transition-all">
                                Book Strategy Call
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Stat pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    {[
                        { val: '100+', label: 'Brands Grown' },
                        { val: '5x', label: 'Average ROI' },
                        { val: '98%', label: 'Client Retention' },
                        { val: '24/7', label: 'Support' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
                        >
                            <span className="text-red-400 font-black text-lg">{s.val}</span>
                            <span className="text-gray-500 text-sm">{s.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
                <span className="text-gray-600 text-xs tracking-widest uppercase">Scroll</span>
                <ChevronDown className="w-5 h-5 text-red-500/50" />
            </motion.div>
        </section>
    );
}