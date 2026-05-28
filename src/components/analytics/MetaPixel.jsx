'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';

// REPLACE THIS WITH YOUR ACTUAL META PIXEL ID
const META_PIXEL_ID = 'YOUR_META_PIXEL_ID';

export const MetaPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !META_PIXEL_ID || META_PIXEL_ID === 'YOUR_META_PIXEL_ID') return;
    
    // Fire PageView on route change
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, isLoaded]);

  // Don't render the script if the ID hasn't been set yet
  if (META_PIXEL_ID === 'YOUR_META_PIXEL_ID') {
      return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
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
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
};
