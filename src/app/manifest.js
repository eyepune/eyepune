export default function Manifest() {
  return {
    name: 'EyE PunE',
    short_name: 'EyE PunE',
    description: 'Connect · Engage · Grow with Pune\'s premier digital agency.',
    start_url: '/',
    display: 'standalone',
    background_color: '#040404',
    theme_color: '#040404',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
