import '@/globals.css';
import '@/index.css';
import { Providers } from './providers';

export const metadata = {
  title: 'EyE PunE — AI-Powered Digital Growth',
  description: 'Full-service digital marketing & AI automation agency based in Pune, India.',
  icons: {
    icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png',
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
