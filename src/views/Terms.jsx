import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function Terms() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'terms-and-conditions'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'terms-and-conditions' });
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
                    {page?.title || 'Terms & Conditions'}
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
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Agreement to Terms</h2>
                        <p className="mb-6 leading-relaxed">By accessing or using our services at EyE PunE, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Services</h2>
                        <p className="mb-6 leading-relaxed">EyE PunE provides digital marketing, web development, AI automation, and business growth solutions. We reserve the right to modify or discontinue any part of our services without prior notice.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Client Responsibilities</h2>
                        <p className="mb-6 leading-relaxed">Clients agree to provide accurate information, cooperate with our team, and adhere to agreed-upon timelines. Failure to do so may result in project delays or termination of services.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Intellectual Property</h2>
                        <p className="mb-6 leading-relaxed">Unless otherwise stated, EyE PunE and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Limitation of Liability</h2>
                        <p className="mb-6 leading-relaxed">In no event shall EyE PunE, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
