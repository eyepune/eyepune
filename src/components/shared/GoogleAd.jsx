'use client';

import React, { useEffect } from 'react';

export default function GoogleAd({ slot, format = 'auto', responsive = 'true', className = '' }) {
  useEffect(() => {
    try {
      // Pushes the ad to Google's engine once it mounts
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense error', err);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center my-8 bg-white/[0.02] border border-white/[0.05] rounded-xl p-2 min-h-[100px] ${className}`}>
      {/* We use a fallback text in dev so you can see where the ad will be */}
      {process.env.NODE_ENV === 'development' && (
        <span className="text-gray-600 text-sm font-semibold tracking-widest uppercase">Ad Space ({slot})</span>
      )}
      
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-6360575790240563"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
