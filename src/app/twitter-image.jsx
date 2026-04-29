import { ImageResponse } from 'next/og';

// Using default Node.js runtime for better compatibility

export const alt = 'EyE PunE — AI-Powered Digital Growth';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#040404',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #150505 0%, #040404 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(circle, black, transparent 80%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 100px',
            borderRadius: '40px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(5, 5, 5, 0.9)',
            boxShadow: '0 0 80px rgba(239, 68, 68, 0.15)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', marginBottom: '30px' }}>
            <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
              <g stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.8">
                <line x1="15" y1="47" x2="5" y2="36" />
                <line x1="27" y1="40" x2="18" y2="28" />
                <line x1="38" y1="36" x2="33" y2="22" />
                <line x1="50" y1="35" x2="50" y2="20" />
                <line x1="62" y1="36" x2="67" y2="22" />
                <line x1="73" y1="40" x2="82" y2="28" />
                <line x1="85" y1="47" x2="95" y2="36" />
              </g>
              <path d="M 5 55 Q 50 15 95 55 Q 50 95 5 55 Z" stroke="#ef4444" strokeWidth="5" strokeLinejoin="round" />
              <circle cx="50" cy="55" r="14" stroke="#ef4444" strokeWidth="4" />
              <circle cx="50" cy="55" r="6" fill="#ef4444" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '90px',
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-4px',
            }}
          >
            EyE<span style={{ color: '#ef4444', marginLeft: '10px' }}>PunE</span>
          </h1>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '8px',
              textTransform: 'uppercase',
              marginTop: '15px',
            }}
          >
            Connect · Engage · Grow
          </div>
        </div>

        {/* Global Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Pune-Based · Serving Globally
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
