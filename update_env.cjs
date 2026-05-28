const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
const orgId = "82975373";

try {
    let content = '';
    if (fs.existsSync(envLocalPath)) {
        content = fs.readFileSync(envLocalPath, 'utf8');
        // Remove existing org ID if present
        content = content.split('\n').filter(line => !line.startsWith('LINKEDIN_ORGANIZATION_ID=')).join('\n');
    }
    
    content += `\nLINKEDIN_ORGANIZATION_ID=${orgId}\n`;
    
    fs.writeFileSync(envLocalPath, content.trim() + '\n', 'utf8');
    console.log(`✅ Successfully added LINKEDIN_ORGANIZATION_ID=${orgId} to .env.local!`);
} catch (error) {
    console.error("❌ Failed to update .env.local:", error);
}
