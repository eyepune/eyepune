'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
import Admin_EmailTemplates from '@/views/Admin_EmailTemplates';
import Admin_DripAutomations from '@/views/Admin_DripAutomations';
import Admin_TestAutomation from '@/views/Admin_TestAutomation';

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
import Admin_WhatsAppMarketing from '@/views/Admin_WhatsAppMarketing';
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
import SystemStatus from '@/views/SystemStatus';
import Solution_Founders from '@/views/Solution_Founders';
import Solution_YouTubers from '@/views/Solution_YouTubers';
import Solution_Startups from '@/views/Solution_Startups';
import Solution_B2BGrowth from '@/views/Solution_B2BGrowth';
import AI_Intelligence_Hub from '@/views/AI_Intelligence_Hub';
import PageNotFound from '@/lib/PageNotFound';
import PrivacyPolicy from '@/views/PrivacyPolicy';
import Terms from '@/views/Terms';
import Cookies from '@/views/Cookies';
// ── Route → Component mapping ──────────────────────────────────────────
const PAGE_MAP = {
  'Home': Home,
  'About': About,
  'AI-Assessment': AI_Assessment,
  'Admin-Analytics': Admin_Analytics,
  'Admin-Blog': Admin_Blog,
  'Admin-CMS': Admin_CMS,
  'Admin-CRM': Admin_CRM,
  'Admin-CRMSync': Admin_CRMSync,
  'Admin-ClientLogos': Admin_ClientLogos,
  'Admin-Dashboard': Admin_Dashboard,
  'Admin-Documents': Admin_Documents,
  'Admin-EmailCampaigns': Admin_EmailCampaigns,
  'Admin-EmailTemplates': Admin_EmailTemplates,
  'Admin-DripAutomations': Admin_DripAutomations,

  'Admin-Feedback': Admin_Feedback,
  'Admin-Forms': Admin_Forms,
  'Admin-Marketing': Admin_Marketing,
  'Admin-PackageBuilder': Admin_PackageBuilder,
  'Admin-ProjectManagement': Admin_ProjectManagement,
  'Admin-Projects': Admin_Projects,
  'Admin-TestAutomation': Admin_TestAutomation,
  'Admin-Reports': Admin_Reports,
  'Admin-SEO': Admin_SEO,
  'Admin-SalesAssistant': Admin_SalesAssistant,
  'Admin-SalesMetrics': Admin_SalesMetrics,
  'Admin-ServiceAddons': Admin_ServiceAddons,
  'Admin-Templates': Admin_Templates,
  'Admin-Testimonials': Admin_Testimonials,
  'Admin-Users': Admin_Users,
  'Admin-WhatsAppMarketing': Admin_WhatsAppMarketing,
  'Admin-WhatsAppSetup': Admin_WhatsAppSetup,
  'Blog': Blog,
  'Blog-Post': Blog_Post,
  'Booking': Booking,
  'CMS-Page': CMSPage,
  'Client-Dashboard': Client_Dashboard,
  'Client-Portal': Client_Portal,
  'Contact': Contact,
  'Login': Login,
  'Make-Admin': MakeAdmin,
  'Pricing': Pricing,
  'Profile': Profile,
  'Services': Services,
  'Services-Detail': Services_Detail,
  'Service-SocialMedia': Service_SocialMedia,
  'Service-WebDev': Service_WebDev,
  'Service-AI': Service_AI,
  'Service-PaidAds': Service_PaidAds,
  'Service-Branding': Service_Branding,
  'Service-Funnels': Service_Funnels,
  'Sign-Contract': SignContract,
  'Sign-Proposal': SignProposal,
  'Testimonials': Testimonials,
  'Unsubscribe': Unsubscribe,
  'Admin-Outreach': Admin_Outreach,
  'System-Status': SystemStatus,
  'Solution-Founders': Solution_Founders,
  'Solution-YouTubers': Solution_YouTubers,
  'Solution-Startups': Solution_Startups,
  'Solution-B2BGrowth': Solution_B2BGrowth,
  'AI-Intelligence-Hub': AI_Intelligence_Hub,
  'Privacy-Policy': PrivacyPolicy,
  'Terms-and-Conditions': Terms,
  'Cookie-Policy': Cookies,
};

// Pages that should NOT be wrapped in the Layout
const NO_LAYOUT_PAGES = ['Sign-Proposal', 'Sign-Contract', 'Login'];

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#040404]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
}

export default function CatchAllPageClient() {
  const pathname = usePathname();
  
  // Extract page name from path: "/Admin-Dashboard" → "Admin-Dashboard"
  const pageName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  
  // Root path → Home
  const rawPageName = !pageName ? 'Home' : pageName;
  
  // Case-insensitive lookup: try exact match first, then find by case-insensitive key
  let resolvedPageName = rawPageName;
  if (!PAGE_MAP[resolvedPageName]) {
    const lowerName = rawPageName.toLowerCase().replace(/-/g, '_');
    const matchKey = Object.keys(PAGE_MAP).find(k => k.toLowerCase().replace(/-/g, '_') === lowerName);
    if (matchKey) resolvedPageName = matchKey;
  }
  
  const PageComponent = PAGE_MAP[resolvedPageName];
  
  if (!PageComponent) {
    return <PageNotFound />;
  }
  
  const skipLayout = NO_LAYOUT_PAGES.includes(resolvedPageName);
  
  if (skipLayout) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          key={resolvedPageName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PageComponent />
        </motion.div>
      </Suspense>
    );
  }
  
  return (
    <Layout currentPageName={resolvedPageName}>
      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          key={resolvedPageName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PageComponent />
        </motion.div>
      </Suspense>
    </Layout>
  );
}
