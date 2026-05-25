const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Note: This script requires 'sharp' to be installed.
// Run: npm install sharp --save-dev

try {
  require.resolve('sharp');
} catch (e) {
  console.error("The 'sharp' library is required to run this script.");
  console.error("Please run: npm install sharp --save-dev");
  process.exit(1);
}

const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(file));
    } else { 
      if (file.match(/\.(png|jpe?g)$/i)) {
        results.push(file);
      }
    }
  });
  return results;
};

async function processImages() {
  const files = getFiles(PUBLIC_DIR);
  console.log(`Found ${files.length} images to process...`);
  
  let savedBytes = 0;

  for (const file of files) {
    const ext = path.extname(file);
    const webpPath = file.replace(new RegExp(`${ext}$`), '.webp');
    
    // Skip if webp already exists
    if (fs.existsSync(webpPath)) {
      continue;
    }

    try {
      const originalSize = fs.statSync(file).size;
      
      await sharp(file)
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);
        
      const newSize = fs.statSync(webpPath).size;
      savedBytes += (originalSize - newSize);
      
      console.log(`✅ Converted ${path.basename(file)} -> .webp (Saved ${((originalSize - newSize) / 1024).toFixed(2)} KB)`);
      
      // Optional: uncomment below to auto-delete the original massive images
      // fs.unlinkSync(file);
      
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Optimization Complete! Total space saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
}

processImages();
