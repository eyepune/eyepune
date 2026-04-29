import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Favicon generation
export default function Icon() {
  return new ImageResponse(
    (
      // Favicon JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
           <path d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z" stroke="#ef4444" strokeWidth="8" strokeLinejoin="round" />
           <circle cx="50" cy="55" r="14" stroke="#ef4444" strokeWidth="6" />
           <circle cx="50" cy="55" r="6" fill="#ef4444" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
