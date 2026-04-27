import HomePageClient from './HomePageClient';

// Enable Incremental Static Regeneration (ISR) - cache page for 1 hour
export const revalidate = 3600;

export default function HomePage() {
  return <HomePageClient />;
}
