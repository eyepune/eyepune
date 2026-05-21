import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import AIChatbot from '@/components/home/AIChatbot';
import SEO_JSONLD from '@/components/seo/SEO_JSONLD';
import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ef4444',
  colorScheme: 'dark',
};

export const metadata = {
  metadataBase: new URL('https://www.eyepune.com'),
  title: {
    default: 'EyE PunE – Digital Marketing Agency Pune | Global Growth & AI Automation',
    template: '%s | EyE PunE'
  },
  description: 'Pune-based digital agency serving clients across the globe. We combine AI-driven marketing, web development, and sales systems to scale businesses worldwide.',
  keywords: [
    'AI marketing agency Pune', 
    'digital marketing agency Pune', 
    'B2B lead generation services', 
    'website development Pune', 
    'AI automation for business', 
    'social media marketing Pune', 
    'elite branding agency', 
    'SEO services Pune',
    'eyepune'
  ],
  authors: [{ name: 'EyE PunE' }],
  creator: 'EyE PunE',
  publisher: 'EyE PunE',
  verification: {
    google: 'Y6xKuYwi-UqakzomtNF7IlQXA-d_uJ3q_dYpPfAXhRA',
    bing: '4D3E7D51ACDBA311179798C9A1675D74',
  },
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'EyE PunE — Elite Digital Marketing & AI Agency',
    description: 'Transform your business with AI-driven marketing and custom web solutions. Pune-based premier agency serving clients across the globe.',
    url: 'https://www.eyepune.com/',
    siteName: 'EyE PunE',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EyE PunE — AI-Powered Digital Growth',
    description: 'Premier digital agency in Pune serving clients across the globe with AI-driven marketing and custom automations.',
    creator: '@eyepune',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#040404] text-white antialiased font-sans">
        <SEO_JSONLD />
        <GoogleAnalytics />
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}

