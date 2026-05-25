import puppeteer from 'puppeteer';
import fs from 'fs';

// ==========================================
// CONFIGURATION
// ==========================================
// 1. Get your li_at cookie from LinkedIn (F12 -> Application -> Cookies -> li_at)
const LI_AT_COOKIE = 'AQEDARz1NXIEewK9AAABnlyY-88AAAGegKV_z00AFAuV8mfvWiNi1I3CnCXjzJwJcI8kUNQ20S9szuok5gLRGIbjIoyxHjYrGR-n_q1Hv44KPRG9ayqRs155f5ZKJtpK5_zsGUl2JF5x4NjD4gIxEyLi'; 

// 2. Your target search URL (Targeting global founders, startups, and CEOs)
const SEARCH_URL = 'https://www.linkedin.com/search/results/people/?keywords=founder%20OR%20ceo%20OR%20startup';

// 3. Your EyE PunE Webhook URL (Make sure your Next.js app is running locally or deployed)
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/linkedin';

// ==========================================
// THE AUTOMATION SCRIPT
// ==========================================
async function runAutomation() {
    console.log('🤖 [EyE PunE Bot] Starting LinkedIn Automation...');

    if (LI_AT_COOKIE === 'YOUR_LI_AT_COOKIE_HERE') {
        console.error('❌ ERROR: You must add your li_at cookie to the script first!');
        process.exit(1);
    }

    // Launch visible browser for debugging
    const browser = await puppeteer.launch({ 
        headless: false, // Run visibly to see what's happening
        args: ['--no-sandbox', '--start-maximized'] 
    });
    
    const page = await browser.newPage();

    // Set the session cookie so we bypass login
    await page.setCookie({
        name: 'li_at',
        value: LI_AT_COOKIE,
        domain: '.www.linkedin.com',
        path: '/',
        httpOnly: true,
        secure: true
    });

    console.log('🔗 [EyE PunE Bot] Authenticated. Initializing session...');
    
    // Navigate to feed first to bypass LinkedIn's anti-bot redirect
    try {
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
        console.log('⚠️ Feed load timed out, but session should be active. Continuing...');
    }
    await new Promise(r => setTimeout(r, 4000)); // wait for session to stabilize

    console.log('🔎 [EyE PunE Bot] Navigating to search results...');
    // Go to the search page
    try {
        await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
        console.log('⚠️ Search load timed out, but continuing to extraction...');
    }

    // Wait for the results to load
    console.log('⏳ [EyE PunE Bot] Waiting for results to load...');
    await page.waitForSelector('.reusable-search__result-container, .search-result__wrapper', { timeout: 30000 }).catch(() => console.log('⚠️ No immediate results found or slow loading.'));

    // Scroll to the bottom to load all results on the page
    console.log('📜 [EyE PunE Bot] Scrolling to load profiles...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000)); // Wait for lazy load
    
    console.log('📸 [EyE PunE Bot] Taking a screenshot of what the bot sees (check debug.png)...');
    await page.screenshot({ path: 'debug.png', fullPage: true });

    // Scrape the data
    console.log('🔍 [EyE PunE Bot] Extracting leads...');
    const leads = await page.evaluate(() => {
        const results = [];
        // LinkedIn frequently changes classes. We check multiple possible containers.
        const profileCards = document.querySelectorAll('.reusable-search__result-container, .search-result__wrapper, li.reusable-search__result-container');
        
        profileCards.forEach(card => {
            // Find name
            const nameEl = card.querySelector('span[dir="ltr"] span[aria-hidden="true"]') 
                        || card.querySelector('.entity-result__title-text a span[dir="ltr"]');
            
            // Find headline
            const headlineEl = card.querySelector('.entity-result__primary-subtitle')
                            || card.querySelector('.search-result__truncate');
                            
            // Find link
            const linkEl = card.querySelector('.app-aware-link') 
                        || card.querySelector('.entity-result__title-text a');

            if (nameEl && linkEl) {
                results.push({
                    full_name: nameEl.innerText.trim(),
                    headline: headlineEl ? headlineEl.innerText.trim() : '',
                    linkedin_url: linkEl.href.split('?')[0], // Clean URL
                    source: 'eyepune_local_bot'
                });
            }
        });
        return results;
    });

    console.log(`🎯 [EyE PunE Bot] Found ${leads.length} leads! Sending to CRM...`);

    // Send each lead to the Webhook
    let successCount = 0;
    for (const lead of leads) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            });
            
            if (response.ok) {
                successCount++;
                console.log(`✅ Synced: ${lead.full_name}`);
            } else {
                console.log(`⚠️ Failed to sync: ${lead.full_name}`);
            }
        } catch (err) {
            console.error(`❌ Network error for ${lead.full_name}:`, err.message);
        }
        
        // Wait 1 second between webhooks to avoid hammering your server
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`🎉 [EyE PunE Bot] Finished! Successfully added ${successCount} leads to your CRM.`);
    
    await browser.close();
}

runAutomation().catch(console.error);
