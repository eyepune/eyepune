import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixMissingImages() {
    console.log("Fetching blog posts with missing images...");
    
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published');

    if (error) {
        console.error("Error fetching posts:", error.message);
        return;
    }

    let updatedCount = 0;

    for (const post of posts) {
        if (!post.featured_image || post.featured_image === '' || post.featured_image.includes('images.unsplash.com')) {
            console.log(`Fixing image for: "${post.title}"`);
            
            const imagePrompt = `Hyper-realistic futuristic digital art. Theme: ${post.title}. Aesthetic: Sleek high-tech dark mode with red neon accents`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=512&nologo=true`;
            
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ featured_image: imageUrl })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Failed to update post ${post.id}:`, updateError.message);
            } else {
                console.log(`✅ Successfully updated image for: "${post.title}"`);
                updatedCount++;
            }
        }
    }

    if (updatedCount === 0) {
        console.log("No posts found that need their image fixed.");
    } else {
        console.log(`\nDone! Successfully fixed ${updatedCount} blog posts.`);
    }
}

fixMissingImages();
