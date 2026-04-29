import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#040404',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
          {/* Eyelashes/Rays */}
          <g stroke="#ef4444" strokeWidth="6" strokeLinecap="round">
            <line x1="15" y1="47" x2="5" y2="36" />
            <line x1="27" y1="40" x2="18" y2="28" />
            <line x1="38" y1="36" x2="33" y2="22" />
            <line x1="50" y1="35" x2="50" y2="20" />
            <line x1="62" y1="36" x2="67" y2="22" />
            <line x1="73" y1="40" x2="82" y2="28" />
            <line x1="85" y1="47" x2="95" y2="36" />
          </g>
          {/* Eye Shape */}
          <path d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z" stroke="#ef4444" strokeWidth="6" strokeLinejoin="round" />
          {/* Iris */}
          <circle cx="50" cy="55" r="14" stroke="#ef4444" strokeWidth="5" />
          {/* Pupil */}
          <circle cx="50" cy="55" r="6" fill="#ef4444" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
