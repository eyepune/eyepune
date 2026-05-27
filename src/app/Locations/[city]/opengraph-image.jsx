import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'EyE PunE AI Local Solutions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
  // Format the city beautifully
  const rawCity = params.city || 'Your City';
  const city = rawCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(135deg, rgba(220, 20, 60, 0.2) 0%, transparent 50%, rgba(220, 20, 60, 0.1) 100%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
            <div style={{
                display: 'flex',
                fontSize: 60,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.05em'
            }}>
                EyE
                <span style={{ color: '#DC143C' }}>PunE</span>
            </div>
            <div style={{
                display: 'flex',
                fontSize: 30,
                color: '#DC143C',
                borderLeft: '4px solid #DC143C',
                paddingLeft: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 800
            }}>
                Local Domination
            </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 90,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            padding: '0 80px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '40px',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)'
          }}
        >
          Top Digital Agency in {city}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 35,
            color: '#a3a3a3',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Scale your local business with our elite AI and Web Development frameworks.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
