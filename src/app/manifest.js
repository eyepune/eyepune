export default function Manifest() {
  return {
    name: 'EyE PunE',
    short_name: 'EyE PunE',
    description: 'Connect · Engage · Grow with Pune\'s premier digital agency.',
    start_url: '/',
    display: 'standalone',
    background_color: '#040404',
    theme_color: '#ef4444',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
