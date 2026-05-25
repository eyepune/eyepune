chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        console.log("[EyE PunE] Beginning scrape...");
        
        // Ensure page is fully scrolled to lazy load images and cards
        window.scrollTo(0, document.body.scrollHeight);
        
        setTimeout(async () => {
            const results = [];
            const profileCards = document.querySelectorAll('.reusable-search__result-container, .search-result__wrapper, li.reusable-search__result-container');
            
            profileCards.forEach(card => {
                const nameEl = card.querySelector('span[dir="ltr"] span[aria-hidden="true"]') || card.querySelector('.entity-result__title-text a span[dir="ltr"]');
                const headlineEl = card.querySelector('.entity-result__primary-subtitle') || card.querySelector('.search-result__truncate');
                const linkEl = card.querySelector('.app-aware-link') || card.querySelector('.entity-result__title-text a');

                if (nameEl && linkEl) {
                    results.push({
                        full_name: nameEl.innerText.trim(),
                        headline: headlineEl ? headlineEl.innerText.trim() : '',
                        linkedin_url: linkEl.href.split('?')[0],
                        source: 'eyepune_chrome_extension'
                    });
                }
            });

            console.log(`[EyE PunE] Found ${results.length} leads. Sending to CRM...`);

            let successCount = 0;
            for (const lead of results) {
                try {
                    const response = await fetch(request.webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(lead)
                    });
                    if (response.ok) successCount++;
                } catch (error) {
                    console.error("[EyE PunE] Failed to send lead:", error);
                }
            }
            
            sendResponse({ success: results.length > 0, count: successCount });
        }, 1000); // 1s delay to let lazy load trigger

        return true; // indicates asynchronous response
    }
});
