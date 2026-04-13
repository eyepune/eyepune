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

// POST — Run the migration to set up RLS policies and storage bucket
export async function POST() {
  const results = [];

  try {
    const admin = getAdminClient();

    // 1. Create storage bucket
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.id === 'client-logos');

    if (!bucketExists) {
      const { error: bucketError } = await admin.storage.createBucket('client-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif',
          'image/webp',
          'image/svg+xml'
        ],
      });

      if (bucketError) {
        results.push({ step: 'create_bucket', status: 'error', message: bucketError.message });
      } else {
        results.push({ step: 'create_bucket', status: 'success', message: 'Storage bucket "client-logos" created' });
      }
    } else {
      results.push({ step: 'create_bucket', status: 'skipped', message: 'Storage bucket "client-logos" already exists' });
    }

    // 2. Note about RLS policies — these need to be run in the SQL editor
    results.push({
      step: 'rls_policies',
      status: 'manual',
      message: 'RLS policies for client_logos table need to be applied via the Supabase SQL Editor. See migration file: supabase/migrations/003_client_logos_admin_policies.sql'
    });

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ error: error.message, results }, { status: 500 });
  }
}
