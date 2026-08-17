import { createClient } from '@supabase/supabase-js';

// Helper to fetch the active A/B tested SEO variant from Supabase on the server
export async function getActiveSEOVariant(pageUrl, userAgent = '') {
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

        // --- CRAWLER DETECTION (CRITICAL FOR AEO & SEO) ---
        // If a known bot is crawling, ALWAYS serve the control/champion variant (variants[0]) deterministically.
        // This prevents indexing instability where Google/Perplexity sees different metadata on each crawl.
        const isBot = /bot|crawler|spider|crawling|google|bing|yandex|baidu|duckduck|teoma|slurp|chatgpt|perplexity|claude|anthropic|cohere/i.test(userAgent);

        let selectedVariant;
        if (isBot) {
            // Deterministic selection for bots
            selectedVariant = variants[0];
        } else {
            // Randomly select one variant for real human users (A/B testing)
            selectedVariant = variants[Math.floor(Math.random() * variants.length)];
        }

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
