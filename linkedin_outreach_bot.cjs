const puppeteer = require('puppeteer-core');
const axios = require('axios');

// Configuration
const CHROME_DEBUG_PORT = 9222;
const MAX_REQUESTS_PER_DAY = 15; // KEEP THIS LOW TO AVOID BANS!
// The exact LinkedIn search URL to use. 
// Pro Tip: Go to LinkedIn, apply your exact ICP filters (e.g., 2nd Degree connections, Industry: Software Development, Title: Founder), and paste the URL here.
const SEARCH_URL = "https://www.linkedin.com/search/results/people/?keywords=B2B%20SaaS%20Founder&network=%5B%22S%22%5D&origin=FACETED_SEARCH";

// The personalized message template
const MESSAGE_TEMPLATE = `Hi {name},\n\nI loved coming across your profile. I run an AI Growth Agency (EyE PunE) building sub-second digital infrastructure for B2B brands. I'm looking to connect with fellow visionary tech founders.\n\nWould love to stay in touch!\n\nBest,\nAditya`;

/**
 * Helper to pause execution for a random time to mimic human behavior
 */
const randomDelay = async (minSeconds, maxSeconds) => {
    const ms = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
    console.log(`[Bot] Sleeping for ${ms / 1000} seconds to mimic human behavior...`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function runOutreach() {
    console.log("🚀 STARTING FREE LINKEDIN OUTREACH BOT 🚀");
    console.log("⚠️ WARNING: Keep your daily limit under 20 requests to avoid being banned.");

    let browser;
    try {
        let webSocketDebuggerUrl;
        try {
            // 1. Get the WebSocket URL (Try 127.0.0.1 first)
            const { data } = await axios.get(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version`);
            webSocketDebuggerUrl = data.webSocketDebuggerUrl;
        } catch (e) {
            // Try localhost (IPv6 issue with Node.js)
            const { data } = await axios.get(`http://localhost:${CHROME_DEBUG_PORT}/json/version`);
            webSocketDebuggerUrl = data.webSocketDebuggerUrl;
        }

        // 2. Connect Puppeteer to your existing Chrome browser
        browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl,
            defaultViewport: null
        });

        console.log("✅ Successfully connected to your local Chrome instance.");
        const page = await browser.newPage();
        await page.bringToFront();

        // 3. Navigate to LinkedIn Search
        console.log(`[Bot] Navigating to ICP Search URL...`);
        await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
        
        // Wait longer to ensure React renders the list
        await randomDelay(6, 10);

        let requestsSent = 0;

        // 4. Find all "Connect" buttons on the page (faster and broader DOM scan)
        const buttonsHandle = await page.evaluateHandle(() => {
            const allElements = document.querySelectorAll('button, a, div[role="button"], span');
            return Array.from(allElements).filter(el => {
                const text = (el.innerText || el.textContent || '').trim().toLowerCase();
                const aria = (el.getAttribute('aria-label') || '').toLowerCase();
                
                // If it's a span, it must be inside a button
                if (el.tagName === 'SPAN' && !el.closest('button') && !el.closest('a')) return false;
                
                return text === 'connect' || aria.includes('connect');
            });
        });

        const connectButtons = [];
        const properties = await buttonsHandle.getProperties();
        for (const property of properties.values()) {
            const element = property.asElement();
            if (element) connectButtons.push(element);
        }
        
        if (connectButtons.length === 0) {
            console.log(`[Bot] Found 0 connections. `);
            console.log(`      -> Did you log in to LinkedIn in this window?`);
            console.log(`      -> Are the buttons on the screen "Follow" instead of "Connect"? (Many founders use Creator Mode)`);
        } else {
            console.log(`[Bot] Found ${connectButtons.length} potential connections on this page.`);
        }

        for (const button of connectButtons) {
            if (requestsSent >= MAX_REQUESTS_PER_DAY) {
                console.log("🛑 Daily limit reached. Stopping safely.");
                break;
            }

            try {
                // Get the person's name from the aria-label
                const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), button);
                if (!ariaLabel) continue;
                
                const name = ariaLabel.replace('Invite ', '').replace(' to connect', '').split(' ')[0]; // Get first name

                console.log(`[Bot] Attempting to connect with: ${name}`);

                // Scroll the button into the center of the screen to avoid sticky headers
                await page.evaluate(b => b.scrollIntoView({block: 'center', inline: 'center'}), button);
                await randomDelay(1, 2);
                
                // Click the "Connect" button using native click
                await button.click();
                
                // Explicitly wait for the modal to pop up
                let modalAppeared = true;
                try {
                    await page.waitForSelector('div[role="dialog"]', { timeout: 4000 });
                } catch(e) {
                    modalAppeared = false;
                }
                
                if (!modalAppeared) {
                    // Sometimes LinkedIn instantly sends the request without a modal!
                    // Let's check if the button changed to "Pending"
                    try {
                        const newText = await page.evaluate(el => (el.innerText || '').trim().toLowerCase(), button);
                        if (newText === 'pending') {
                            requestsSent++;
                            console.log(`✅ Sent request ${requestsSent}/${MAX_REQUESTS_PER_DAY} to ${name}! (Instantly sent without modal)`);
                            await randomDelay(60, 120); 
                            continue; // Move to next person
                        } else {
                            throw new Error(`Modal didn't appear, and button text became "${newText}". It might be blocked or redirecting.`);
                        }
                    } catch (err) {
                        throw new Error(`Modal didn't appear and button lost from DOM.`);
                    }
                }
                
                await randomDelay(1, 3);

                // Handle the connection modal
                const modalButtons = await page.$$('div[role="dialog"] button');
                let addNoteBtn = null;
                let sendBtn = null;

                for (const mBtn of modalButtons) {
                    const txt = await page.evaluate(el => (el.innerText || el.textContent || '').trim().toLowerCase(), mBtn);
                    const aria = await page.evaluate(el => (el.getAttribute('aria-label') || '').toLowerCase(), mBtn);
                    
                    if (txt.includes('note') || aria.includes('note')) addNoteBtn = mBtn;
                    if (txt.includes('send') || aria.includes('send')) sendBtn = mBtn;
                }

                // If LinkedIn allows a note, add it
                if (addNoteBtn) {
                    await addNoteBtn.click();
                    await randomDelay(1, 3);
                    
                    const personalizedMessage = MESSAGE_TEMPLATE.replace('{name}', name);
                    const textArea = await page.waitForSelector('textarea[name="message"]', { timeout: 5000 });
                    await textArea.type(personalizedMessage, { delay: 50 }); // Type like a human
                    
                    await randomDelay(2, 4);
                    
                    // Re-scan for the send button
                    const newModalBtns = await page.$$('div[role="dialog"] button');
                    for (const mBtn of newModalBtns) {
                        const txt = await page.evaluate(el => (el.innerText || el.textContent || '').trim().toLowerCase(), mBtn);
                        if (txt.includes('send')) sendBtn = mBtn;
                    }
                } else {
                    console.log(`[Bot] "Add a note" not available (LinkedIn free-tier limit or UI change). Sending without note.`);
                }

                if (sendBtn) {
                    await sendBtn.click(); // Actually clicks the send button!
                    requestsSent++;
                    console.log(`✅ Sent request ${requestsSent}/${MAX_REQUESTS_PER_DAY} to ${name}!`);
                } else {
                    throw new Error("Could not find the Send button. Button names: " + 
                        (await Promise.all(modalButtons.map(b => page.evaluate(el => el.innerText, b)))).join(', ')
                    );
                }

                // SUPER IMPORTANT: Wait a long time between requests so LinkedIn doesn't flag you as a bot
                await randomDelay(60, 120); 

            } catch (err) {
                console.warn(`[Bot] Skipped a profile (Error: ${err.message})`);
                // Close modal if it failed halfway
                try {
                    const closeBtns = await page.$$('div[role="dialog"] button');
                    for (const b of closeBtns) {
                        const aria = await page.evaluate(el => (el.getAttribute('aria-label') || '').toLowerCase(), b);
                        if (aria.includes('dismiss') || aria.includes('close')) {
                            await page.evaluate(el => el.click(), b);
                        }
                    }
                } catch(e) {}
                await randomDelay(2, 4);
            }
        }

        console.log(`\n🎉 Outreach complete! Sent ${requestsSent} requests today.`);

    } catch (error) {
        console.error("❌ Bot Error:", error.message);
        console.log("\nDid you start Chrome with the remote-debugging port enabled?");
    } finally {
        if (browser) await browser.disconnect();
    }
}

runOutreach();
