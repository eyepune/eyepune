import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function Disclaimer() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'disclaimer'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'disclaimer' });
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
                    {page?.title || 'Disclaimer'}
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
                        
                        <p className="mb-6 leading-relaxed">All services provided by EyE PunE are based on professional expertise, industry practices, and strategic recommendations.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Performance Disclaimers</h2>
                        <p className="mb-6 leading-relaxed">EyE PunE does not guarantee:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Specific revenue outcomes</li>
                            <li>Search engine rankings</li>
                            <li>Viral social media performance</li>
                            <li>Platform approvals</li>
                            <li>Guaranteed lead generation</li>
                            <li>Platform stability or uptime</li>
                        </ul>
                        
                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">External Variables</h2>
                        <p className="mb-6 leading-relaxed">Results vary depending on:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Budget</li>
                            <li>Competition</li>
                            <li>Audience behavior</li>
                            <li>Market conditions</li>
                            <li>Platform algorithms</li>
                            <li>Client responsiveness</li>
                        </ul>
                        
                        <p className="mb-6 leading-relaxed font-semibold text-gray-400">All content and information provided on this website are for general informational purposes only.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
