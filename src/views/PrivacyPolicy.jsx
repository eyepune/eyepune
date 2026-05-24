import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrivacyPolicy() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'privacy-policy'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'privacy-policy' });
            return pages.length > 0 ? pages[0] : null;
        },
        retry: 2,
    });

    useEffect(() => {
        if (page?.meta_title) {
            document.title = page.meta_title;
        }
    }, [page]);

    const hasDynamicContent = page && page.content;

    return (
        <div className="min-h-screen py-32 px-6 bg-transparent">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                    {page?.title || 'Privacy Policy'}
                </h1>
                
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full bg-white/5" />
                        <Skeleton className="h-6 w-full bg-white/5" />
                        <Skeleton className="h-6 w-3/4 bg-white/5" />
                    </div>
                ) : hasDynamicContent ? (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-300">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => <h1 className="text-3xl font-black text-white mt-10 mb-4 font-sans tracking-tight">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-sans tracking-tight">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-sans tracking-tight">{children}</h3>,
                                p: ({ children }) => <p className="mb-6 text-gray-300 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-300">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-4">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {page.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    // ── HARDCODED FALLBACK ──
                    <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                        <p className="text-xl text-gray-400 mb-8">Last updated: May 24, 2026</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Information We Collect</h2>
                        <p className="mb-6 leading-relaxed">At EyE PunE, we collect information that you provide directly to us, including when you create an account, request a proposal, or contact us for support. This may include your name, email address, phone number, and company details.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Your Information</h2>
                        <p className="mb-6 leading-relaxed">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Process transactions and send related information.</li>
                            <li>Send technical notices, updates, and support messages.</li>
                            <li>Communicate with you about products, services, offers, and events.</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Data Security</h2>
                        <p className="mb-6 leading-relaxed">We implement appropriate technical and organizational measures to maintain the safety of your personal information. However, please note that no method of transmission over the Internet is 100% secure.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Sharing of Information</h2>
                        <p className="mb-6 leading-relaxed">We do not share your personal information with third parties except as described in this privacy policy, such as with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Contact Us</h2>
                        <p className="mb-6 leading-relaxed">If you have any questions about this Privacy Policy, please contact us at privacy@eyepune.com.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
