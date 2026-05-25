'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AntiInspect() {
    const pathname = usePathname();

    useEffect(() => {
        // Do not block admin or client portal pages, just public pages
        if (pathname?.startsWith('/Admin') || pathname?.startsWith('/Client')) return;

        // Block Right Click
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        const handleKeyDown = (e) => {
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [pathname]);

    return null;
}
