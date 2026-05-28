require('dotenv').config({ path: '.env.vercel' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Fetching schema for blog_posts...");
    const { data, error } = await supabase.from('blog_posts').select('*').limit(1);
    if (error) {
        console.error("Error fetching schema:", error);
    } else if (data && data.length > 0) {
        console.log("\n✅ SUCCESS: Found existing blog post. Available columns:");
        console.log(Object.keys(data[0]).join('\n- '));
    } else {
        console.log("No data found in blog_posts. Attempting to fetch column info via REST...");
    }
}

checkSchema();
