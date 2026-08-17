const fs = require('fs');
const path = require('path');

const directoriesToScan = [
    path.join(__dirname, 'src', 'views'),
    path.join(__dirname, 'src', 'components', 'services'),
    path.join(__dirname, 'src', 'app'), // in case it is used there
];

function processFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    let modified = false;

    // Remove import
    if (content.includes('import SEOHead')) {
        content = content.replace(/import\s+SEOHead\s+from\s+['"][^'"]+['"];?\r?\n?/g, '');
        modified = true;
    }

    // Replace <SEOHead ... /> blocks
    const seoHeadRegex = /<SEOHead[\s\S]*?\/>/g;
    let match;
    while ((match = seoHeadRegex.exec(content)) !== null) {
        const block = match[0];
        
        // Extract structuredData prop if it exists
        const structuredDataMatch = block.match(/structuredData=\{([^}]+)\}/);
        
        if (structuredDataMatch) {
            const schemaVariable = structuredDataMatch[1];
            const replacement = `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(${schemaVariable}) }} />`;
            content = content.substring(0, match.index) + replacement + content.substring(match.index + block.length);
            seoHeadRegex.lastIndex = match.index + replacement.length;
        } else {
            // Remove completely
            content = content.substring(0, match.index) + content.substring(match.index + block.length);
            seoHeadRegex.lastIndex = match.index; // adjust index since we removed
        }
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

for (const dir of directoriesToScan) {
    scanDir(dir);
}

console.log('Done cleaning up SEOHead.');
