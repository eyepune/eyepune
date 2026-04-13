'use client';

import { usePathname } from 'next/navigation';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PageNotFound() {
    const pathname = usePathname();

    const { data: user } = useQuery({
        queryKey: ['current-user-404'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch {
                return { user: null, isAuthenticated: false };
            }
        },
    });

    return (
        <div className="min-h-screen bg-[#040404] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="text-8xl font-black text-red-500/20 mb-4">404</div>
                <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-gray-500 mb-8">
                    The page <code className="text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded text-sm">{pathname}</code> doesn't exist.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/">
                        <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full px-6">
                            <Home className="w-4 h-4 mr-2" /> Go Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="border-white/10 text-gray-300 rounded-full px-6"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
