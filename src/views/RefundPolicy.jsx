import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function RefundPolicy() {
    const { data: page, isLoading } = useQuery({
        queryKey: ['cms-page', 'refund-policy'],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug: 'refund-policy' });
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
                    {page?.title || 'Refund & Cancellation Policy'}
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
                        <p className="text-xl text-gray-400 mb-8">Last Updated: 22nd Nov 2022</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Service Payments</h2>
                        <p className="mb-6 leading-relaxed">All retainers, consulting fees, milestone payments, and project charges are non-refundable once work has commenced.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Advertising Spend</h2>
                        <p className="mb-6 leading-relaxed">Advertising budgets paid to Meta, Google, LinkedIn, YouTube, or other advertising platforms are non-refundable under any circumstances.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Subscription & Retainer Services</h2>
                        <p className="mb-6 leading-relaxed">Monthly retainers automatically renew unless cancelled in writing prior to the next billing cycle.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Cancellation Notice</h2>
                        <p className="mb-6 leading-relaxed">Clients must provide written notice before cancellation. Work completed up to the cancellation date remains fully billable.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Project Delays</h2>
                        <p className="mb-6 leading-relaxed">EyE PunE is not responsible for delays caused by delayed approvals, missing assets, delayed communication, platform-related issues, or third-party service interruptions.</p>
                        
                        <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Chargebacks & Payment Disputes</h2>
                        <p className="mb-6 leading-relaxed">Unauthorized chargebacks or payment disputes may result in immediate service suspension, legal recovery action, or termination of services.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
