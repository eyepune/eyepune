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
            const maxR = Math.min(w, h) * 0.35;

            // 1. Background Neural Web (Subtle)
            ctx.globalAlpha = 0.15;
            for (let i = 0; i < 3; i++) {
                const r = maxR * (1.2 + i * 0.2) + Math.sin(t * 0.5 + i) * 10;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = '#ef4444';
                ctx.setLineDash([5, 15]);
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 2. Outer Glowing Rings
            for (let i = 0; i < 4; i++) {
                const r = maxR * (0.8 + i * 0.08) + Math.sin(t * 1.5 + i) * 5;
                const alpha = 0.1 - i * 0.02;
                ctx.beginPath();
                ctx.arc(cx, cy, r, t * 0.2 + i, t * 0.2 + i + Math.PI * 0.6);
                ctx.strokeStyle = `rgba(239,68,68,${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cx, cy, r, t * 0.2 + i + Math.PI, t * 0.2 + i + Math.PI * 1.6);
                ctx.stroke();
            }

            // 3. Iris Layer 1 (Base Gradient)
            const irisR = maxR * 0.45;
            const irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.2, cx, cy, irisR);
            irisGrad.addColorStop(0, '#000000');
            irisGrad.addColorStop(0.6, '#ef4444');
            irisGrad.addColorStop(1, '#000000');
            
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
            ctx.fillStyle = irisGrad;
            ctx.fill();

            // 4. Iris Texture (Fibers)
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 60; i++) {
                const angle = (i / 60) * Math.PI * 2 + Math.sin(t * 0.5) * 0.1;
                const len = irisR * (0.7 + Math.random() * 0.3);
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * (irisR * 0.3), cy + Math.sin(angle) * (irisR * 0.3));
                ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
                ctx.strokeStyle = `rgba(239,68,68,${0.2 + Math.random() * 0.3})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 5. Pupil (The Core)
            const pupilR = irisR * 0.35 + Math.sin(t * 2) * 2;
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();

            // 6. Pupil Inner Glow
            const pGlowR = pupilR * 0.8;
            const pGlowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pGlowR);
            pGlowGrad.addColorStop(0, 'rgba(239,68,68,0.8)');
            pGlowGrad.addColorStop(1, 'rgba(239,68,68,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, pGlowR, 0, Math.PI * 2);
            ctx.fillStyle = pGlowGrad;
            ctx.fill();

            // 7. Scanning Data Ring
            ctx.globalCompositeOperation = 'lighter';
            const dataR = maxR * 0.65;
            ctx.beginPath();
            ctx.arc(cx, cy, dataR, -t, -t + 0.5);
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 3;
            ctx.stroke();

            // 8. Orbiting Tech Particles
            for (let i = 0; i < 12; i++) {
                const orbitR = maxR * 0.75 + Math.sin(t + i) * 15;
                const angle = (i / 12) * Math.PI * 2 + t * 0.4;
                const px = cx + Math.cos(angle) * orbitR;
                const py = cy + Math.sin(angle) * orbitR;
                
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#ef4444';
                ctx.fill();
                
                // Trailing faint lines
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px - Math.cos(angle) * 20, py - Math.sin(angle) * 20);
                ctx.strokeStyle = `rgba(239,68,68,0.2)`;
                ctx.stroke();
            }

            // 9. Glint / Reflection
            const glintX = cx - irisR * 0.3;
            const glintY = cy - irisR * 0.3;
            const glintGrad = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, irisR * 0.2);
            glintGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
            glintGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(glintX, glintY, irisR * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = glintGrad;
            ctx.fill();

            t += 0.015;
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80" />;
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