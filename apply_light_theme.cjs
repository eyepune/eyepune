const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function applyLightTheme(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/bg-black/g, 'bg-white');
    content = content.replace(/bg-\[\#0[0-9a-fA-F]+\]/g, 'bg-slate-50');
    content = content.replace(/bg-white\/\[0\.0[0-9]+\]/g, 'bg-gray-100');
    content = content.replace(/bg-white\/[0-9]+/g, 'bg-black/5');
    
    // Borders
    content = content.replace(/border-white\/\[0\.0[0-9]+\]/g, 'border-gray-200');
    content = content.replace(/border-white\/[0-9]+/g, 'border-gray-200');

    // Text colors
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-gray-300/g, 'text-gray-700');
    content = content.replace(/text-gray-400/g, 'text-gray-600');
    
    // Gradients
    content = content.replace(/from-red-950/g, 'from-red-50');
    content = content.replace(/to-\[\#010000\]/g, 'to-white');
    content = content.replace(/via-\[\#030000\]/g, 'via-slate-50');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

// Update Layout.jsx
applyLightTheme(path.join(__dirname, 'src/Layout.jsx'));

// Update all views and components
walkDir(path.join(__dirname, 'src/views'), applyLightTheme);
walkDir(path.join(__dirname, 'src/components'), applyLightTheme);
walkDir(path.join(__dirname, 'src/app'), applyLightTheme);

console.log('Whitish theme applied globally!');
