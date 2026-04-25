// Google Analytics 4 + Meta Pixel tracker
// Loaded once in root layout — fires page views on every route change
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export function GoogleAnalytics() {
    const pathname = usePathname();

    useEffect(() => {
        // Fire GA4 page view on route change
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', GA_ID, { page_path: pathname });
        }
        // Fire Meta Pixel page view on route change
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'PageView');
        }
    }, [pathname]);

    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return null;

    return (
        <>
            {/* Google Analytics 4 */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        send_page_view: true
                    });
                `}
            </Script>

            {/* Meta Pixel */}
            {META_PIXEL_ID && (
                <Script id="meta-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${META_PIXEL_ID}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
        </>
    );
}

// Helper: track custom events
export function trackEvent(eventName, params = {}) {
    if (typeof window !== 'undefined') {
        if (window.gtag) window.gtag('event', eventName, params);
        if (window.fbq) window.fbq('track', eventName, params);
    }
}
