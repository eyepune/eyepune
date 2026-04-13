'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AdminGuard({ children }) {
    const { user, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        You need admin privileges to access this page.
                    </p>
                    <Link href="/">
                        <Button className="bg-red-600 hover:bg-red-700">
                            Go to Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
