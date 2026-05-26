const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');

function fixMobileIssues(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix absolute width backgrounds
    content = content.replace(/w-\[500px\]/g, 'w-full max-w-[500px]');
    content = content.replace(/w-\[600px\]/g, 'w-full max-w-[600px]');
    content = content.replace(/w-\[700px\]/g, 'w-full max-w-[700px]');
    content = content.replace(/w-\[800px\]/g, 'w-full max-w-[800px]');

    // Fix large hero fonts
    content = content.replace(/text-5xl sm:text-6xl md:text-7xl/g, 'text-4xl sm:text-5xl md:text-7xl');
    content = content.replace(/text-5xl md:text-7xl/g, 'text-4xl md:text-6xl lg:text-7xl');
    content = content.replace(/text-5xl md:text-8xl/g, 'text-4xl md:text-6xl lg:text-8xl');
    content = content.replace(/text-5xl sm:text-6xl md:text-8xl/g, 'text-4xl sm:text-5xl md:text-8xl');
    
    // Fix huge buttons
    content = content.replace(/px-12 py-8/g, 'px-8 py-5 md:px-12 md:py-8');
    content = content.replace(/px-10 py-7/g, 'px-6 py-4 md:px-10 md:py-7');
    
    // Fix sections missing overflow-hidden that have absolute elements
    // Though it's safer to just make sure these absolute elements are max-w-full.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${path.basename(filePath)}`);
    }
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            fixMobileIssues(fullPath);
        }
    }
}

console.log('Starting mobile optimization sweep...');
processDirectory(viewsDir);
console.log('Done!');
