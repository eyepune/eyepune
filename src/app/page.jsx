import HomePageClient from './HomePageClient';

// Force dynamic rendering — pages use React Query which requires
// QueryClientProvider and cannot be statically prerendered.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <HomePageClient />;
}
