import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Category-based default images from Unsplash
const CATEGORY_IMAGES = {
    social_media: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=630&fit=crop',
    web_development: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
    ai_automation: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    branding: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=1200&h=630&fit=crop',
    business_growth: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    case_studies: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop',
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all blog posts
        const allPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 500);

        // --- STEP 1: Find duplicates by title (case-insensitive normalized) ---
        const seenTitles = new Map(); // normalized title -> best post id
        const toDelete = [];

        for (const post of allPosts) {
            const normalizedTitle = (post.title || '').toLowerCase().trim().replace(/\s+/g, ' ');
            if (!normalizedTitle) continue;

            if (seenTitles.has(normalizedTitle)) {
                // Keep the one with a featured image, or the newer one
                const existingId = seenTitles.get(normalizedTitle);
                const existing = allPosts.find(p => p.id === existingId);
                
                if (!existing?.featured_image && post.featured_image) {
                    // Current post is better — delete the existing one, keep current
                    toDelete.push(existingId);
                    seenTitles.set(normalizedTitle, post.id);
                } else {
                    // Existing is fine — delete current
                    toDelete.push(post.id);
                }
            } else {
                seenTitles.set(normalizedTitle, post.id);
            }
        }

        // Also check by slug
        const seenSlugs = new Map();
        const survivingPosts = allPosts.filter(p => !toDelete.includes(p.id));
        for (const post of survivingPosts) {
            const slug = (post.slug || '').toLowerCase().trim();
            if (!slug) continue;
            if (seenSlugs.has(slug)) {
                const existingId = seenSlugs.get(slug);
                const existing = survivingPosts.find(p => p.id === existingId);
                if (!existing?.featured_image && post.featured_image) {
                    toDelete.push(existingId);
                    seenSlugs.set(slug, post.id);
                } else {
                    toDelete.push(post.id);
                }
            } else {
                seenSlugs.set(slug, post.id);
            }
        }

        // Deduplicate delete list
        const uniqueToDelete = [...new Set(toDelete)];

        // Delete duplicates
        let deleted = 0;
        for (const id of uniqueToDelete) {
            await base44.asServiceRole.entities.BlogPost.delete(id);
            deleted++;
        }

        // --- STEP 2: Fix missing images ---
        const remainingPosts = allPosts.filter(p => !uniqueToDelete.includes(p.id));
        let imagesFixed = 0;

        for (const post of remainingPosts) {
            if (!post.featured_image || post.featured_image.trim() === '') {
                const img = CATEGORY_IMAGES[post.category] || CATEGORY_IMAGES.default;
                await base44.asServiceRole.entities.BlogPost.update(post.id, { featured_image: img });
                imagesFixed++;
            }
        }

        return Response.json({
            success: true,
            total_posts: allPosts.length,
            duplicates_deleted: deleted,
            images_fixed: imagesFixed,
            remaining: remainingPosts.length,
        });

    } catch (error) {
        console.error('cleanupBlogs error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});