'use client';

import Home from '@/views/Home';
import Layout from '@/Layout';

export default function HomePageClient() {
  return (
    <Layout currentPageName="Home">
      <Home />
    </Layout>
  );
}
