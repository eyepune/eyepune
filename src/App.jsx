import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import Service_SocialMedia from './views/Service_SocialMedia';
import Service_WebDev from './views/Service_WebDev';
import Service_AI from './views/Service_AI';
import Service_PaidAds from './views/Service_PaidAds';
import Service_Branding from './views/Service_Branding';
import Service_Funnels from './views/Service_Funnels';
import Admin_Outreach from './views/Admin_Outreach';
import SignProposal from './views/SignProposal';
import Client_Portal from './views/Client_Portal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    } else if (authError.type === 'config_missing') {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Supabase Not Connected</h1>
            <p className="text-gray-400 mb-6">{authError.message}</p>
            <div className="bg-[#111] p-4 rounded border border-white/10 text-xs text-left font-mono text-gray-500 mb-6">
              Check if <strong>.env</strong> file exists in the root and contains:<br/>
              NEXT_PUBLIC_SUPABASE_URL=...<br/>
              NEXT_PUBLIC_SUPABASE_ANON_KEY=...
            </div>
            <Link href="/SystemStatus">
              <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                Run System Diagnostics
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    // General error fallback
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-gray-400">{authError.message}</p>
        </div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/Service_SocialMedia" element={<LayoutWrapper currentPageName="Service_SocialMedia"><Service_SocialMedia /></LayoutWrapper>} />
      <Route path="/Service_WebDev" element={<LayoutWrapper currentPageName="Service_WebDev"><Service_WebDev /></LayoutWrapper>} />
      <Route path="/Service_AI" element={<LayoutWrapper currentPageName="Service_AI"><Service_AI /></LayoutWrapper>} />
      <Route path="/Service_PaidAds" element={<LayoutWrapper currentPageName="Service_PaidAds"><Service_PaidAds /></LayoutWrapper>} />
      <Route path="/Service_Branding" element={<LayoutWrapper currentPageName="Service_Branding"><Service_Branding /></LayoutWrapper>} />
      <Route path="/Service_Funnels" element={<LayoutWrapper currentPageName="Service_Funnels"><Service_Funnels /></LayoutWrapper>} />
      <Route path="/Admin_Outreach" element={<LayoutWrapper currentPageName="Admin_Outreach"><Admin_Outreach /></LayoutWrapper>} />
      <Route path="/SignProposal" element={<SignProposal />} />
      <Route path="/Client_Portal" element={<LayoutWrapper currentPageName="Client_Portal"><Client_Portal /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App