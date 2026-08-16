import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request) {
    try {
        const body = await request.json();
        const { variant_id, page_url } = body;

        if (!variant_id || !page_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() { return []; },
                setAll() { },
            },
        });

        // Increment the pageviews for this specific variant
        const { error } = await supabase.rpc('increment_seo_variant_view', {
            v_id: variant_id
        });

        if (error) {
            // Fallback if RPC isn't set up yet: we can just fetch and update
            const { data: variant, error: fetchError } = await supabase
                .from('seo_experiments')
                .select('pageviews')
                .eq('id', variant_id)
                .single();
                
            if (!fetchError && variant) {
                await supabase
                    .from('seo_experiments')
                    .update({ pageviews: variant.pageviews + 1 })
                    .eq('id', variant_id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking SEO view:', error);
        return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }
}
