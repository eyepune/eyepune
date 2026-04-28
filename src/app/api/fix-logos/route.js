import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    const sourceDir = 'C:\\Users\\found\\.gemini\\antigravity\\brain\\da4e20d5-78b6-424f-90db-22416095a483';
    const destDir = path.join(process.cwd(), 'public', 'logos');

    const files = [
        { src: 'media__1777377976894.png', dest: 'partner_1.png' },
        { src: 'media__1777377976910.jpg', dest: 'partner_2.jpg' },
        { src: 'media__1777377977079.png', dest: 'partner_3.png' },
        { src: 'media__1777377977121.png', dest: 'partner_4.png' },
        { src: 'media__1777377977139.jpg', dest: 'partner_5.jpg' }
    ];

    const results = [];

    for (const file of files) {
        try {
            const srcPath = path.join(sourceDir, file.src);
            const destPath = path.join(destDir, file.dest);
            
            // Ensure dest dir exists
            await fs.mkdir(destDir, { recursive: true });
            
            await fs.copyFile(srcPath, destPath);
            results.push({ file: file.dest, status: 'success' });
        } catch (error) {
            results.push({ file: file.dest, status: 'error', message: error.message });
        }
    }

    return NextResponse.json({ results });
}
