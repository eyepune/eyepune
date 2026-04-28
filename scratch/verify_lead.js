const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestLead() {
    console.log('--- Verifying Test Lead Capture ---');
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('email', 'test.lead@eyepune.com')
        .single();

    if (error) {
        console.error('Error fetching lead:', error.message);
    } else if (data) {
        console.log('✅ Lead found successfully!');
        console.log('Full Name:', data.full_name);
        console.log('Email:', data.email);
        console.log('Phone:', data.phone);
        console.log('Notes:', data.notes);
        console.log('Source:', data.source);
    } else {
        console.log('❌ Lead not found.');
    }
}

checkTestLead();
