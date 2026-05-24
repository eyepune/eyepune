'use client';

export default function SmoothScroll({ children }) {
    // Disabled Lenis hijacking to prevent any "stuck" scroll behavior.
    // The native browser scroll will now be used, which guarantees 100% reliability with GSAP ScrollTrigger.
    return <>{children}</>;
}
