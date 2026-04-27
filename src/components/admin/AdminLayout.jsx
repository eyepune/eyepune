'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/shared/Logo';
import {
    LayoutDashboard, Users, UserPlus, Mail, Star, Image as ImageIcon,
    FileText, LogOut, ChevronLeft, ChevronRight, MessageSquare, Search, ShieldAlert,
    Bell, Settings, Menu, Beaker, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/Admin_Dashboard', icon: LayoutDashboard },
    { name: 'CRM / Leads', href: '/Admin_CRM', icon: Users },
    { name: 'Marketing & Automation', href: '/Admin_Marketing', icon: Mail },
    { name: 'WhatsApp Flows', href: '/Admin_WhatsAppMarketing', icon: MessageSquare },
    { name: 'Automation Lab', href: '/Admin_TestAutomation', icon: Beaker },
    { name: 'Documents', href: '/Admin_Documents', icon: FileText },
    { name: 'Testimonials', href: '/Admin_Testimonials', icon: Star },
    { name: 'Client Logos', href: '/Admin_ClientLogos', icon: ImageIcon },
    { name: 'Forms & Assessments', href: '/Admin_Forms', icon: FileText },
    { name: 'SEO Management', href: '/Admin_SEO', icon: Search },
    { name: 'Admin Users', href: '/Admin_Users', icon: UserPlus },
    { name: 'System Status', href: '/SystemStatus', icon: ShieldAlert },
];

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout(false);
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:relative z-50 h-screen flex flex-col bg-[#050505]/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ease-in-out",
                collapsed ? "w-20" : "w-64",
                mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/5 relative">
                    <div className="flex items-center gap-3">
                        <Logo variant="dark" size={collapsed ? "xs" : "sm"} />
                    </div>
                    {!collapsed && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "text-white bg-gradient-to-r from-red-600/10 to-transparent border border-red-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                                    isActive ? "text-red-500 scale-110" : "group-hover:scale-110 text-gray-500 group-hover:text-red-400"
                                )} />
                                {!collapsed && <span className="truncate">{item.name}</span>}
                                
                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-[#111] text-xs text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/5 space-y-2 bg-gradient-to-t from-black/50 to-transparent">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-4 h-4" /> Collapse Menu</>}
                    </button>
                    
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 z-10">
                {/* Top Navbar */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-[#050505]/60 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3" />
                            <input 
                                type="text" 
                                placeholder="Search leads, campaigns, users..." 
                                className="bg-[#111] border border-white/5 focus:border-red-500/30 rounded-full py-2 pl-10 pr-4 text-sm w-72 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#050505]" />
                        </button>
                        
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">{user?.full_name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <Avatar className="h-10 w-10 border border-white/10 group-hover:border-red-500/50 transition-colors">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback className="bg-red-500/10 text-red-500 font-bold">
                                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
