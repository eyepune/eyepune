require('dotenv').config({ path: '.env.vercel' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function triggerLivePost() {
    console.log("🚀 TRIGGERING LIVE LINKEDIN POST 🚀");
    console.log("Please wait while the AI generates and publishes the content...\n");

    try {
        // Dynamically import the module since it's an ES module
        const { generateAndPostToLinkedin } = await import('./src/lib/linkedin-automation.js');
        
        // Let's generate an 'educational' post for the test
        const result = await generateAndPostToLinkedin('educational');
        
        if (result.success) {
            console.log("\n✅ SUCCESS! The post is now live on LinkedIn.");
            console.log("Here is the content that was published:\n");
            console.log("--------------------------------------------------");
            console.log(result.content);
            console.log("--------------------------------------------------");
            console.log(`\nLinkedIn Post ID: ${result.postId}`);
            console.log("Check your LinkedIn profile to see it!");
        } else {
            console.error("\n❌ FAILED to post to LinkedIn.");
            console.error("Error details:", result.error);
            console.log("\n(If it says 'Missing token', make sure LINKEDIN_ACCESS_TOKEN is correct in your database or .env file!)");
        }

    } catch (e) {
        console.error("\n❌ EXCEPTION during execution:");
        console.error(e);
    }
}

triggerLivePost();
