import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cookies() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'cookie-policy'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'cookie-policy' });
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
                    {page?.title || 'Cookie Policy'}
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
                        <p className="text-xl text-gray-400 mb-8">Published Date: 22nd Nov 2022</p>
                        
                        <p className="mb-6 leading-relaxed">EyE PunE uses cookies and similar technologies to improve website functionality, analytics, and advertising performance.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. What Are Cookies?</h2>
                        <p className="mb-6 leading-relaxed">Cookies are small text files stored on your device that help improve browsing experience and website functionality.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Cookies</h2>
                        <p className="mb-4 leading-relaxed font-semibold">We may use cookies for:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Website analytics</li>
                            <li>Session management</li>
                            <li>Advertising optimization</li>
                            <li>Retargeting campaigns</li>
                            <li>Performance tracking</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Third-Party Cookies</h2>
                        <p className="mb-6 leading-relaxed">Third-party services such as Google Analytics, Meta Pixel, and advertising platforms may place cookies on your device.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Managing Cookies</h2>
                        <p className="mb-6 leading-relaxed">Users can disable or manage cookies through browser settings. Disabling cookies may affect certain website functionalities.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Contact Information</h2>
                        <p className="mb-2 leading-relaxed"><strong>EyE PunE</strong></p>
                        <p className="mb-2 leading-relaxed">Website: <a href="https://www.eyepune.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">https://www.eyepune.com</a></p>
                        <p className="mb-6 leading-relaxed">Email: <a href="mailto:connect@eyepune.com" className="text-red-400 hover:text-red-300">connect@eyepune.com</a></p>
                    </div>
                )}
            </div>
        </div>
    );
}
