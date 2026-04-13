import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

export default function CMSPage() {
    const location = useLocation();
    const slug = new URLSearchParams(location.search).get('slug');

    const { data: page, isLoading, error } = useQuery({
        queryKey: ['cms-page', slug],
        queryFn: async () => {
            const pages = await base44.entities.CMS_Page.filter({ slug });
            return pages.length > 0 ? pages[0] : null;
        },
        enabled: !!slug,
    });

    useEffect(() => {
        if (page?.meta_title) {
            document.title = page.meta_title;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && page.meta_description) {
                metaDescription.setAttribute('content', page.meta_description);
            }
        }
    }, [page]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-12 w-3/4 mb-8" />
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-6 w-full mb-4" />
                </div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen pt-8 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                    <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-8 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error Loading Page</h1>
                    <p className="text-muted-foreground">Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
                            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                            li: ({ children }) => <li className="mb-2">{children}</li>,
                            a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {page.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}