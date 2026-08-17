import HomePageClient from './HomePageClient';
import { getActiveSEOVariant } from '@/utils/seo-server';
import { headers } from 'next/headers';

export async function generateMetadata() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const variant = await getActiveSEOVariant('/', userAgent);
  
  if (variant) {
    return {
      title: variant.title,
      description: variant.description,
      openGraph: {
        title: variant.title,
        description: variant.description,
      },
      twitter: {
        title: variant.title,
        description: variant.description,
      }
    };
  }
  return {};
}

export const revalidate = 0; // Disable cache so A/B works per request

export default async function HomePage({ searchParams }) {
  const company = searchParams?.company || null;
  return <HomePageClient company={company} />;
}
