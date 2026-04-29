import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import AIChatbot from '@/components/home/AIChatbot';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://eyepune.com'),
  title: 'EyE PunE — Connect · Engage · Grow',
  description: 'Full-service digital marketing & AI automation agency based in Pune, India. Social media, web development, branding, paid ads, and AI solutions.',
  keywords: 'digital marketing pune, social media marketing, website development, AI automation, branding, lead generation, eyepune',
  authors: [{ name: 'EyE PunE' }],
  openGraph: {
    title: 'EyE PunE — Connect · Engage · Grow',
    description: 'Pune\'s premier digital agency specializing in AI-driven marketing, web development, and custom automations.',
    url: 'https://eyepune.com/',
    siteName: 'EyE PunE',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EyE PunE — AI-Powered Digital Growth',
    description: 'Pune\'s premier digital agency specializing in AI-driven marketing, web development, and custom automations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040404] text-white antialiased">
        <GoogleAnalytics />
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}

