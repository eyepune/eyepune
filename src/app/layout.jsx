import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import AIChatbot from '@/components/home/AIChatbot';

export const metadata = {
  title: 'EyE PunE — AI-Powered Digital Growth',
  description: 'Full-service digital marketing & AI automation agency based in Pune, India. Social media, web development, branding, paid ads, and AI solutions.',
  keywords: 'digital marketing pune, social media marketing, website development, AI automation, branding, lead generation, eyepune',
  authors: [{ name: 'EyE PunE' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'EyE PunE — AI-Powered Digital Growth',
    description: 'Pune\'s premier digital agency specializing in AI-driven marketing, web development, and custom automations.',
    url: 'https://www.eyepune.com/',
    siteName: 'EyE PunE',
    images: [
      {
        url: 'https://www.eyepune.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EyE PunE — AI-Powered Digital Growth',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EyE PunE — AI-Powered Digital Growth',
    description: 'Pune\'s premier digital agency specializing in AI-driven marketing, web development, and custom automations.',
    images: ['https://www.eyepune.com/og-image.png'],
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

