const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalTest() {
    console.log('--- TABLE: blog_posts ---');
    const { data: blogs, error: bErr } = await supabase.from('blog_posts').select('id, title, status, slug');
    if (bErr) console.error(bErr); else console.log(blogs);

    console.log('\n--- RLS POLICIES ---');
    const { data: policies, error: pErr } = await supabase.rpc('get_policies_for_table', { table_name: 'blog_posts' });
    if (pErr) {
        // Fallback check via raw query if rpc doesn't exist
        const { data: rawP, error: rErr } = await supabase.from('pg_policies').select('*').eq('tablename', 'blog_posts');
        if (rErr) console.log('Could not fetch policies via SDK'); else console.log(rawP);
    } else {
        console.log(policies);
    }
}

finalTest();
