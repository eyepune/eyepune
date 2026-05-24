'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, X, LayoutDashboard, LogOut, LogIn, ChevronDown, Bot, 
    Home as HomeIcon, Briefcase, Tag, BookOpen, Users, Mail, Sparkles, Calendar,
    Instagram, Linkedin, MessageCircle, Target, Phone, MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Logo from "@/components/shared/Logo";
import { ThemeProvider, useTheme } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import ExitIntentPopup from "@/components/shared/ExitIntentPopup";
import CustomCursor from "@/components/shared/CustomCursor";
import HeroFloatingIcons from "@/components/shared/HeroFloatingIcons";

const footerLinks = {
    Services: [
        { name: 'Social Media Management', page: 'Service-SocialMedia' },
        { name: 'Website Development', page: 'Service-WebDev' },
        { name: 'AI Automation', page: 'Service-AI' },
        { name: 'Google & Meta Ads', page: 'Service-PaidAds' },
        { name: 'Branding & Design', page: 'Service-Branding' },
        { name: 'Sales Funnels', page: 'Service-Funnels' },
    ],
    Company: [
        { name: 'About Us', page: 'About' },
        { name: 'Blog', page: 'Blog' },
        { name: 'Testimonials', page: 'Testimonials' },
        { name: 'Contact', page: 'Contact' },
    ],
    'Get Started': [
        { name: 'Free AI Assessment', page: 'AI-Assessment' },
        { name: 'Book Consultation', page: 'Booking' },
        { name: 'Pricing', page: 'Pricing' },
    ],
    Solutions: [
        { name: 'For Founders', page: 'Solution-Founders' },
        { name: 'For YouTubers', page: 'Solution-YouTubers' },
        { name: 'For Startups', page: 'Solution-Startups' },
        { name: 'B2B Growth Engine', page: 'Solution-B2BGrowth' },
        { name: 'AI Intelligence Hub', page: 'AI-Intelligence-Hub' },
    ],
};

const publicNavLinks = [
    { name: 'Home', page: 'Home', icon: HomeIcon },
    { name: 'Services', page: 'Services-Detail', icon: Briefcase, subLinks: footerLinks.Services },
    { name: 'Solutions', page: 'Solution-B2BGrowth', icon: Target, subLinks: footerLinks.Solutions },
    { name: 'Pricing', page: 'Pricing', icon: Tag },
    { name: 'Blog', page: 'Blog', icon: BookOpen },
    { name: 'About', page: 'About', icon: Users },
];

const adminNavLinks = [
    { name: 'Dashboard', page: 'Admin-Dashboard' },
    { name: 'Users', page: 'Admin-Users' },
    { name: 'CRM', page: 'Admin-CRM' },
    { name: 'CRM Sync', page: 'Admin-CRMSync' },
    { name: 'Sales Metrics', page: 'Admin-SalesMetrics' },
    { name: 'Sales AI', page: 'Admin-SalesAssistant' },
    { name: 'WhatsApp', page: 'Admin-WhatsAppSetup' },
    { name: 'Package Builder', page: 'Admin-PackageBuilder' },
    { name: 'Projects', page: 'Admin-Projects' },
    { name: 'Documents', page: 'Admin-Documents' },
    { name: 'Templates', page: 'Admin-Templates' },
    { name: 'PM', page: 'Admin-ProjectManagement' },
    { name: 'Blog', page: 'Admin-Blog' },
    { name: 'Testimonials', page: 'Admin-Testimonials' },
    { name: 'Feedback', page: 'Admin-Feedback' },
    { name: 'Reports', page: 'Admin-Reports' },
    { name: 'CMS', page: 'Admin-CMS' },
    { name: 'Marketing', page: 'Admin-Marketing' },
    { name: 'Email Templates', page: 'Admin-EmailTemplates' },
    { name: 'Analytics', page: 'Admin-Analytics' },
    { name: 'SEO', page: 'Admin-SEO' },
    { name: 'Automation Lab', page: 'Admin-TestAutomation' },

    { name: 'Service Add-ons', page: 'Admin-ServiceAddons' },
    { name: 'Outreach', page: 'Admin-Outreach' },
];

const clientNavLinks = [
    { name: 'Dashboard', page: 'Client-Dashboard' },
    { name: 'My Portal', page: 'Client-Portal' },
];

function LayoutContent({ children, currentPageName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    // Scroll to top on every page navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [currentPageName]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const { user } = useAuth();

    const isAdminPage = currentPageName?.startsWith('Admin-');
    const isClientPage = currentPageName?.startsWith('Client-');

    // Activity logging is now handled by NavigationTracker to avoid redundancy

    let navLinks = publicNavLinks;
    if (isAdminPage) navLinks = adminNavLinks;
    else if (isClientPage) navLinks = clientNavLinks;

    const isPublicPage = !isAdminPage && !isClientPage;

    return (
        <div className="min-h-screen bg-transparent text-white relative">
            {/* Global Elegant Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-[#030000] to-[#010000] z-[-1]">
                <div className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-800/10 rounded-full blur-[80px] md:blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/5 rounded-full blur-[80px] md:blur-[150px]" />
                <HeroFloatingIcons opacity={1} />
            </div>

            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled || mobileMenuOpen
                    ? 'bg-black border-b border-white/[0.06] shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo — only show on public pages */}
                        {!isAdminPage && !isClientPage && (
                        <Link href={createPageUrl("Home")} className="flex-shrink-0 flex flex-col justify-center">
                            <Logo variant="dark" size="sm" />
                            <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-red-500 font-bold mt-1 pl-1">Connect · Engage · Grow</span>
                        </Link>
                        )}
                        {(isAdminPage || isClientPage) && (
                        <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase">{isAdminPage ? 'Admin Panel' : 'Client Command Center'}</span>
                        )}

                        {/* Desktop nav — public */}
                        {isPublicPage && (
                            <div className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <div key={link.page} className="relative group/nav">
                                        <Link
                                            href={createPageUrl(link.page)}
                                            className={`group relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 text-[13px] xl:text-sm font-medium rounded-full transition-all ${
                                                currentPageName === link.page
                                                    ? 'text-white bg-white/[0.07]'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            {link.icon && <link.icon className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${currentPageName === link.page ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'}`} />}
                                            {link.name}
                                            {link.subLinks && <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover/nav:-rotate-180 transition-transform duration-300" />}
                                            {currentPageName === link.page && (
                                                <motion.span
                                                    layoutId="nav-indicator"
                                                    className="absolute inset-0 rounded-full bg-white/[0.07] -z-10"
                                                />
                                            )}
                                        </Link>
                                        {link.subLinks && (
                                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 transform translate-y-2 group-hover/nav:translate-y-0">
                                                <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-2 w-64 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                                    {link.subLinks.map(subLink => (
                                                        <Link 
                                                            key={subLink.page}
                                                            href={createPageUrl(subLink.page)}
                                                            className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                                        >
                                                            {subLink.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}



                        {/* Right actions */}
                        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                            {isPublicPage && (
                                <>
                                    {user && (
                                        <Link href={createPageUrl(user.role === 'admin' ? "Admin-Dashboard" : "Client-Dashboard")}>
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full text-sm">Dashboard</Button>
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link href={createPageUrl("Admin-Dashboard")}>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full w-9 h-9">
                                                <LayoutDashboard className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href={createPageUrl("AI-Assessment")}>
                                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                            <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all">
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
                                        <button aria-label="Open User Menu" className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-500 text-white flex items-center justify-center text-sm font-bold ring-2 ring-red-500/20 hover:ring-red-500/50 transition-all">
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
                                    className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 rounded-full border border-white/10 hover:border-white/25 text-gray-400 hover:text-white text-[13px] xl:text-sm transition-all"
                                >
                                    <LogIn className="w-4 h-4" /> Sign In / Sign Up
                                </button>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
                            className="lg:hidden bg-black border-b border-white/[0.06] max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar"
                        >
                                <div className="px-4 sm:px-6 py-6 space-y-1.5">
                                {navLinks.map((link) => (
                                    <div key={link.page}>
                                        <div className="flex items-center">
                                            <Link
                                                href={createPageUrl(link.page)}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex-1 block py-3.5 px-5 rounded-xl text-base font-bold transition-all active:scale-[0.98] ${
                                                    currentPageName === link.page
                                                        ? 'text-white bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                {link.name}
                                            </Link>
                                            {link.subLinks && (
                                                <button 
                                                    onClick={() => setExpandedMobileMenu(expandedMobileMenu === link.name ? null : link.name)}
                                                    className="p-4 ml-1 text-gray-400 hover:text-white rounded-xl active:bg-white/5 transition-colors"
                                                >
                                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileMenu === link.name ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {link.subLinks && expandedMobileMenu === link.name && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-6 pr-4 py-1 space-y-1 border-l border-white/5 ml-4 mb-2">
                                                        {link.subLinks.map(subLink => (
                                                            <Link
                                                                key={subLink.page}
                                                                href={createPageUrl(subLink.page)}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="block py-2 px-4 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                            >
                                                                {subLink.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                                <div className="pt-4 space-y-3">
                                    {isPublicPage && (
                                        <Link href={createPageUrl("AI-Assessment")} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl py-5 font-bold">
                                                <Bot className="w-4 h-4 mr-2" /> Free AI Assessment
                                            </Button>
                                        </Link>
                                    )}
                                    {user ? (
                                        <>
                                            <Link href={createPageUrl(user.role === 'admin' ? "Admin-Dashboard" : "Client-Dashboard")} onClick={() => setMobileMenuOpen(false)}>
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
            <main className={`relative z-10 bg-transparent ${isPublicPage ? '' : 'pt-20'}`}>
                {children}
            </main>

            {/* ── FOOTER ── */}
            {isPublicPage && (
                <footer className="relative z-30 bg-transparent border-t border-white/[0.06] overflow-hidden">
                    {/* Top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

                    {/* BG accent */}
                    <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)' }}
                    />

                    {/* Newsletter Capture Section for Content Marketing Strategy */}
                    <div className="border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-md">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                    <h3 className="text-2xl md:text-3xl font-black mb-3 text-white">Join the Growth Insider</h3>
                                    <p className="text-gray-400 text-sm md:text-base max-w-md">
                                        Get exclusive AI automation strategies, SEO tips, and marketing funnels delivered straight to your inbox weekly.
                                    </p>
                                </div>
                                <form className="flex flex-col sm:flex-row gap-3 max-w-md md:ml-auto w-full mx-auto md:mx-0" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email address" 
                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors text-center sm:text-left"
                                        required
                                    />
                                    <Button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 h-auto rounded-xl font-bold transition-all w-full sm:w-auto">
                                        Subscribe
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 relative z-10">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12 mb-14 text-center sm:text-left">

                            {/* Brand col */}
                            <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-center sm:items-start">
                                <div className="mb-5 flex flex-col items-center sm:items-start">
                                    <Logo variant="dark" size="sm" />
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-red-500 font-bold mt-2">Connect · Engage · Grow</span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
                                    Pune-based all-in-one growth partner serving clients across the globe.
                                </p>
                                <div className="space-y-3 text-sm flex flex-col items-center sm:items-start mt-4">
                                    <a href="mailto:connect@eyepune.com" className="flex items-center gap-3 text-gray-600 hover:text-red-400 transition-colors py-1 group">
                                        <Mail className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors shrink-0" />
                                        <span>connect@eyepune.com</span>
                                    </a>
                                    
                                    <a href="tel:+919284712033" className="flex items-center gap-3 text-gray-600 hover:text-red-400 transition-colors py-1 group">
                                        <Phone className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors shrink-0" />
                                        <span>+91 9284712033</span>
                                    </a>

                                    <p className="flex items-center gap-3 text-gray-600 py-1">
                                        <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>Pune, India · Serving Globally</span>
                                    </p>
                                </div>

                                {/* Social */}
                                <div className="flex gap-4 mt-6 justify-center sm:justify-start">
                                    {[
                                        { icon: Instagram, href: 'https://instagram.com/eyepune', color: 'hover:text-pink-500', label: 'Instagram' },
                                        { icon: Linkedin, href: 'https://linkedin.com/company/eyepune', color: 'hover:text-blue-500', label: 'LinkedIn' },
                                        { icon: MessageCircle, href: 'https://wa.me/919284712033', color: 'hover:text-emerald-500', label: 'WhatsApp' },
                                    ].map((s, i) => (
                                        <motion.a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                            aria-label={`Follow us on ${s.label}`}
                                            whileHover={{ y: -3, scale: 1.1 }}
                                            className={cn(
                                                "w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 transition-all",
                                                s.color,
                                                "hover:bg-white/[0.08] hover:border-white/20"
                                            )}
                                        >
                                            <s.icon className="w-5 h-5" />
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Link cols */}
                            {Object.entries(footerLinks).map(([heading, links]) => (
                                <div key={heading} className="flex flex-col items-center sm:items-start">
                                    <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">{heading}</h4>
                                    <ul className="space-y-3 flex flex-col items-center sm:items-start">
                                        {links.map((link, i) => (
                                            <li key={i}>
                                                <Link href={createPageUrl(link.page)}
                                                    className="text-gray-500 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block py-1"
                                                >{link.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* CTA banner in footer */}
                        <div className="rounded-2xl bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-500/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                            <div>
                                <p className="text-white font-bold text-xl md:text-2xl mb-1">Ready to grow your business?</p>
                                <p className="text-gray-400 text-sm md:text-base">Get a free AI-powered strategy assessment today — no commitment.</p>
                            </div>
                            <Link href={createPageUrl("AI-Assessment")} className="w-full md:w-auto">
                                <Button className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-6 rounded-xl font-bold whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex-shrink-0 text-lg">
                                    Start Free Assessment →
                                </Button>
                            </Link>
                        </div>

                        {/* Bottom bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06] text-xs md:text-sm text-gray-500">
                            <p>© {new Date().getFullYear()} EyE PunE. All rights reserved.</p>
                            <div className="flex flex-wrap justify-center gap-4 md:gap-6 relative z-50 pointer-events-auto">
                                <Link href="/privacy-policy" className="relative z-50 pointer-events-auto hover:text-gray-300 transition-colors py-1 cursor-pointer">Privacy Policy</Link>
                                <Link href="/terms-and-conditions" className="relative z-50 pointer-events-auto hover:text-gray-300 transition-colors py-1 cursor-pointer">Terms & Conditions</Link>
                                <Link href="/cookie-policy" className="relative z-50 pointer-events-auto hover:text-gray-300 transition-colors py-1 cursor-pointer">Cookie Policy</Link>
                                <Link href="/refund-policy" className="relative z-50 pointer-events-auto hover:text-gray-300 transition-colors py-1 cursor-pointer">Refund Policy</Link>
                                <Link href="/disclaimer" className="relative z-50 pointer-events-auto hover:text-gray-300 transition-colors py-1 cursor-pointer">Disclaimer</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default function Layout(props) {
    const isPublicPage = !props.currentPageName?.startsWith('Admin-') && !props.currentPageName?.startsWith('Client-');
    return (
        <ThemeProvider>
            <CustomCursor />
            <LayoutContent {...props} />
            {isPublicPage && <WhatsAppFloat />}
            {isPublicPage && <ExitIntentPopup />}
        </ThemeProvider>
    );
}
