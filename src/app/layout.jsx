import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

export const metadata = {
  title: 'EyE PunE — AI-Powered Digital Growth',
  description: 'Full-service digital marketing & AI automation agency based in Pune, India. Social media, web development, branding, paid ads, and AI solutions.',
  keywords: 'digital marketing pune, social media marketing, website development, AI automation, branding, lead generation, eyepune',
  authors: [{ name: 'EyE PunE' }],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'EyE PunE Vision',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040404] text-white antialiased">
        <GoogleAnalytics />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

