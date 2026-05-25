import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const { data: autoLogs, error: autoError } = await supabase
            .from('automation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        const { data: actLogs, error: actError } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        const { data: blogPosts, error: blogError } = await supabase
            .from('blog_posts')
            .select('id, title, status, published_date, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        const { data: syncConfig, error: syncError } = await supabase
            .from('crm_sync_configs')
            .select('*')
            .eq('provider', 'linkedin_config');

        return NextResponse.json({
            success: true,
            autoLogs: autoLogs || [],
            autoError: autoError ? autoError.message : null,
            actLogs: actLogs || [],
            actError: actError ? actError.message : null,
            blogPosts: blogPosts || [],
            blogError: blogError ? blogError.message : null,
            syncConfig: syncConfig || []
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
