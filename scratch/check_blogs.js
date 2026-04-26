const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBlogs() {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, status, published_date');
    
    if (error) {
        console.error('Error fetching blogs:', error);
    } else {
        console.log('Found blogs:', data);
    }
}

checkBlogs();
