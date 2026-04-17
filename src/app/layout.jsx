import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';

export const metadata = {
  title: 'EyE PunE — AI-Powered Digital Growth',
  description: 'Full-service digital marketing & AI automation agency based in Pune, India. Social media, web development, branding, paid ads, and AI solutions.',
  keywords: 'digital marketing pune, social media marketing, website development, AI automation, branding, lead generation, eyepune',
  authors: [{ name: 'EyE PunE' }],
  openGraph: {
    title: 'EyE PunE — AI-Powered Digital Growth',
    description: 'Full-service digital marketing & AI automation agency based in Pune, India.',
    siteName: 'EyE PunE',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040404] text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
