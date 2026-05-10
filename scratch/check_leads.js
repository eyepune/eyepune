
const { createClient } = require('@supabase/supabase-js');

// These should be in the environment or I can find them in the project
// I'll try to find the supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables not found.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log("Checking leads with source 'ai_assessment'...");
    const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('source', 'ai_assessment')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching leads:", error);
        return;
    }

    console.log(`Found ${count} leads from AI Assessment.`);
    if (data && data.length > 0) {
        console.log("Most recent lead:");
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log("No leads found with source 'ai_assessment'.");
    }
}

checkLeads();
