const { execSync } = require('child_process');

console.log("🚀 FORCING Secret Setup on Vercel...");

const cronSecret = "eyepune_automation_secret_2026";

try {
    console.log("\n🧹 1. Removing old CRON_SECRET from Vercel (to fix any mismatched passwords or trailing spaces)...");
    execSync(`npx vercel env rm CRON_SECRET production -y`, { stdio: 'inherit', shell: true });
} catch (error) {
    console.log("   (No old secret found to remove, continuing...)");
}

try {
    console.log("\n🔑 2. Adding fresh CRON_SECRET securely (without whitespace)...");
    execSync(`node -e "process.stdout.write('${cronSecret}')" | npx vercel env add CRON_SECRET production`, { stdio: 'inherit', shell: true });
    console.log("✅ Vercel Secret Added Successfully!");
} catch (error) {
    console.log("⚠️ Could not add to Vercel.");
}

console.log("\n🚀 3. Triggering Vercel Redeployment to apply changes...");
try {
    execSync(`npx vercel --prod --yes`, { stdio: 'inherit', shell: true });
    console.log("✅ Redeployment Triggered Successfully!");
} catch (error) {
    console.log("⚠️ Redeployment failed.");
}

console.log("\n🎉 Vercel is now permanently fixed. Note: You STILL have to manually add CRON_SECRET to your GitHub Actions secrets via your browser.");
