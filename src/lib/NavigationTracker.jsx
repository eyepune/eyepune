'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';

export default function NavigationTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const pageName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
            base44.entities.UserActivity.create({
                user_email: user.email,
                activity_type: 'page_view',
                page_name: pageName || 'Home',
            }).catch(() => {});
        }
    }, [pathname, searchParams, user]);

    return null;
}
