require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkImages() {
    console.log('Fetching all blog posts...');
    
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, featured_image');

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    console.log(`Found ${posts.length} posts. Listing their current image URLs:`);

    for (const post of posts) {
        console.log(`\nTitle: ${post.title}`);
        console.log(`Image URL: ${post.featured_image || 'NULL (Using Frontend Fallback)'}`);
    }
}

checkImages();
