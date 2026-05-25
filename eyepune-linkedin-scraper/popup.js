document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const webhookUrl = document.getElementById('webhookUrl').value;
    
    statusDiv.textContent = "Injecting scraper...";
    statusDiv.style.color = "#fbbf24"; // yellow

    // Get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("linkedin.com")) {
        statusDiv.textContent = "Error: Please navigate to LinkedIn first.";
        statusDiv.style.color = "#ef4444"; // red
        return;
    }

    // Execute the scraping function in the context of the active tab
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, () => {
        // Send a message to the injected script containing the webhook URL
        chrome.tabs.sendMessage(tab.id, { action: "scrape", webhookUrl: webhookUrl }, (response) => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = "Error: Reload the page and try again.";
                statusDiv.style.color = "#ef4444";
            } else if (response && response.success) {
                statusDiv.textContent = `Success! Synced ${response.count} leads.`;
                statusDiv.style.color = "#10b981"; // green
            } else {
                statusDiv.textContent = "Found 0 leads. Make sure you are on a search results page.";
                statusDiv.style.color = "#ef4444";
            }
        });
    });
});
