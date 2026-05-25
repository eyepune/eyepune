import CatchAllPageClient from '../CatchAllPageClient';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function generateMetadata({ params, searchParams }) {
  const slugArray = params?.slug || [];
  if (!slugArray.length) return {};

  const baseRoute = slugArray[0];
  const identifier = searchParams?.slug || searchParams?.id || slugArray[1];

  const META_DEFAULTS = {
    'Home': {
      title: 'EyE PunE – Digital Marketing Agency Pune | Global Growth & AI Automation',
      description: 'Pune-based digital agency serving clients across the globe. We combine AI-driven marketing, web development, and sales systems to scale businesses worldwide.'
    },
    'About': {
      title: 'About EyE PunE | Our Mission & AI Vision',
      description: 'Discover how EyE PunE combines human creativity with artificial intelligence to deliver unprecedented digital growth. Meet the team behind Pune\'s elite agency.'
    },
    'AI-Assessment': {
      title: 'Free AI Business Assessment | EyE PunE',
      description: 'Get a comprehensive AI-powered audit of your digital presence. Our assessment identifies growth bottlenecks and provides a custom roadmap for scaling your business.'
    },
    'Services': {
      title: 'Premium Digital Services | AI, Web & Marketing',
      description: 'Explore our suite of elite services including AI automation, full-stack web development, B2B performance marketing, and strategic branding for modern enterprises.'
    },
    'Contact': {
      title: 'Contact EyE PunE | Start Your Growth Journey',
      description: 'Ready to scale? Connect with our strategic consultants in Pune. We offer specialized solutions for AI integration, digital marketing, and business automation.'
    },
    'Pricing': {
      title: 'Strategic Growth Packages & Pricing | EyE PunE',
      description: 'Transparent pricing for elite digital services. From startup acceleration to enterprise AI automation, find the perfect package to scale your business operations.'
    },
    'Blog': {
      title: 'EyE Intel | AI & Digital Strategy Blog',
      description: 'Stay ahead of the curve with expert insights on AI marketing, web technology trends, and B2B growth hacks from the strategists at EyE PunE in Pune.'
    },
    'Booking': {
      title: 'Book a Strategy Consultation | EyE PunE',
      description: 'Schedule a private 1-on-1 session with our growth experts. We\'ll analyze your business model and identify high-impact opportunities for AI-driven scaling.'
    },
    'Testimonials': {
      title: 'Client Success Stories | EyE PunE Reviews',
      description: 'See how global brands and local leaders achieve massive growth with EyE PunE. Real results, real impact, and verified testimonials from our successful partners.'
    },
    'Service-SocialMedia': {
      title: 'Social Media Marketing & Management | EyE PunE',
      description: 'Build an elite social presence with AI-powered content strategy, high-impact community management, and performance-driven social ads that convert followers to fans.'
    },
    'Service-WebDev': {
      title: 'High-Performance Web Development | EyE PunE',
      description: 'We build fast, secure, and conversion-optimized websites and web apps. Our development team focuses on user experience and business-driven technology solutions.'
    },
    'Service-AI': {
      title: 'AI Automation & Business Intelligence | EyE PunE',
      description: 'Transform your operations with custom AI agents, automated sales pipelines, and smart data analytics. We help you work smarter, not harder, with AI solutions.'
    },
    'Service-PaidAds': {
      title: 'Performance Marketing & Paid Ads | EyE PunE',
      description: 'Maximized ROI through data-driven ad campaigns on Google, Meta, and LinkedIn. Our experts optimize every rupee to ensure your business reaches its target audience.'
    },
    'Service-Branding': {
      title: 'Elite Brand Strategy & Design | EyE PunE',
      description: 'Create a powerful brand identity that resonates globally. From visual design to strategic positioning, we build brands that stand out in crowded markets.'
    },
    'Service-Funnels': {
      title: 'Conversion-Optimized Sales Funnels | EyE PunE',
      description: 'Turn traffic into revenue with high-converting sales funnels and lead nurturing systems. We design seamless user journeys that drive measurable business results.'
    },
    'Solution-Founders': {
      title: 'AI Growth Solutions for Founders | EyE PunE',
      description: 'Scale your personal brand and automate your sales engine. We help elite founders build automated growth systems using multi-model AI orchestration.'
    },
    'Solution-YouTubers': {
      title: 'Global Distribution for YouTubers | EyE PunE',
      description: 'Dominate the global algorithm. Our Viral Slicer AI and automated distribution systems help creators reach millions of new viewers across 10+ countries.'
    },
    'Solution-Startups': {
      title: 'Rapid Scaling for Global Startups | EyE PunE',
      description: 'From MVP to Unicorn. We provide the Next.js and AI tech stacks that modern startups need to scale operations and dominate their niche globally.'
    },
    'Solution-B2BGrowth': {
      title: '24/7 B2B Automated Growth Engine | EyE PunE',
      description: 'Find, pitch, and qualify your ideal clients on LinkedIn and Email while you sleep. We build the ultimate automated outreach systems for Founders and Agencies.'
    },
    'AI-Intelligence-Hub': {
      title: 'AI Intelligence Hub | The Global AI Frontier',
      description: 'The master directory of EyE PunE\'s multi-model AI capabilities. Explore how we orchestrate OpenAI, Claude, Gemini, and Meta to build your unfair advantage.'
    },
    'Privacy-Policy': {
      title: 'Privacy Policy | EyE PunE',
      description: 'Privacy Policy for EyE PunE. Learn how we collect, use, protect, and handle your personal data when using our website and services.'
    },
    'Terms-and-Conditions': {
      title: 'Terms & Conditions | EyE PunE',
      description: 'Terms and Conditions of Service for EyE PunE. Read the agreements, rules, and guidelines for accessing and utilizing our growth and AI solutions.'
    },
    'Cookie-Policy': {
      title: 'Cookie Policy | EyE PunE',
      description: 'Cookie Policy for EyE PunE. Understand how we use cookies, tracking pixels, and interactive technologies to improve your experience.'
    }
  };

  const routeKey = Object.keys(META_DEFAULTS).find(k => k.toLowerCase() === baseRoute.toLowerCase());
  let { title, description } = META_DEFAULTS[routeKey] || {
    title: baseRoute.replace(/-/g, ' '),
    description: `Explore ${baseRoute.replace(/-/g, ' ')} at EyE PunE, Pune's premier digital agency specializing in AI-driven marketing and custom web solutions.`
  };

  let imageUrl = '/opengraph-image.png';

  // Dynamic SEO for Blog Posts (Fetch from DB for accurate meta tags)
  if (baseRoute.toLowerCase() === 'blog-post' && identifier && !supabaseUrl.includes('placeholder')) {
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
  if (baseRoute.toLowerCase() === 'services-detail' && identifier) {
    title = `${identifier.replace(/-/g, ' ')} Services | EyE PunE`;
    description = `Professional ${identifier.replace(/-/g, ' ')} services by EyE PunE. Our elite Pune-based team delivers high-impact digital solutions to transform your brand.`;
  } else if (!identifier && !META_DEFAULTS[routeKey]) {
    title = `${title} | EyE PunE`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl !== '/opengraph-image.png' && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      title,
      description,
      ...(imageUrl !== '/opengraph-image.png' && { images: [imageUrl] }),
    }
  };
}

// Enable fully dynamic server rendering (bypasses stale edge CDN caching)
export const revalidate = 0;

export default function CatchAllPage() {
  return <CatchAllPageClient />;
}
