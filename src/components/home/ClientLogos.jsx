import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback logos using actual client names — displayed when DB has no logos
const FALLBACK_LOGOS = [
    { id: '1', company_name: 'Astroden Observatory', logo_url: '/logos/astroden.png', website_url: null, is_active: true, display_order: 1 },
    { id: '2', company_name: 'Dashes N Hyphens', logo_url: '/logos/dashes-n-hyphens.png', website_url: null, is_active: true, display_order: 2 },
    { id: '3', company_name: 'Body Perfect & Smile Lounge', logo_url: '/logos/body-perfect.png', website_url: null, is_active: true, display_order: 3 },
    { id: '4', company_name: 'Beyond Borders', logo_url: 'https://ui-avatars.com/api/?name=BB&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: 'https://www.beyondborders.shop/', is_active: true, display_order: 4 },
    { id: '5', company_name: 'Lalithya', logo_url: 'https://ui-avatars.com/api/?name=L&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: 'https://www.lalithya.com', is_active: true, display_order: 5 },
    { id: '6', company_name: 'CloudNine Systems', logo_url: 'https://ui-avatars.com/api/?name=CN&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 6 },
    { id: '7', company_name: 'NexGen Innovations', logo_url: 'https://ui-avatars.com/api/?name=NG&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 7 },
    { id: '8', company_name: 'SwiftOps', logo_url: 'https://ui-avatars.com/api/?name=SO&background=1a1a2e&color=e94560&size=128&font-size=0.4', website_url: null, is_active: true, display_order: 8 },
];

export default function ClientLogos() {
    const { data: logos = [], isLoading } = useQuery({
        queryKey: ['client-logos'],
        queryFn: async () => {
            try {
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
            } catch (err) {
                console.warn('Client logos fetch error:', err);
                return [];
            }
        },
    });

    // Use fetched logos if available, otherwise use fallback
    const displayLogos = logos.length > 0 ? logos : FALLBACK_LOGOS;

    // Triple logos for truly seamless infinite scrolling
    const duplicatedLogos = [...displayLogos, ...displayLogos, ...displayLogos];

    return (
        <div className="w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-10">
                <p className="text-center text-gray-500 text-sm tracking-[0.3em] uppercase font-medium">
                    Trusted by Leading Brands
                </p>
            </div>
            <div className="relative group">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#040404] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#040404] to-transparent z-10 pointer-events-none" />

                <div className="flex logo-scroll-track">
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.id}-${index}`}
                            className="flex-shrink-0 mx-8 group/logo"
                        >
                            {logo.website_url ? (
                                <a
                                    href={logo.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <div className="w-28 h-28 flex items-center justify-center p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300 group-hover/logo:scale-105">
                                        <img
                                            src={logo.logo_url}
                                            alt={logo.company_name}
                                            className="max-w-full max-h-full object-contain opacity-60 hover:opacity-90 transition-opacity duration-300 filter brightness-0 invert"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </a>
                            ) : (
                                <div className="w-28 h-28 flex items-center justify-center p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300 group-hover/logo:scale-105">
                                    <img
                                        src={logo.logo_url}
                                        alt={logo.company_name}
                                        className="max-w-full max-h-full object-contain opacity-60 hover:opacity-90 transition-opacity duration-300 filter brightness-0 invert"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
