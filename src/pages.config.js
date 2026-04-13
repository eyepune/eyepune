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
import __Layout from './Layout.jsx';


export const PAGES = {
    "AI_Assessment": aiAssessment,
    "About": About,
    "Admin_Analytics": adminAnalytics,
    "Admin_Blog": adminBlog,
    "Admin_CMS": adminCms,
    "Admin_CRM": adminCrm,
    "Admin_CRMSync": adminCrmsync,
    "Admin_ClientLogos": adminClientlogos,
    "Admin_Dashboard": adminDashboard,
    "Admin_Documents": adminDocuments,
    "Admin_EmailCampaigns": adminEmailcampaigns,
    "Admin_Feedback": adminFeedback,
    "Admin_Marketing": adminMarketing,
    "Admin_PackageBuilder": adminPackagebuilder,
    "Admin_ProjectManagement": adminProjectmanagement,
    "Admin_Projects": adminProjects,
    "Admin_Reports": adminReports,
    "Admin_SEO": adminSeo,
    "Admin_SalesAssistant": adminSalesassistant,
    "Admin_SalesMetrics": adminSalesmetrics,
    "Admin_ServiceAddons": adminServiceaddons,
    "Admin_Templates": adminTemplates,
    "Admin_Testimonials": adminTestimonials,
    "Admin_Users": adminUsers,
    "Admin_WhatsAppSetup": adminWhatsappsetup,
    "Blog": Blog,
    "Blog_Post": blogPost,
    "Booking": Booking,
    "CMSPage": CMSPage,
    "Client_Dashboard": clientDashboard,
    "Contact": Contact,
    "Home": Home,
    "MakeAdmin": MakeAdmin,
    "Pricing": Pricing,
    "Profile": Profile,
    "Services": Services,
    "Services_Detail": servicesDetail,
    "SignContract": SignContract,
    "Testimonials": Testimonials,
    "Unsubscribe": Unsubscribe,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};