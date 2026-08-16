'use client';

import Home from '@/views/Home';
import Layout from '@/Layout';

export default function HomePageClient({ company }) {
  return (
    <Layout currentPageName="Home">
      <Home company={company} />
    </Layout>
  );
}
