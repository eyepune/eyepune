import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get('page');

    if (!pageUrl) {
        return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return []; },
            setAll() { },
        },
    });

    try {
        // Fetch all variants for this page
        const { data: variants, error } = await supabase
            .from('seo_experiments')
            .select('*')
            .eq('page_url', pageUrl);

        if (error || !variants || variants.length === 0) {
            return NextResponse.json({ fallback: true });
        }

        // Randomly select one variant (50/50 chance if there's a champion and challenger)
        const selectedVariant = variants[Math.floor(Math.random() * variants.length)];

        return NextResponse.json({
            id: selectedVariant.id,
            title: selectedVariant.title,
            description: selectedVariant.description
        });
    } catch (e) {
        return NextResponse.json({ fallback: true });
    }
}
