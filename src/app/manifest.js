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
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
