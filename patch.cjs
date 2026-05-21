const fs = require('fs');
const path = require('path');
const viewsDir = path.join(process.cwd(), 'src', 'views');

const files = [
    'Admin_Blog.jsx', 'Admin_CMS.jsx', 'Admin_CRMSync.jsx', 
    'Admin_Documents.jsx', 'Admin_DripAutomations.jsx', 'Admin_Feedback.jsx', 
    'Admin_Forms.jsx', 'Admin_Marketing.jsx', 'Admin_SalesAssistant.jsx', 
    'Admin_ServiceAddons.jsx', 'Admin_Templates.jsx', 'Client_Dashboard.jsx', 
    'Profile.jsx', 'SignContract.jsx'
];

files.forEach(f => {
    const filePath = path.join(viewsDir, f);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add toast import if missing
    if (!content.includes("toast } from 'sonner'")) {
        content = content.replace(/(import React.*?;\n)/, `$1import { toast } from 'sonner';\n`);
    }

    // Add onError handler to useMutation
    content = content.replace(/(onSuccess:\s*[\s\S]*?)(,\s*\n\s*\}\);)/g, `$1,\n        onError: (e) => toast.error(e.message || 'An error occurred')$2`);

    fs.writeFileSync(filePath, content);
    console.log('Patched ' + f);
});
