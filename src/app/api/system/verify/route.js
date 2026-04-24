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

    // Check Zoho Configuration
    report.zoho = {
      configured: !!(process.env.ZOHO_REFRESH_TOKEN && process.env.ZOHO_MAIL_ACCOUNT_ID),
      username: process.env.ZOHO_MAIL_USERNAME || 'connect@eyepune.com'
    };

    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
