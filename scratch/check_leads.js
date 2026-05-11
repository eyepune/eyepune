const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// These should be in the environment or I can find them in the project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables not found. Make sure you have a .env file in the root directory.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log("Checking leads with source 'ai_assessment'...");
    try {
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

        // Also check ai_assessments table
        console.log("\nChecking ai_assessments table...");
        const { data: assessments, error: aError } = await supabase
            .from('ai_assessments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (aError) {
            console.error("Error fetching assessments:", aError);
        } else if (assessments && assessments.length > 0) {
            console.log("Most recent assessment:");
            console.log(JSON.stringify(assessments[0], null, 2));
        } else {
            console.log("No assessments found.");
        }
    } catch (err) {
        console.error("Critical error:", err);
    }
}

checkLeads();
