'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/shared/Logo';
import {
    LayoutDashboard, Users, UserPlus, Mail, Star, Image as ImageIcon,
    FileText, LogOut, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/Admin_Dashboard', icon: LayoutDashboard },
    { name: 'CRM / Leads', href: '/Admin_CRM', icon: Users },
    { name: 'Email Marketing', href: '/Admin_EmailCampaigns', icon: Mail },
    { name: 'Testimonials', href: '/Admin_Testimonials', icon: Star },
    { name: 'Client Logos', href: '/Admin_ClientLogos', icon: ImageIcon },
    { name: 'Forms & Assessments', href: '/Admin_Forms', icon: FileText },
    { name: 'Admin Users', href: '/Admin_Users', icon: UserPlus },
];

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout(false);
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className={cn(
                "h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-[#070707] transition-all duration-300",
                collapsed ? "w-16" : "w-60"
            )}>
                {/* Logo */}
                <div className="px-4 py-5 border-b border-white/[0.06]">
                    <Logo variant="dark" size="sm" />
                    {!collapsed && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">Admin Panel</p>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                                    isActive
                                        ? "bg-red-500/10 text-red-500 font-medium"
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                                )}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle */}
                <div className="p-2 border-t border-white/[0.06]">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-400 hover:bg-white/[0.03] transition-all"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
                    </button>
                </div>

                {/* User / Logout */}
                <div className="p-3 border-t border-white/[0.06]">
                    {!collapsed && (
                        <div className="mb-2 px-2">
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            <p className="text-[10px] text-gray-600">Admin</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
