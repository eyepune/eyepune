import { createClient } from '@supabase/supabase-js';

// Helper to fetch the active A/B tested SEO variant from Supabase on the server
export async function getActiveSEOVariant(pageUrl) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        return null;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Ensure pageUrl is formatted correctly (e.g. '/' or '/About')
        const formattedUrl = pageUrl === '' || pageUrl === '/' ? '/' : `/${pageUrl.replace(/^\/+/, '')}`;
        
        const { data: variants, error } = await supabase
            .from('seo_experiments')
            .select('*')
            .eq('page_url', formattedUrl);

        if (error || !variants || variants.length === 0) {
            return null;
        }

        // Randomly select one variant (50/50 chance if there's a champion and challenger)
        // Note: For SSR, this random selection means each server render could get a different one.
        // It's perfectly fine for A/B testing on the server.
        const selectedVariant = variants[Math.floor(Math.random() * variants.length)];

        return {
            id: selectedVariant.id,
            title: selectedVariant.title,
            description: selectedVariant.description
        };
    } catch (e) {
        console.error('Error fetching SEO variant on server:', e);
        return null;
    }
}
