'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/shared/Logo';
import { 
    LayoutDashboard, 
    MessageSquare, 
    FolderKanban, 
    FileText, 
    BarChart3, 
    Settings, 
    LogOut, 
    Bell,
    Menu,
    ChevronLeft,
    ChevronRight,
    Star,
    Sparkles,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationCenter from "@/components/client/NotificationCenter";
import HeroFloatingIcons from '@/components/shared/HeroFloatingIcons';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/Client_Dashboard', icon: LayoutDashboard },
    { name: 'Campaigns & Reports', href: '/Client_Reports', icon: BarChart3 },
    { name: 'Project Files', href: '/Client_Files', icon: FolderKanban },
    { name: 'Documents', href: '/Client_Documents', icon: FileText },
    { name: 'Messages', href: '/Client_Messages', icon: MessageSquare },
    { name: 'Client Feedback', href: '/Client_Feedback', icon: Star },
];

export default function ClientLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout(false);
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden relative font-sans">
            {/* Elite Grid Background */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202] pointer-events-none" />
            
            {/* Subtle Command Center Background Icons */}
            <HeroFloatingIcons opacity={0.04} />

            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/[0.03] blur-[150px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/[0.03] blur-[120px] pointer-events-none" />

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:relative z-50 h-screen flex flex-col bg-[#050505]/60 backdrop-blur-3xl border-r border-white/[0.04] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                collapsed ? "w-20" : "w-72",
                mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className="h-24 flex items-center px-6 border-b border-white/[0.04] relative">
                    <div className="flex items-center gap-3">
                        <Logo variant="dark" size={collapsed ? "xs" : "sm"} />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "text-white bg-white/[0.04] shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-white/[0.06]"
                                        : "text-gray-500 hover:text-white hover:bg-white/[0.02] border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)]" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-all duration-500",
                                    isActive ? "text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" : "group-hover:scale-110 text-gray-600 group-hover:text-red-400"
                                )} />
                                {!collapsed && <span className="tracking-tight">{item.name}</span>}
                                
                                {collapsed && (
                                    <div className="absolute left-full ml-6 px-3 py-1.5 bg-[#0a0a0a] text-[11px] text-white rounded-lg border border-white/[0.08] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl font-bold uppercase tracking-widest">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Account Section */}
                <div className="p-6 border-t border-white/[0.04] space-y-3 bg-gradient-to-t from-black/20 to-transparent">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:rotate-[-10deg] transition-transform" />
                        {!collapsed && <span>Sign Out Portal</span>}
                    </button>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-[10px] uppercase font-black tracking-[0.2em] text-gray-700 hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-3 h-3" /> Minimize Sidebar</>}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 z-10">
                {/* Premium Top Bar */}
                <header className="h-24 flex items-center justify-between px-8 lg:px-12 border-b border-white/[0.04] bg-[#050505]/40 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <button 
                            className="lg:hidden p-3 -ml-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <div className="hidden sm:flex items-center gap-4">
                           <div className="flex -space-x-2">
                               {[1, 2, 3].map(i => (
                                   <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-red-600/20 flex items-center justify-center">
                                       <Sparkles className="w-3 h-3 text-red-500" />
                                   </div>
                               ))}
                           </div>
                           <span className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">EyE Vision Engine <span className="text-red-500/50">v4.4</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="hidden xl:flex items-center gap-4">
                            <Button 
                                variant="ghost" 
                                className="text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest px-4"
                                onClick={() => window.location.href = '/Booking'}
                            >
                                <Calendar className="w-4 h-4 mr-2" /> Vision Sync
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationCenter user={user} />
                            
                            <div className="h-10 w-px bg-white/[0.06] hidden sm:block" />
                            
                            <div className="flex items-center gap-4 cursor-pointer group">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors tracking-tight">{user?.full_name || 'Partner'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{user?.email}</p>
                                </div>
                                <Avatar className="h-12 w-12 border border-white/[0.08] ring-4 ring-transparent group-hover:ring-red-500/10 transition-all duration-500 scale-100 group-hover:scale-105">
                                    <AvatarImage src={user?.avatar_url} />
                                    <AvatarFallback className="bg-red-600/10 text-red-500 font-black text-lg">
                                        {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
