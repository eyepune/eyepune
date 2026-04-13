import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback logos when no logos are in the database
const FALLBACK_LOGOS = [
    { id: '1', company_name: 'TechCorp', logo_url: 'https://ui-avatars.com/api/?name=TC&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 1 },
    { id: '2', company_name: 'InnovateCo', logo_url: 'https://ui-avatars.com/api/?name=IC&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 2 },
    { id: '3', company_name: 'GrowthLab', logo_url: 'https://ui-avatars.com/api/?name=GL&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 3 },
    { id: '4', company_name: 'PixelForge', logo_url: 'https://ui-avatars.com/api/?name=PF&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 4 },
    { id: '5', company_name: 'DataSync', logo_url: 'https://ui-avatars.com/api/?name=DS&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 5 },
    { id: '6', company_name: 'CloudNine', logo_url: 'https://ui-avatars.com/api/?name=CN&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 6 },
    { id: '7', company_name: 'NexGen', logo_url: 'https://ui-avatars.com/api/?name=NG&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 7 },
    { id: '8', company_name: 'SwiftOps', logo_url: 'https://ui-avatars.com/api/?name=SO&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 8 },
];

export default function ClientLogos() {
    const { data: logos = [], isLoading } = useQuery({
        queryKey: ['client-logos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('client_logos')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) {
                console.warn('Failed to fetch client logos:', error.message);
                return [];
            }
            return data || [];
        },
    });

    // Use fetched logos if available, otherwise use fallback
    const displayLogos = logos.length > 0 ? logos : FALLBACK_LOGOS;

    // Triple logos for truly seamless infinite scrolling
    const duplicatedLogos = [...displayLogos, ...displayLogos, ...displayLogos];

    return (
        <section className="py-16 bg-muted/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Trusted by Leading Brands</h2>
                    <p className="text-muted-foreground">Empowering businesses across industries</p>
                </div>
                <div className="relative">
                    <div className="flex animate-scroll">
                        {duplicatedLogos.map((logo, index) => (
                            <div
                                key={`${logo.id}-${index}`}
                                className="flex-shrink-0 mx-6 group"
                            >
                                {logo.website_url ? (
                                    <a
                                        href={logo.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="w-32 h-32 flex items-center justify-center p-4 rounded-lg bg-background border hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                            <img
                                                src={logo.logo_url}
                                                alt={logo.company_name}
                                                className="max-w-full max-h-full object-contain transition-all"
                                            />
                                        </div>
                                    </a>
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center p-4 rounded-lg bg-background border hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                        <img
                                            src={logo.logo_url}
                                            alt={logo.company_name}
                                            className="max-w-full max-h-full object-contain transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.333%);
                    }
                }
                .animate-scroll {
                    animation: scroll 20s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
