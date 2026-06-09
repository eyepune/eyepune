import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ 
      success: false, 
      error: 'Missing Supabase credentials in .env' 
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const report = {
      tables: {},
      auth: {
        users_count: 0
      },
      connection: 'success'
    };

    // Check tables
    const tablesToCheck = ['users', 'leads', 'inquiries', 'ai_assessments', 'bookings', 'email_templates', 'email_sequences', 'campaigns'];
    
    for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('id').limit(1);
      report.tables[table] = error ? 'missing_or_error' : 'exists';
    }

    // Check users
    const { count, error: userError } = await supabase.from('users').select('id', { count: 'exact', head: true });
    report.auth.users_count = count || 0;

    // Check for admin
    const { count: adminCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin');
    report.auth.has_admin = (adminCount || 0) > 0;

    // Check Database Settings for Overrides
    const { data: dbSettings } = await supabase.from('system_settings').select('key, value');
    const dbLinkedIn = dbSettings?.find(s => s.key === 'linkedin_token' || s.key === 'linkedin_config')?.value;
    const dbZoho = dbSettings?.find(s => s.key === 'zoho_config' || s.key === 'zoho_token')?.value;

    // Check Zoho Configuration
    report.zoho = {
      configured: !!(process.env.ZOHO_REFRESH_TOKEN && process.env.ZOHO_MAIL_ACCOUNT_ID) || !!dbZoho,
      username: process.env.ZOHO_MAIL_USERNAME || 'connect@eyepune.com'
    };

    // Check LinkedIn Configuration
    report.linkedin = {
      configured: !!(process.env.LINKEDIN_ACCESS_TOKEN || process.env.LINKEDIN_CLIENT_ID) || !!dbLinkedIn,
    };

    // Check WhatsApp Configuration
    report.whatsapp = {
      configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID),
      admin_number: process.env.ADMIN_WHATSAPP_NUMBER ? '***' + process.env.ADMIN_WHATSAPP_NUMBER.slice(-4) : null,
    };

    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
