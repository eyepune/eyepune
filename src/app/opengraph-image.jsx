import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EyE PunE - Elite Digital Marketing & AI Agency';
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
          background: 'linear-gradient(to bottom right, #000000, #1a0505)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            color: '#dc2626',
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '0.1em',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}
        >
          EyE PunE
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '40px',
            maxWidth: '900px',
          }}
        >
          Global AI Growth & Elite Digital Marketing
        </div>
        <div
          style={{
            color: '#a1a1aa',
            fontSize: 32,
            fontWeight: 400,
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Transform your business with AI-driven marketing, full-stack web solutions, and scalable sales systems.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
