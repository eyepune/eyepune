require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixSpecificImage() {
    console.log('Targeting the duplicate Unsplash image...');

    const newImageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000'; // High tech circuit image

    const { data, error } = await supabase
        .from('blog_posts')
        .update({ featured_image: newImageUrl })
        .eq('title', 'AI Automation: How Pune Businesses are Scaling 10x with EyE PunE')
        .select();

    if (error) {
        console.error('Failed to update:', error.message);
    } else {
        console.log(`Success! Replaced duplicate image for: ${data[0]?.title}`);
    }
}

fixSpecificImage();
