require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const puppeteer = require('puppeteer-core');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials in .env or .env.local file.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function scrapeGoogleForLeads() {
    console.log("🚀 STARTING GOOGLE AI LEAD SCRAPER (Bypassing GitHub limits) 🚀");

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new" // Run silently in the background
    });

    const page = await browser.newPage();
    
    // Fake human user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // We use a Google dork to find SaaS founders on LinkedIn who posted their gmail
    const searchQuery = encodeURIComponent('site:linkedin.com/in/ "SaaS founder" "@gmail.com"');
    const url = `https://www.google.com/search?q=${searchQuery}&num=20`;

    console.log("[Bot] Navigating to Google Search...");
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("[Bot] Extracting Founders and Emails...");

    const leads = await page.evaluate(() => {
        const results = [];
        const blocks = document.querySelectorAll('div.g');
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

        blocks.forEach(block => {
            const titleEl = block.querySelector('h3');
            const snippetEl = block.querySelector('div.VwiC3b');
            
            if (titleEl && snippetEl) {
                const rawTitle = titleEl.innerText;
                const snippet = snippetEl.innerText;

                // Extract Name from "John Doe - SaaS Founder - LinkedIn"
                let name = rawTitle.split('-')[0].trim();
                if (name.includes('LinkedIn')) name = name.replace('LinkedIn', '').trim();

                // Extract Email
                let email = null;
                const emailMatch = snippet.match(emailRegex);
                if (emailMatch) email = emailMatch[0];

                if (email && name) {
                    results.push({ name, email, bio: snippet });
                }
            }
        });
        return results;
    });

    await browser.close();

    console.log(`✅ Found ${leads.length} direct email addresses from Google! Injecting into CRM...`);

    let addedCount = 0;
    for (const lead of leads) {
        const newLead = {
            full_name: lead.name,
            email: lead.email,
            company: 'SaaS Founder (From Google)',
            source: 'social_media',
            status: 'new',
            notes: `Auto-generated via Google Search X-Ray.\nSnippet: ${lead.bio}`,
            score: 75
        };

        const { data: existing } = await supabase.from('leads').select('id').eq('email', lead.email).single();
        
        if (existing) {
            console.log(`[Bot] Skipped ${lead.email} (Already in CRM)`);
        } else {
            const { error } = await supabase.from('leads').insert([newLead]);
            if (error) {
                console.error(`❌ Failed to insert ${lead.name}:`, error.message);
            } else {
                console.log(`🎯 SUCCESS: Added ${lead.name} (${lead.email})!`);
                addedCount++;
            }
        }
    }

    console.log(`\n🎉 DONE! Injected ${addedCount} brand new founders into your Admin CRM.`);
}

scrapeGoogleForLeads();
