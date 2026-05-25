import fs from 'fs';

// ==========================================
// CONFIGURATION (DANGER ZONE)
// ==========================================
// 1. Your li_at cookie (Already loaded)
const LI_AT_COOKIE = 'AQEDARz1NXIEewK9AAABnlyY-88AAAGegKV_z00AFAuV8mfvWiNi1I3CnCXjzJwJcI8kUNQ20S9szuok5gLRGIbjIoyxHjYrGR-n_q1Hv44KPRG9ayqRs155f5ZKJtpK5_zsGUl2JF5x4NjD4gIxEyLi';

// 2. Your JSESSIONID cookie (Required for Voyager API requests to bypass CSRF)
// Go to LinkedIn -> F12 -> Application -> Cookies -> JSESSIONID. 
// Make sure to include the quote marks if they are there, e.g., "ajax:5305141940149021932"
const JSESSIONID = 'ajax:3903874925643026609';

const KEYWORDS = 'founder OR ceo OR startup';
// Pointing to local server which is connected to your live DB
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/linkedin';

// ==========================================
// THE VOYAGER API ENGINE
// ==========================================
async function scrapeVoyagerAPI() {
    console.log("🚀 [EyE PunE Voyager API] Initializing silent connection to LinkedIn servers...");

    if (JSESSIONID === 'YOUR_JSESSIONID_HERE') {
        console.error("❌ ERROR: You must provide your JSESSIONID to bypass LinkedIn's API Security.");
        process.exit(1);
    }

    // Clean the JSESSIONID for the CSRF token header
    const csrfToken = JSESSIONID.replace(/"/g, '');

    // We must perfectly spoof a Chrome browser header to not get instantly banned
    const headers = {
        'accept': 'application/vnd.linkedin.normalized+json+2.1',
        'accept-language': 'en-US,en;q=0.9',
        'csrf-token': csrfToken,
        'cookie': `li_at=${LI_AT_COOKIE}; JSESSIONID=${JSESSIONID};`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-li-lang': 'en_US',
        'x-restli-protocol-version': '2.0.0'
    };

    // The raw GraphQL search query LinkedIn uses internally
    const url = `https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:GLOBAL_SEARCH_HEADER,query:(keywords:${encodeURIComponent(KEYWORDS)},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0`;

    try {
        console.log(`🔎 [EyE PunE] Firing GraphQL request for keywords: ${KEYWORDS}...`);
        const response = await fetch(url, { headers, method: 'GET' });

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status}`);
            const text = await response.text();
            console.error("LinkedIn rejected the API call. Usually this means the JSESSIONID is wrong or the queryId is outdated.\nResponse:", text.substring(0, 300));
            return;
        }

        const data = await response.json();

        const leads = [];

        // Parse the encrypted GraphQL response structure
        const elements = data.included || [];
        for (const item of elements) {
            // Find items that represent user profiles
            if (item.title && item.title.text && item.navigationUrl && item.navigationUrl.includes('/in/')) {
                leads.push({
                    full_name: item.title.text,
                    headline: item.primarySubtitle ? item.primarySubtitle.text : 'LinkedIn Member',
                    linkedin_url: item.navigationUrl.split('?')[0],
                    source: 'eyepune_voyager_api'
                });
            }
        }

        // Deduplicate
        const uniqueLeads = Array.from(new Map(leads.map(l => [l.linkedin_url, l])).values());

        console.log(`🎯 [EyE PunE] Stealth Extraction complete. Found ${uniqueLeads.length} leads.`);

        if (uniqueLeads.length === 0) {
            console.log("⚠️ No leads found. The GraphQL schema might have changed or there are no results.");
            return;
        }

        let successCount = 0;
        for (const lead of uniqueLeads) {
            try {
                const res = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lead)
                });
                
                if (res.ok) {
                    successCount++;
                } else {
                    const errText = await res.text();
                    console.error(`⚠️ Webhook rejected ${lead.full_name}. Status: ${res.status}. Error:`, errText);
                }
            } catch (e) {
                console.error(`⚠️ Failed to sync ${lead.full_name}:`, e.message);
            }
        }

        console.log(`✅ [EyE PunE] Successfully injected ${successCount} leads directly into your CRM!`);

    } catch (e) {
        console.error("❌ Fatal Error in API:", e);
    }
}

scrapeVoyagerAPI();
