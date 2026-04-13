import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ count = 60, color = '#ef4444' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.8 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
            });

            // Draw connections
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = color + Math.floor((1 - dist / 100) * 40).toString(16).padStart(2, '0');
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [count, color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}