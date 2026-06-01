"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, ShieldAlert, Settings, LogOut, Search, Bell, Database, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

export default function LexProClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const isPublicPage = pathname === '/lex-pro' || pathname === '/lex-pro/login';
    const [isLoading, setIsLoading] = useState(!isPublicPage);

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

    useEffect(() => {
        if (!isPublicPage && supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                    router.push('/lex-pro/login');
                } else {
                    setIsLoading(false);
                }
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!session) {
                    router.push('/lex-pro/login');
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [isPublicPage, router, supabase]);

    const handleSignOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
            router.push('/lex-pro/login');
        }
    };

    const navItems = [
        { name: 'Dashboard', href: '/lex-pro/dashboard', icon: LayoutDashboard },
        { name: 'Drafting', href: '/lex-pro/draft', icon: FileText },
        { name: 'Knowledge Base', href: '/lex-pro/knowledge', icon: BookOpen },
        { name: 'Bulk Engine', href: '/lex-pro/bulk', icon: Database },
        { name: 'Risk Analysis', href: '/lex-pro/analyze', icon: ShieldAlert },
        { name: 'Settings', href: '/lex-pro/settings', icon: Settings },
    ];

    if (isPublicPage) {
        return <div className="bg-[#0A0F1C] min-h-screen font-sans text-gray-100">{children}</div>;
    }

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-[#0A0F1C] flex flex-col items-center justify-center text-blue-500">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Loading workspace...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0A0F1C] text-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-blue-900/30 bg-[#0D1425] flex flex-col h-full hidden md:flex">
                <div className="p-6">
                    <Link href="/lex-pro/dashboard" className="flex items-center">
                        <img src="/lexpro-logo.png" alt="LexPro Logo" className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]" />
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors group cursor-pointer">
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-blue-900/30">
                    <div onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-black/0 to-black/0 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600/10 via-black/0 to-black/0 translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Topbar */}
                <header className="h-20 border-b border-blue-900/30 bg-[#0A0F1C]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder="Search contracts, clauses..." 
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-blue-500/10 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-slate-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-[#0A0F1C] flex items-center justify-center">
                                <span className="text-blue-400 text-sm font-bold">EP</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                    {children}
                </div>
            </main>
        </div>
    );
}
