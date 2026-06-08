'use client';

import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ChatbotFunnelSection from '@/components/admin/dashboard/ChatbotFunnelSection';

export default function Admin_Chatbot() {
    return (
        <AdminGuard>
            <AdminLayout>
                <ChatbotFunnelSection />
            </AdminLayout>
        </AdminGuard>
    );
}
