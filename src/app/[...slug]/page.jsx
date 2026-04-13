import CatchAllPageClient from '../CatchAllPageClient';

// Force dynamic rendering — pages use React Query which requires
// QueryClientProvider and cannot be statically prerendered.
export const dynamic = 'force-dynamic';

export default function CatchAllPage() {
  return <CatchAllPageClient />;
}
