const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('bg-[#040404]')) {
                content = content.replace(/bg-\[#040404\]/g, 'bg-transparent');
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDirectory(viewsDir);
console.log('Done!');
