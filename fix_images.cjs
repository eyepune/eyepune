require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixDuplicateImages() {
    console.log('Fetching all blog posts to check for duplicate images...');
    
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, featured_image');

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    const seenImages = new Set();
    let updatedCount = 0;

    for (const post of posts) {
        if (!post.featured_image) continue;

        if (seenImages.has(post.featured_image)) {
            // This is a duplicate image! Let's generate a new unique URL for it.
            const uniqueSeed = Math.floor(Math.random() * 1000000);
            
            // If it's a pollinations URL, append/update the seed
            let newImageUrl = post.featured_image;
            if (newImageUrl.includes('pollinations.ai')) {
                if (newImageUrl.includes('?')) {
                    newImageUrl += `&seed=${uniqueSeed}`;
                } else {
                    newImageUrl += `?seed=${uniqueSeed}`;
                }
            } else {
                // If it's a static image, we'll assign a random fallback
                const fallbacks = [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
                ];
                newImageUrl = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            }

            console.log(`Fixing image for post: "${post.title}"`);
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ featured_image: newImageUrl })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating post ${post.id}:`, updateError.message);
            } else {
                updatedCount++;
                seenImages.add(newImageUrl);
            }
        } else {
            seenImages.add(post.featured_image);
        }
    }

    console.log(`Successfully fixed images for ${updatedCount} posts!`);
}

fixDuplicateImages();
