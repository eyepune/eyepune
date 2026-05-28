const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.vercel' });
require('dotenv').config({ path: '.env.local' });

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  console.log("Checking automation_logs...");
  const { data: autoLogs, error: autoError } = await supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (autoError) console.error("Error fetching automation_logs:", autoError.message);
  else console.log(JSON.stringify(autoLogs, null, 2));

  console.log("\nChecking activity_logs for linkedin_auto_post_failed...");
  const { data: actLogs, error: actError } = await supabase
    .from('activity_logs')
    .select('*')
    .in('action', ['linkedin_auto_post_failed', 'linkedin_auto_post_warning'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (actError) console.error("Error fetching activity_logs:", actError.message);
  else console.log(JSON.stringify(actLogs, null, 2));
}

checkLogs();
