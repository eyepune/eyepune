/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import aiAssessment from './views/AI_Assessment';
import About from './views/About';
import adminAnalytics from './views/Admin_Analytics';
import adminBlog from './views/Admin_Blog';
import adminCms from './views/Admin_CMS';
import adminCrm from './views/Admin_CRM';
import adminCrmsync from './views/Admin_CRMSync';
import adminClientlogos from './views/Admin_ClientLogos';
import adminDashboard from './views/Admin_Dashboard';
import adminDocuments from './views/Admin_Documents';
import adminEmailcampaigns from './views/Admin_EmailCampaigns';
import adminEmailtemplates from './views/Admin_EmailTemplates';
import adminDripAutomations from './views/Admin_DripAutomations';
import adminForms from './views/Admin_Forms';
import adminTestAutomation from './views/Admin_TestAutomation';
import adminWhatsAppMarketing from './views/Admin_WhatsAppMarketing';

import adminFeedback from './views/Admin_Feedback';
import adminMarketing from './views/Admin_Marketing';
import adminPackagebuilder from './views/Admin_PackageBuilder';
import adminProjectmanagement from './views/Admin_ProjectManagement';
import adminProjects from './views/Admin_Projects';
import adminReports from './views/Admin_Reports';
import adminSeo from './views/Admin_SEO';
import adminSalesassistant from './views/Admin_SalesAssistant';
import adminSalesmetrics from './views/Admin_SalesMetrics';
import adminServiceaddons from './views/Admin_ServiceAddons';
import adminTemplates from './views/Admin_Templates';
import adminTestimonials from './views/Admin_Testimonials';
import adminUsers from './views/Admin_Users';
import adminWhatsappsetup from './views/Admin_WhatsAppSetup';
import Blog from './views/Blog';
import blogPost from './views/Blog_Post';
import Booking from './views/Booking';
import CMSPage from './views/CMSPage';
import clientDashboard from './views/Client_Dashboard';
import Contact from './views/Contact';
import Home from './views/Home';
import MakeAdmin from './views/MakeAdmin';
import Pricing from './views/Pricing';
import Profile from './views/Profile';
import Services from './views/Services';
import servicesDetail from './views/Services_Detail';
import SignContract from './views/SignContract';
import Testimonials from './views/Testimonials';
import Unsubscribe from './views/Unsubscribe';
import Login from './views/Login';
import SystemStatus from './views/SystemStatus';
import SignProposal from './views/SignProposal';
import clientPortal from './views/Client_Portal';
import serviceSocialMedia from './views/Service_SocialMedia';
import serviceWebDev from './views/Service_WebDev';
import serviceAI from './views/Service_AI';
import servicePaidAds from './views/Service_PaidAds';
import serviceBranding from './views/Service_Branding';
import serviceFunnels from './views/Service_Funnels';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AI-Assessment": aiAssessment,
    "About": About,
    "Admin-Analytics": adminAnalytics,
    "Admin-Blog": adminBlog,
    "Admin-CMS": adminCms,
    "Admin-CRM": adminCrm,
    "Admin-CRMSync": adminCrmsync,
    "Admin-ClientLogos": adminClientlogos,
    "Admin-Dashboard": adminDashboard,
    "Admin-Documents": adminDocuments,
    "Admin-EmailCampaigns": adminEmailcampaigns,
    "Admin-EmailTemplates": adminEmailtemplates,
    "Admin-DripAutomations": adminDripAutomations,
    "Admin-Forms": adminForms,
    "Admin-TestAutomation": adminTestAutomation,
    "Admin-WhatsAppMarketing": adminWhatsAppMarketing,

    "Admin-Feedback": adminFeedback,
    "Admin-Marketing": adminMarketing,
    "Admin-PackageBuilder": adminPackagebuilder,
    "Admin-ProjectManagement": adminProjectmanagement,
    "Admin-Projects": adminProjects,
    "Admin-Reports": adminReports,
    "Admin-SEO": adminSeo,
    "Admin-SalesAssistant": adminSalesassistant,
    "Admin-SalesMetrics": adminSalesmetrics,
    "Admin-ServiceAddons": adminServiceaddons,
    "Admin-Templates": adminTemplates,
    "Admin-Testimonials": adminTestimonials,
    "Admin-Users": adminUsers,
    "Admin-WhatsAppSetup": adminWhatsappsetup,
    "Blog": Blog,
    "Blog-Post": blogPost,
    "Booking": Booking,
    "CMS-Page": CMSPage,
    "Client-Dashboard": clientDashboard,
    "Contact": Contact,
    "Home": Home,
    "Make-Admin": MakeAdmin,
    "Pricing": Pricing,
    "Profile": Profile,
    "Services": Services,
    "Services-Detail": servicesDetail,
    "Sign-Contract": SignContract,
    "Testimonials": Testimonials,
    "Unsubscribe": Unsubscribe,
    "Login": Login,
    "System-Status": SystemStatus,
    "Sign-Proposal": SignProposal,
    "Client-Portal": clientPortal,
    "Service-SocialMedia": serviceSocialMedia,
    "Service-WebDev": serviceWebDev,
    "Service-AI": serviceAI,
    "Service-PaidAds": servicePaidAds,
    "Service-Branding": serviceBranding,
    "Service-Funnels": serviceFunnels,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};