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
        <div className="min-h-screen pt-32 pb-64 px-6 bg-transparent">
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
                            {page.content.replace(/Last Updated:/gi, 'Published Date:').replace(/Last Updated/gi, 'Published Date')}
                        </ReactMarkdown>
                    </div>
                ) : (
                    // ── HARDCODED FALLBACK ──
                    <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                        <p className="text-xl text-gray-400 mb-8">Published Date: 22nd Nov 2022</p>
                        
                        <p className="mb-6 leading-relaxed">EyE PunE respects your privacy and is committed to protecting your personal data.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Information We Collect</h2>
                        <p className="mb-4 leading-relaxed">We may collect:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Company/business details</li>
                            <li>Website information</li>
                            <li>Billing information</li>
                            <li>Marketing preferences</li>
                            <li>Device/browser information</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Information</h2>
                        <p className="mb-4 leading-relaxed">Your information may be used for:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Service delivery</li>
                            <li>Communication</li>
                            <li>Proposal generation</li>
                            <li>Marketing campaigns</li>
                            <li>Analytics & optimization</li>
                            <li>Customer support</li>
                            <li>Internal business operations</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Cookies & Tracking Technologies</h2>
                        <p className="mb-4 leading-relaxed">We may use:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Cookies</li>
                            <li>Meta Pixel</li>
                            <li>Google Analytics</li>
                            <li>Conversion tracking tools</li>
                            <li>CRM integrations</li>
                            <li>Retargeting technologies</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">These tools help improve user experience, advertising performance, and website functionality.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Data Sharing</h2>
                        <p className="mb-4 leading-relaxed">EyE PunE does not sell personal data.</p>
                        <p className="mb-6 leading-relaxed">Information may be shared with trusted third-party vendors, platforms, and service providers strictly for operational and service-related purposes.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Data Security</h2>
                        <p className="mb-6 leading-relaxed">We implement commercially reasonable security measures to protect user data. However, no online system can guarantee absolute security.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Third-Party Platforms</h2>
                        <p className="mb-4 leading-relaxed">Our website and services may integrate with:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Meta</li>
                            <li>Google</li>
                            <li>LinkedIn</li>
                            <li>YouTube</li>
                            <li>CRM platforms</li>
                            <li>Automation tools</li>
                            <li>Payment gateways</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">Users are subject to the respective policies of those third-party services.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">7. User Rights</h2>
                        <p className="mb-4 leading-relaxed">Users may request:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Data access</li>
                            <li>Data correction</li>
                            <li>Data deletion</li>
                            <li>Marketing opt-out</li>
                        </ul>
                        <p className="mb-6 leading-relaxed">by contacting EyE PunE directly at connect@eyepune.com.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">8. Policy Updates</h2>
                        <p className="mb-6 leading-relaxed">EyE PunE reserves the right to update this Privacy Policy at any time. Continued use of the website constitutes acceptance of updated policies.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
