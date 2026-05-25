require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function removeDuplicates() {
    console.log('Fetching all blog posts...');
    
    // Fetch all blog posts
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: true }); // Oldest first, so we keep the first one

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    console.log(`Found ${posts.length} total posts.`);

    const seenTitles = new Set();
    const duplicateIds = [];

    posts.forEach(post => {
        // Normalize title to check for duplicates (lowercase, trim)
        const normalizedTitle = post.title.trim().toLowerCase();
        
        if (seenTitles.has(normalizedTitle)) {
            duplicateIds.push(post.id);
        } else {
            seenTitles.add(normalizedTitle);
        }
    });

    if (duplicateIds.length === 0) {
        console.log('No duplicate blogs found!');
        return;
    }

    console.log(`Found ${duplicateIds.length} duplicate blogs. Deleting...`);

    // Delete the duplicates
    const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .in('id', duplicateIds);

    if (deleteError) {
        console.error('Error deleting duplicates:', deleteError.message);
    } else {
        console.log(`Successfully deleted ${duplicateIds.length} duplicate blogs!`);
    }
}

removeDuplicates();
