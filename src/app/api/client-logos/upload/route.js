import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
}

const STORAGE_BUCKET = 'client-logos';

// POST — Upload a logo image to Supabase Storage
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Allowed: PNG, JPG, GIF, WebP, SVG' }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    // Ensure bucket exists
    const admin = getAdminClient();
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.id === STORAGE_BUCKET);

    if (!bucketExists) {
      const { error: createError } = await admin.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: allowedTypes,
      });
      if (createError) {
        console.warn('Bucket creation warning:', createError.message);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `logos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = admin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return Response.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
