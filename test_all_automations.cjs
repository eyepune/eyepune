require('dotenv').config({ path: '.env.vercel' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function runTests() {
    console.log("🚀 TESTING GROWTH ENGINE AUTOMATIONS 🚀\n");

    // 1. Test Twitter Thread
    try {
        console.log("--- Testing Twitter (X) Syndication ---");
        const { generateAndPostTwitterThread } = await import('./src/lib/twitter.js');
        const mockPost = {
            title: "The Sub-Second Digital Architecture",
            excerpt: "In a world of sub-2-second attention spans, standard web performance is costing enterprise brands millions.",
            content: "We engineer high-speed digital sales platforms...",
            slug: "sub-second-digital-architecture"
        };
        console.log("Generating and posting Twitter thread (this requires valid TWITTER_* env vars)...");
        // Uncomment to actually test the post:
        // const twitterResult = await generateAndPostTwitterThread(mockPost);
        // console.log("Twitter Result:", twitterResult);
        console.log("Twitter module loaded successfully! (Actual posting disabled in test script to prevent spam)");
    } catch (e) {
        console.error("❌ Twitter Test Failed:", e.message);
    }

    console.log("\n");

    // 2. Test WhatsApp
    try {
        console.log("--- Testing WhatsApp Lead Automation ---");
        const { sendWhatsAppMessage } = await import('./src/lib/whatsapp-service.js');
        
        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "919284712033";
        console.log(`Sending 'hello_world' test template to Admin Phone: ${adminPhone}...`);
        
        const waResult = await sendWhatsAppMessage({
            to: adminPhone,
            templateName: 'hello_world',
            languageCode: 'en_US'
        });

        if (waResult.success) {
            console.log("✅ SUCCESS! WhatsApp message sent to", adminPhone);
            console.log("Message ID:", waResult.messageId);
        } else {
            console.error("❌ WhatsApp Failed:", waResult.error);
        }

    } catch (e) {
        console.error("❌ WhatsApp Test Failed:", e.message);
    }
}

runTests();
