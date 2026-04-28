'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, LogIn, ChevronDown, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Logo from "@/components/shared/Logo";
import { ThemeProvider, useTheme } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import ExitIntentPopup from "@/components/shared/ExitIntentPopup";
import CustomCursor from "@/components/shared/CustomCursor";

const publicNavLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Services', page: 'Services_Detail' },
    { name: 'Pricing', page: 'Pricing' },
    { name: 'Blog', page: 'Blog' },
    { name: 'About', page: 'About' },
    { name: 'Contact', page: 'Contact' },
];

const adminNavLinks = [
    { name: 'Dashboard', page: 'Admin_Dashboard' },
    { name: 'Users', page: 'Admin_Users' },
    { name: 'CRM', page: 'Admin_CRM' },
    { name: 'CRM Sync', page: 'Admin_CRMSync' },
    { name: 'Sales Metrics', page: 'Admin_SalesMetrics' },
    { name: 'Sales AI', page: 'Admin_SalesAssistant' },
    { name: 'WhatsApp', page: 'Admin_WhatsAppSetup' },
    { name: 'Package Builder', page: 'Admin_PackageBuilder' },
    { name: 'Projects', page: 'Admin_Projects' },
    { name: 'Documents', page: 'Admin_Documents' },
    { name: 'Templates', page: 'Admin_Templates' },
    { name: 'PM', page: 'Admin_ProjectManagement' },
    { name: 'Blog', page: 'Admin_Blog' },
    { name: 'Testimonials', page: 'Admin_Testimonials' },
    { name: 'Feedback', page: 'Admin_Feedback' },
    { name: 'Reports', page: 'Admin_Reports' },
    { name: 'CMS', page: 'Admin_CMS' },
    { name: 'Marketing', page: 'Admin_Marketing' },
    { name: 'Email Templates', page: 'Admin_EmailTemplates' },
    { name: 'Analytics', page: 'Admin_Analytics' },
    { name: 'SEO', page: 'Admin_SEO' },
    { name: 'Automation Lab', page: 'Admin_TestAutomation' },
    { name: 'Client Logos', page: 'Admin_ClientLogos' },
    { name: 'Service Add-ons', page: 'Admin_ServiceAddons' },
    { name: 'Outreach', page: 'Admin_Outreach' },
];

const clientNavLinks = [
    { name: 'Dashboard', page: 'Client_Dashboard' },
    { name: 'My Portal', page: 'Client_Portal' },
];

const footerLinks = {
    Services: [
        { name: 'Social Media Management', page: 'Service_SocialMedia' },
        { name: 'Website Development', page: 'Service_WebDev' },
        { name: 'AI Automation', page: 'Service_AI' },
        { name: 'Google & Meta Ads', page: 'Service_PaidAds' },
        { name: 'Branding & Design', page: 'Service_Branding' },
        { name: 'Sales Funnels', page: 'Service_Funnels' },
    ],
    Company: [
        { name: 'About Us', page: 'About' },
        { name: 'Blog', page: 'Blog' },
        { name: 'Testimonials', page: 'Testimonials' },
        { name: 'Contact', page: 'Contact' },
    ],
    'Get Started': [
        { name: 'Free AI Assessment', page: 'AI_Assessment' },
        { name: 'Book Consultation', page: 'Booking' },
        { name: 'Pricing', page: 'Pricing' },
    ],
};

function LayoutContent({ children, currentPageName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Scroll to top and update title on every page navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Dynamic title logic
        const siteName = 'EyE PunE';
        if (currentPageName === 'Home') {
            document.title = `${siteName} — AI-Powered Digital Growth`;
        } else {
            const formattedName = currentPageName
                .replace(/_/g, ' ')
                .replace('Admin ', 'Admin: ')
                .replace('Service ', 'Service: ')
                .replace(/\b\w/g, l => l.toUpperCase());
            document.title = `${formattedName} | ${siteName}`;
        }
    }, [currentPageName]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const { user } = useAuth();

    const isAdminPage = currentPageName?.startsWith('Admin_');
    const isClientPage = currentPageName?.startsWith('Client_');

    // Activity logging is now handled by NavigationTracker to avoid redundancy

    let navLinks = publicNavLinks;
    if (isAdminPage) navLinks = adminNavLinks;
    else if (isClientPage) navLinks = clientNavLinks;

    const isPublicPage = !isAdminPage && !isClientPage;

    return (
        <div className="min-h-screen bg-[#040404] text-white">
            <CustomCursor />
            <ExitIntentPopup />
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#040404]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo — only show on public/client pages */}
                        {!isAdminPage && (
                        <Link href={createPageUrl("Home")} className="flex-shrink-0">
                            <Logo variant="dark" size="sm" />
                        </Link>
                        )}
                        {isAdminPage && (
                        <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase">Admin Panel</span>
                        )}

                        {/* Desktop nav — public */}
                        {isPublicPage && (
                            <div className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.page}
                                        href={createPageUrl(link.page)}
                                        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
                                            currentPageName === link.page
                                                ? 'text-white bg-white/[0.07]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {link.name}
                                        {currentPageName === link.page && (
                                            <motion.span
                                                layoutId="nav-indicator"
                                                className="absolute inset-0 rounded-full bg-white/[0.07] -z-10"
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}



                        {/* Right actions */}
                        <div className="hidden lg:flex items-center gap-3">
                            {isPublicPage && (
                                <>
                                    {user && (
                                        <Link href={createPageUrl(user.role === 'admin' ? "Admin_Dashboard" : "Client_Dashboard")}>
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full text-sm">Dashboard</Button>
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link href={createPageUrl("Admin_Dashboard")}>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full w-9 h-9">
                                                <LayoutDashboard className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href={createPageUrl("AI_Assessment")}>
                                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                            <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all">
                                                <Bot className="w-4 h-4 mr-1.5" />
                                                Free Assessment
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </>
                            )}

                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-500 text-white flex items-center justify-center text-sm font-bold ring-2 ring-red-500/20 hover:ring-red-500/50 transition-all">
                                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#111] border-white/10">
                                        <div className="px-3 py-2">
                                            <p className="font-semibold text-white text-sm">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem asChild><Link href={createPageUrl("Profile")} className="text-gray-300">Profile</Link></DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-400 hover:text-red-300 cursor-pointer">
                                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <button
                                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/25 text-gray-400 hover:text-white text-sm transition-all"
                                >
                                    <LogIn className="w-4 h-4" /> Sign In / Sign Up
                                </button>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:border-red-500/40 transition-all"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="lg:hidden bg-[#080808]/98 backdrop-blur-xl border-b border-white/[0.06]"
                        >
                            <div className="px-6 py-6 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.page}
                                        href={createPageUrl(link.page)}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block py-3 px-4 rounded-xl text-base font-medium transition-all ${
                                            currentPageName === link.page
                                                ? 'text-white bg-red-500/10 border border-red-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                    >{link.name}</Link>
                                ))}
                                <div className="pt-4 space-y-3">
                                    {isPublicPage && (
                                        <Link href={createPageUrl("AI_Assessment")} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl py-5 font-bold">
                                                <Bot className="w-4 h-4 mr-2" /> Free AI Assessment
                                            </Button>
                                        </Link>
                                    )}
                                    {user ? (
                                        <>
                                            <Link href={createPageUrl(user.role === 'admin' ? "Admin_Dashboard" : "Client_Dashboard")} onClick={() => setMobileMenuOpen(false)}>
                                                <Button className="w-full bg-white/[0.07] hover:bg-white/[0.1] text-white rounded-xl py-5 font-bold mb-3">
                                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                                </Button>
                                            </Link>
                                            <Button variant="outline" className="w-full border-white/10 text-gray-300 rounded-xl py-5" onClick={() => { setMobileMenuOpen(false); base44.auth.logout(); }}>
                                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" className="w-full border-white/10 text-gray-300 rounded-xl" onClick={() => { setMobileMenuOpen(false); base44.auth.redirectToLogin(window.location.pathname); }}>
                                            <LogIn className="w-4 h-4 mr-2" /> Sign In / Sign Up
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── PAGE CONTENT ── */}
            <main className={`relative z-10 bg-transparent ${isPublicPage ? 'pb-20' : 'pt-20'}`}>
                {children}
            </main>

            {/* ── FOOTER ── */}
            {isPublicPage && (
                <footer className="relative bg-[#040404] border-t border-white/[0.06] overflow-hidden">
                    {/* Top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

                    {/* BG accent */}
                    <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)' }}
                    />

                    <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">
                        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 mb-14">

                            {/* Brand col */}
                            <div className="sm:col-span-2 md:col-span-2">
                                <Logo variant="dark" size="sm" className="mb-5" />
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
                                    Your all-in-one growth partner for sales, marketing, and technology. Connect · Engage · Grow.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <a href="mailto:connect@eyepune.com" className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors">
                                        <span className="w-4 h-4 text-red-500">✉</span> connect@eyepune.com
                                    </a>
                                    
                                    <a href="tel:+919284712033" className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors">
                                        <span className="w-4 h-4 text-red-500">📱</span> +91 9284712033
                                    </a>

                                    <p className="flex items-center gap-2 text-gray-600">
                                        <span className="w-4 h-4 text-red-500">📍</span> Pune, Maharashtra, India
                                    </p>
                                </div>

                                {/* Social */}
                                <div className="flex gap-3 mt-6">
                                    {[
                                        { label: 'IG', href: 'https://instagram.com/eyepune' },
                                        { label: 'LI', href: 'https://linkedin.com/company/eyepune' },
                                        { label: 'WA', href: 'https://wa.me/919284712033' },
                                    ].map((s, i) => (
                                        <motion.a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                            whileHover={{ y: -3, scale: 1.1 }}
                                            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 text-xs font-bold transition-colors"
                                        >{s.label}</motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Link cols */}
                            {Object.entries(footerLinks).map(([heading, links]) => (
                                <div key={heading}>
                                    <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">{heading}</h4>
                                    <ul className="space-y-3">
                                        {links.map((link, i) => (
                                            <li key={i}>
                                                <Link href={createPageUrl(link.page)}
                                                    className="text-gray-500 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                                                >{link.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* CTA banner in footer */}
                        <div className="rounded-2xl bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-500/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10">
                            <div>
                                <p className="text-white font-bold text-lg">Ready to grow your business?</p>
                                <p className="text-gray-500 text-sm">Get a free AI-powered assessment today — no commitment.</p>
                            </div>
                            <Link href={createPageUrl("AI_Assessment")}>
                                <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-7 py-2.5 rounded-full font-bold whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex-shrink-0">
                                    Start Free Assessment →
                                </Button>
                            </Link>
                        </div>

                        {/* Bottom bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06] text-xs text-gray-600">
                            <p>© 2026 EyE PunE. All rights reserved.</p>
                            <div className="flex gap-6">
                                <Link href={createPageUrl("CMSPage") + "?slug=privacy-policy"} className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
                                <Link href={createPageUrl("CMSPage") + "?slug=terms-and-conditions"} className="hover:text-gray-400 transition-colors">Terms & Conditions</Link>
                                <Link href={createPageUrl("CMSPage") + "?slug=cookie-policy"} className="hover:text-gray-400 transition-colors">Cookie Policy</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default function Layout(props) {
    const isPublicPage = !props.currentPageName?.startsWith('Admin_') && !props.currentPageName?.startsWith('Client_');
    return (
        <ThemeProvider>
            <CustomCursor />
            <LayoutContent {...props} />
            <ChatbotWidget />
            {isPublicPage && <WhatsAppFloat />}
            {isPublicPage && <ExitIntentPopup />}
        </ThemeProvider>
    );
}
