import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qtrypzzcjebvfcihiynt.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  transpilePackages: ['react-leaflet', 'leaflet'],
  webpack: (config, { isServer }) => {
    // ── Alias react-router-dom → our Next.js compatibility shim ──
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.resolve(__dirname, 'src/compat/react-router-dom.jsx'),
    };

    // ── Alias @base44/sdk → our Supabase compatibility layer ──
    config.resolve.alias['@base44/sdk'] = path.resolve(__dirname, 'src/api/base44Client.js');
    config.resolve.alias['@base44/sdk/dist/utils/axios-client'] = path.resolve(__dirname, 'src/compat/axios-client-stub.js');

    // ── Prevent browser-only packages from being bundled on the server ──
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('quill', 'react-quill', 'html2canvas', 'jspdf');
      }
    }

    // Node.js polyfills for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
