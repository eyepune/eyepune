import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'EyE PunE — AI-Powered Digital Growth';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
            padding: '80px',
            borderRadius: '40px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(5, 5, 5, 0.9)',
            boxShadow: '0 0 80px rgba(239, 68, 68, 0.15)',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderTop: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderTop: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '30px', height: '30px', borderBottom: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '30px', height: '30px', borderBottom: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '4px' }} />

          <h1
            style={{
              fontSize: '120px',
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-6px',
              textShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
            }}
          >
            EyE<span style={{ color: '#ef4444', marginLeft: '12px' }}>PunE</span>
          </h1>

          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '10px',
              textTransform: 'uppercase',
              marginTop: '20px',
              borderTop: '1px solid rgba(239, 68, 68, 0.2)',
              paddingTop: '20px',
            }}
          >
            Connect · Engage · Grow
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '1px',
          }}
        >
          <span>AI AUTOMATION</span>
          <span style={{ color: 'rgba(239, 68, 68, 0.4)' }}>|</span>
          <span>DIGITAL MARKETING</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
