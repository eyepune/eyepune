import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function run() {
    const svgPath = path.join(process.cwd(), 'public', 'logo.svg');
    const svgBuffer = fs.readFileSync(svgPath);
    // Convert to PNG, white background or transparent? User said "remove the background or must be white". Let's make it transparent.
    const pngBuffer = await sharp(svgBuffer).resize(200).png().toBuffer();
    const base64 = pngBuffer.toString('base64');
    fs.writeFileSync('logo_base64.txt', base64);
    console.log('Saved to logo_base64.txt');
}
run();
