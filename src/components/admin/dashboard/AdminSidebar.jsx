import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, FolderKanban, Calendar, Megaphone,
  FileText, Settings, LogOut, ExternalLink, TrendingUp, BookOpen, Receipt, Send
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/shared/Logo';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM & Sales', icon: TrendingUp },
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'content', label: 'Content & Blog', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ activeSection, onNavigate }) {
  return (
    <div className="w-60 h-full bg-[#070707] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Logo variant="dark" size="sm" />
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-1">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeSection === id
                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <Link
          href={createPageUrl('Home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View Website
        </Link>
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}