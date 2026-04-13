'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Layout from '@/Layout';

// ── Page imports ────────────────────────────────────────────────────────
import Home from '@/views/Home';
import About from '@/views/About';
import AI_Assessment from '@/views/AI_Assessment';
import Admin_Analytics from '@/views/Admin_Analytics';
import Admin_Blog from '@/views/Admin_Blog';
import Admin_CMS from '@/views/Admin_CMS';
import Admin_CRM from '@/views/Admin_CRM';
import Admin_CRMSync from '@/views/Admin_CRMSync';
import Admin_ClientLogos from '@/views/Admin_ClientLogos';
import Admin_Dashboard from '@/views/Admin_Dashboard';
import Admin_Documents from '@/views/Admin_Documents';
import Admin_EmailCampaigns from '@/views/Admin_EmailCampaigns';
import Admin_Feedback from '@/views/Admin_Feedback';
import Admin_Marketing from '@/views/Admin_Marketing';
import Admin_PackageBuilder from '@/views/Admin_PackageBuilder';
import Admin_ProjectManagement from '@/views/Admin_ProjectManagement';
import Admin_Projects from '@/views/Admin_Projects';
import Admin_Reports from '@/views/Admin_Reports';
import Admin_SEO from '@/views/Admin_SEO';
import Admin_SalesAssistant from '@/views/Admin_SalesAssistant';
import Admin_SalesMetrics from '@/views/Admin_SalesMetrics';
import Admin_ServiceAddons from '@/views/Admin_ServiceAddons';
import Admin_Templates from '@/views/Admin_Templates';
import Admin_Testimonials from '@/views/Admin_Testimonials';
import Admin_Users from '@/views/Admin_Users';
import Admin_WhatsAppSetup from '@/views/Admin_WhatsAppSetup';
import Blog from '@/views/Blog';
import Blog_Post from '@/views/Blog_Post';
import Booking from '@/views/Booking';
import CMSPage from '@/views/CMSPage';
import Client_Dashboard from '@/views/Client_Dashboard';
import Client_Portal from '@/views/Client_Portal';
import Contact from '@/views/Contact';
import Login from '@/views/Login';
import MakeAdmin from '@/views/MakeAdmin';
import Pricing from '@/views/Pricing';
import Profile from '@/views/Profile';
import Services from '@/views/Services';
import Services_Detail from '@/views/Services_Detail';
import Service_SocialMedia from '@/views/Service_SocialMedia';
import Service_WebDev from '@/views/Service_WebDev';
import Service_AI from '@/views/Service_AI';
import Service_PaidAds from '@/views/Service_PaidAds';
import Service_Branding from '@/views/Service_Branding';
import Service_Funnels from '@/views/Service_Funnels';
import SignContract from '@/views/SignContract';
import SignProposal from '@/views/SignProposal';
import Testimonials from '@/views/Testimonials';
import Unsubscribe from '@/views/Unsubscribe';
import Admin_Forms from '@/views/Admin_Forms';
import Admin_Outreach from '@/views/Admin_Outreach';
import PageNotFound from '@/lib/PageNotFound';

// ── Route → Component mapping ──────────────────────────────────────────
const PAGE_MAP = {
  Home,
  About,
  AI_Assessment,
  Admin_Analytics,
  Admin_Blog,
  Admin_CMS,
  Admin_CRM,
  Admin_CRMSync,
  Admin_ClientLogos,
  Admin_Dashboard,
  Admin_Documents,
  Admin_EmailCampaigns,
  Admin_Feedback,
  Admin_Forms,
  Admin_Marketing,
  Admin_PackageBuilder,
  Admin_ProjectManagement,
  Admin_Projects,
  Admin_Reports,
  Admin_SEO,
  Admin_SalesAssistant,
  Admin_SalesMetrics,
  Admin_ServiceAddons,
  Admin_Templates,
  Admin_Testimonials,
  Admin_Users,
  Admin_WhatsAppSetup,
  Blog,
  Blog_Post,
  Booking,
  CMSPage,
  Client_Dashboard,
  Client_Portal,
  Contact,
  Login,
  MakeAdmin,
  Pricing,
  Profile,
  Services,
  Services_Detail,
  Service_SocialMedia,
  Service_WebDev,
  Service_AI,
  Service_PaidAds,
  Service_Branding,
  Service_Funnels,
  SignContract,
  SignProposal,
  Testimonials,
  Unsubscribe,
  Admin_Outreach,
};

// Pages that should NOT be wrapped in the Layout
const NO_LAYOUT_PAGES = ['SignProposal', 'SignContract', 'Login'];

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#040404]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
}

export default function CatchAllPageClient() {
  const pathname = usePathname();
  
  // Extract page name from path: "/Admin_Dashboard" → "Admin_Dashboard"
  const pageName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  
  // Root path → Home
  const resolvedPageName = !pageName ? 'Home' : pageName;
  
  const PageComponent = PAGE_MAP[resolvedPageName];
  
  if (!PageComponent) {
    return <PageNotFound />;
  }
  
  const skipLayout = NO_LAYOUT_PAGES.includes(resolvedPageName);
  
  if (skipLayout) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PageComponent />
      </Suspense>
    );
  }
  
  return (
    <Layout currentPageName={resolvedPageName}>
      <Suspense fallback={<LoadingSpinner />}>
        <PageComponent />
      </Suspense>
    </Layout>
  );
}
