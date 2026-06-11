require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials in .env or .env.local file.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Search Query (Targeting founders who explicitly wrote their email in their bio)
const GITHUB_SEARCH_URL = 'https://api.github.com/search/users?q=founder+saas+"gmail.com"+in:readme,bio';
const TARGET_LEAD_COUNT = 25; // Keep small to avoid 60/hr rate limits

async function generateFreeLeads() {
    console.log("🚀 STARTING FREE GITHUB LEAD GENERATOR 🚀");
    console.log(`Searching for: SaaS Founders with public contact info...`);

    try {
        // Prepare headers (Use Token if available to bypass rate limits)
        const headers = {
            'User-Agent': 'EyE-PunE-Lead-Gen-Bot',
            'Accept': 'application/vnd.github.v3+json'
        };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // 1. Search for users
        const { data: searchData } = await axios.get(GITHUB_SEARCH_URL, { headers });

        const users = searchData.items.slice(0, TARGET_LEAD_COUNT);
        console.log(`✅ Found ${searchData.total_count} matching founders! Extracting...`);

        let newLeadsCount = 0;
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

        // 2. Fetch detailed profiles to get emails
        for (const user of users) {
            try {
                // If using a token, we don't need to pause as long! 5000/hr limit.
                const delay = process.env.GITHUB_TOKEN ? 500 : 1500;
                await new Promise(r => setTimeout(r, delay));

                let email = null;
                let name = user.login;
                let company = 'Independent Founder';
                let bio = '';

                // Try fetching the profile first
                const { data: profileData } = await axios.get(user.url, { headers });

                name = profileData.name || name;
                company = profileData.company ? profileData.company.replace('@', '') : company;
                bio = profileData.bio || '';
                email = profileData.email;

                // If not in the official email field, regex search their bio/company field!
                if (!email && bio) {
                    const bioMatch = bio.match(emailRegex);
                    if (bioMatch) email = bioMatch[0];
                }
                
                if (!email && profileData.company) {
                    const compMatch = profileData.company.match(emailRegex);
                    if (compMatch) email = compMatch[0];
                }

                // If STILL no email, we must skip
                if (!email) {
                    console.log(`[Bot] Skipped ${user.login} (No email found in profile or commits)`);
                    continue;
                }
                
                // 3. Inject into Supabase CRM
                const newLead = {
                    full_name: name,
                    email: email,
                    company: company,
                    source: 'manual', // or custom source
                    status: 'new',
                    notes: `Auto-generated from GitHub.\nBio: ${bio}\nProfile: ${profileData.html_url}`,
                    score: 60 // Base score for SaaS founders
                };

                // Check if email already exists in CRM
                const { data: existing } = await supabase.from('leads').select('id').eq('email', email).single();
                
                if (existing) {
                    console.log(`[Bot] Skipped ${email} (Already in CRM)`);
                } else {
                    const { error } = await supabase.from('leads').insert([newLead]);
                    if (error) throw error;
                    
                    console.log(`🎯 SUCCESS: Added ${name} (${email}) from ${company}!`);
                    newLeadsCount++;
                }

            } catch (err) {
                if (err.response && err.response.status === 403) {
                    console.log("🛑 GitHub Rate Limit Reached! Try again in 1 hour.");
                    break;
                }
                console.log(`[Bot] Error fetching user ${user.login}: ${err.message}`);
            }
        }

        console.log(`\n🎉 Lead Generation Complete! Injected ${newLeadsCount} new founders directly into your Admin Dashboard CRM.`);

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

generateFreeLeads();
