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
        {/* Futuristic Grid Overlay */}
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

        {/* Dynamic Light Rays */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -200,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: -200,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Central Logo & Brand Container */}
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
            boxShadow: '0 0 80px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.05)',
            position: 'relative',
          }}
        >
          {/* Decorative Corner Brackets */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderTop: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderTop: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '30px', height: '30px', borderBottom: '3px solid #ef4444', borderLeft: '3px solid #ef4444', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '30px', height: '30px', borderBottom: '3px solid #ef4444', borderRight: '3px solid #ef4444', borderRadius: '4px' }} />

          {/* Main Title */}
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

          {/* Subtitle / Tagline */}
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

        {/* Dashboard-style Status Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 60px',
            alignItems: 'center',
          }}
        >
          {/* Left: System Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 15px #ef4444' }} />
            <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>ELITE COMMAND ACTIVE</span>
          </div>

          {/* Middle: Capabilities */}
          <div style={{ display: 'flex', gap: '30px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>
            <span>AI AUTOMATION</span>
            <span>DIGITAL MARKETING</span>
            <span>SALES SYSTEMS</span>
          </div>

          {/* Right: Location/Identity */}
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px', fontWeight: 700 }}>
            PUNE, INDIA
          </div>
        </div>

        {/* Abstract Data Nodes (Small glowing dots) */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px #ef4444',
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    ),
    {
      ...size,
    }
  );
}
