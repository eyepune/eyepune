import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix absolute width backgrounds/containers (>= 300px) that might break mobile
    content = content.replace(/(?<!max-)w-\[(\d+)px\]/g, (match, p1) => {
        const width = parseInt(p1, 10);
        if (width >= 300) {
            // Replace with w-full max-w-[...px] to prevent horizontal scroll
            return `w-full max-w-[${width}px]`;
        }
        return match;
    });

    // Deduplicate in case we accidentally created "w-full w-full"
    content = content.replace(/w-full w-full/g, 'w-full');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Optimized mobile layout for: ${path.relative(__dirname, filePath)}`);
    }
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            fixFile(fullPath);
        }
    }
}

console.log('Starting comprehensive mobile optimization sweep across all components and views...');
processDirectory(srcDir);
console.log('Done fixing every page!');
