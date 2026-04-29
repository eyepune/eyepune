import CatchAllPageClient from '../CatchAllPageClient';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function generateMetadata({ params, searchParams }) {
  const slugArray = params?.slug || [];
  if (!slugArray.length) return {};

  const baseRoute = slugArray[0];
  const identifier = searchParams?.slug || searchParams?.id || slugArray[1];

  let title = baseRoute.replace(/-/g, ' ');
  let description = `Explore ${title} at EyE PunE, Pune's premier digital agency.`;
  let imageUrl = '/opengraph-image.png';

  // Dynamic SEO for Blog Posts (Fetch from DB for accurate meta tags)
  if (baseRoute === 'Blog-Post' && identifier && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase
        .from('blog_posts')
        .select('title, excerpt, featured_image')
        .eq('slug', identifier)
        .single();

      if (data) {
        title = data.title;
        description = data.excerpt || description;
        imageUrl = data.featured_image || imageUrl;
      }
    } catch (e) {
      console.error('Error fetching blog post metadata', e);
    }
  }

  // Formatting for common routes
  if (baseRoute === 'Services-Detail' && identifier) {
    title = `${identifier.replace(/-/g, ' ')} Services | EyE PunE`;
    description = `Professional ${identifier.replace(/-/g, ' ')} services by EyE PunE. Transform your digital presence today.`;
  } else if (!identifier) {
    title = `${title} | EyE PunE`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      title,
      description,
      images: [imageUrl],
    }
  };
}

// Enable Incremental Static Regeneration (ISR) - cache page for 1 hour
export const revalidate = 3600;

export default function CatchAllPage() {
  return <CatchAllPageClient />;
}
