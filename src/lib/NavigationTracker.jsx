'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function NavigationTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    useEffect(() => {
        const pageName = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        const activityData = {
            activity_type: 'page_view',
            page_name: pageName || 'Home',
            metadata: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        if (user) {
            activityData.user_email = user.email;
        }

        supabase.entities.UserActivity.create(activityData).catch(() => {});
    }, [pathname, searchParams, user]);

    return null;
}
