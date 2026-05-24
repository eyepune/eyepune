'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Scroll3DReveal({ 
    children, 
    className = "", 
    direction = "up", // up, down, left, right, scale
    delay = 0,
    duration = 1.2,
    rotation = true // whether to add a 3D rotation flip
}) {
    const el = useRef(null);

    useEffect(() => {
        if (!el.current) return;

        let fromState = {
            opacity: 0,
            transformOrigin: "center center"
        };

        if (direction === "up") { fromState.y = 80; }
        if (direction === "down") { fromState.y = -80; }
        if (direction === "left") { fromState.x = 80; }
        if (direction === "right") { fromState.x = -80; }
        if (direction === "scale") {
            fromState.scale = 0.8;
            fromState.z = -150;
        }

        if (rotation) {
            fromState.rotationX = direction === "up" ? 25 : (direction === "down" ? -25 : 0);
            fromState.rotationY = direction === "left" ? -25 : (direction === "right" ? 25 : 0);
        }

        const anim = gsap.fromTo(el.current, 
            fromState,
            {
                opacity: 1,
                x: 0,
                y: 0,
                z: 0,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                duration: duration,
                delay: delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 85%", // starts animating when top of element hits 85% of viewport
                    toggleActions: "play none none reverse"
                }
            }
        );

        return () => {
            if (anim.scrollTrigger) anim.scrollTrigger.kill();
            anim.kill();
        };
    }, [direction, delay, duration, rotation]);

    return (
        <div ref={el} className={`will-change-transform ${className}`} style={{ perspective: "1500px", transformStyle: "preserve-3d" }}>
            {children}
        </div>
    );
}
