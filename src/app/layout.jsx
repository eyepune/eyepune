import '@/globals.css';
import { Suspense } from 'react';
import Script from 'next/script';
import { Providers } from './providers';
import { CSPostHogProvider } from './PostHogProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { MetaPixel } from '@/components/analytics/MetaPixel';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import dynamic from 'next/dynamic';
import SEO_JSONLD from '@/components/seo/SEO_JSONLD';
import SmoothScroll from '@/components/3d/SmoothScroll';
import PremiumEffects from '@/components/shared/PremiumEffects';
import SecurityProvider from '@/components/security/SecurityProvider';
import { Outfit, Inter } from 'next/font/google';

const AIChatbot = dynamic(() => import('@/components/home/AIChatbot'), { ssr: false });
const GlobalCanvas = dynamic(() => import('@/components/3d/GlobalCanvas'), { ssr: false });
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
  themeColor: '#DC143C',
  colorScheme: 'dark',
};

export const metadata = {
  metadataBase: new URL('https://www.eyepune.com'),
  title: {
    default: 'EyE PunE | Elite AI Growth & Marketing Agency',
    template: '%s | EyE PunE'
  },
  description: 'Pune-based elite digital agency. We combine AI-driven marketing, full-stack web development, and hyper-scalable sales systems to explode business growth worldwide.',
  keywords: [
    'Best Digital Marketing Agencies',
    'Top 100 Digital Marketing Companies in India',
    'Top Digital Marketing Agencies in India',
    'Top 30 Digital Marketing Agencies',
    'Digital Marketing Asia Region',
    'Digital Marketing Middle East',
    'Digital Marketing Western Europe',
    'Digital Marketing South USA',
    'Digital Marketing West USA',
    'Digital Marketing Canada',
    'Digital Marketing Latin America',
    'Digital Marketing Australia New Zealand',
    'Digital Marketing Central USA',
    'Digital Marketing Northeast USA',
    'Digital Marketing UK Ireland',
    'AI marketing agency Pune', 
    'digital marketing agency Pune', 
    'B2B lead generation services', 
    'website development Pune', 
    'AI automation for business',
    'growth marketing',
    'SaaS scaling',
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
  other: {
    'google-adsense-account': 'ca-pub-6360575790240563'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${inter.variable}`}>
      <CSPostHogProvider>
        <body className="min-h-screen bg-transparent text-white antialiased font-sans">
          <Script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6360575790240563" 
            crossOrigin="anonymous" 
            strategy="afterInteractive" 
          />
          <SEO_JSONLD />
          <GoogleAnalytics />
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          <Providers>
            <SecurityProvider />
            <SmoothScroll>
              <GlobalCanvas />
              <PremiumEffects />
              {children}
              <AIChatbot />
            </SmoothScroll>
            <Analytics />
            <SpeedInsights />
          </Providers>
        </body>
      </CSPostHogProvider>
    </html>
  );
}

