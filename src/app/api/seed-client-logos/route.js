import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// Default client logos to seed — replace with your actual client names & logo URLs
const SEED_LOGOS = [
  {
    company_name: 'TechCorp Solutions',
    logo_url: 'https://ui-avatars.com/api/?name=TC&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://techcorp.example.com',
    is_active: true,
    display_order: 1,
  },
  {
    company_name: 'InnovateCo',
    logo_url: 'https://ui-avatars.com/api/?name=IC&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://innovateco.example.com',
    is_active: true,
    display_order: 2,
  },
  {
    company_name: 'GrowthLab Digital',
    logo_url: 'https://ui-avatars.com/api/?name=GL&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://growthlab.example.com',
    is_active: true,
    display_order: 3,
  },
  {
    company_name: 'PixelForge Studios',
    logo_url: 'https://ui-avatars.com/api/?name=PF&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://pixelforge.example.com',
    is_active: true,
    display_order: 4,
  },
  {
    company_name: 'DataSync Analytics',
    logo_url: 'https://ui-avatars.com/api/?name=DS&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://datasync.example.com',
    is_active: true,
    display_order: 5,
  },
  {
    company_name: 'CloudNine Systems',
    logo_url: 'https://ui-avatars.com/api/?name=CN&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://cloudnine.example.com',
    is_active: true,
    display_order: 6,
  },
  {
    company_name: 'NexGen Innovations',
    logo_url: 'https://ui-avatars.com/api/?name=NG&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://nexgen.example.com',
    is_active: true,
    display_order: 7,
  },
  {
    company_name: 'SwiftOps Technologies',
    logo_url: 'https://ui-avatars.com/api/?name=SO&background=1a1a2e&color=e94560&size=200&font-size=0.35&bold=true',
    website_url: 'https://swiftops.example.com',
    is_active: true,
    display_order: 8,
  },
];

// POST — Seed client logos into the database
// Usage: POST /api/seed-client-logos
// Optional body: { "logos": [...] } to use custom logos instead of defaults
// Set ?clear=true to delete existing logos before seeding
export async function POST(request) {
  try {
    const admin = getAdminClient();
    const results = { seeded: 0, skipped: 0, cleared: 0, errors: [] };

    // Check if clear flag is set
    const url = new URL(request.url);
    const shouldClear = url.searchParams.get('clear') === 'true';

    if (shouldClear) {
      const { error: deleteError } = await admin
        .from('client_logos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

      if (deleteError) {
        results.errors.push({ step: 'clear', message: deleteError.message });
      } else {
        results.cleared = true;
      }
    }

    // Get custom logos from request body, or use defaults
    let logosToSeed = SEED_LOGOS;
    try {
      const body = await request.json();
      if (body.logos && Array.isArray(body.logos)) {
        logosToSeed = body.logos;
      }
    } catch {
      // No body or invalid JSON — use defaults
    }

    // Check which logos already exist (by company_name)
    const { data: existingLogos, error: fetchError } = await admin
      .from('client_logos')
      .select('company_name');

    if (fetchError) {
      throw new Error(`Failed to fetch existing logos: ${fetchError.message}`);
    }

    const existingNames = new Set((existingLogos || []).map(l => l.company_name));

    // Filter out logos that already exist
    const newLogos = logosToSeed.filter(logo => {
      if (existingNames.has(logo.company_name)) {
        results.skipped++;
        return false;
      }
      return true;
    });

    // Insert new logos
    if (newLogos.length > 0) {
      const { data: inserted, error: insertError } = await admin
        .from('client_logos')
        .insert(newLogos)
        .select();

      if (insertError) {
        results.errors.push({ step: 'insert', message: insertError.message });
      } else {
        results.seeded = inserted?.length || 0;
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${results.seeded} logos, skipped ${results.skipped} existing${results.cleared ? ', cleared previous data' : ''}`,
      results,
    });
  } catch (error) {
    console.error('Seed client logos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET — Preview what would be seeded (dry run)
export async function GET() {
  try {
    const admin = getAdminClient();

    const { data: existingLogos, error } = await admin
      .from('client_logos')
      .select('company_name, display_order, is_active');

    if (error) throw error;

    const existingNames = new Set((existingLogos || []).map(l => l.company_name));
    const newLogos = SEED_LOGOS.filter(l => !existingNames.has(l.company_name));

    return Response.json({
      existingCount: existingLogos?.length || 0,
      existingLogos: existingLogos || [],
      wouldSeed: newLogos.length,
      seedLogos: newLogos,
      note: 'POST to /api/seed-client-logos to seed. Add ?clear=true to replace existing. Send body { "logos": [...] } for custom data.',
    });
  } catch (error) {
    console.error('Seed preview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
