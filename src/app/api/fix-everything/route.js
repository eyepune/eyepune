import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for bypass RLS

export async function GET() {
    const results = {
        files: [],
        cms_pages: [],
        client_logos: []
    };

    // 1. Copy Files
    const sourceDir = 'C:\\Users\\found\\.gemini\\antigravity\\brain\\da4e20d5-78b6-424f-90db-22416095a483';
    const destDir = path.join(process.cwd(), 'public', 'logos');

    const filesToCopy = [
        { src: 'media__1777377976894.png', dest: 'partner_1.png' },
        { src: 'media__1777377976910.jpg', dest: 'partner_2.jpg' },
        { src: 'media__1777377977079.png', dest: 'partner_3.png' },
        { src: 'media__1777377977121.png', dest: 'partner_4.png' },
        { src: 'media__1777377977139.jpg', dest: 'partner_5.jpg' }
    ];

    for (const file of filesToCopy) {
        try {
            const srcPath = path.join(sourceDir, file.src);
            const destPath = path.join(destDir, file.dest);
            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(srcPath, destPath);
            results.files.push({ file: file.dest, status: 'success' });
        } catch (error) {
            results.files.push({ file: file.dest, status: 'error', message: error.message });
        }
    }

    // 2. Initialize Database
    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // A. CMS Pages
        const cmsPages = [
            {
                page_name: 'Privacy Policy',
                slug: 'privacy-policy',
                title: 'Privacy Policy | EyE PunE',
                content: '# Privacy Policy\n\nYour privacy is important to us. It is EyE PunE\'s policy to respect your privacy regarding any information we may collect from you across our website, https://www.eyepune.com, and other sites we own and operate.\n\nWe only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.',
                meta_description: 'Privacy Policy for EyE PunE - Pune\'s premier digital agency.',
                page_type: 'other',
                published: true
            },
            {
                page_name: 'Terms & Conditions',
                slug: 'terms-and-conditions',
                title: 'Terms & Conditions | EyE PunE',
                content: '# Terms & Conditions\n\nBy accessing the website at https://www.eyepune.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.',
                meta_description: 'Terms and Conditions for EyE PunE.',
                page_type: 'other',
                published: true
            },
            {
                page_name: 'Cookie Policy',
                slug: 'cookie-policy',
                title: 'Cookie Policy | EyE PunE',
                content: '# Cookie Policy\n\nThis is the Cookie Policy for EyE PunE, accessible from https://www.eyepune.com. We use cookies to help improve your experience of our website.',
                meta_description: 'Cookie Policy for EyE PunE.',
                page_type: 'other',
                published: true
            }
        ];

        for (const page of cmsPages) {
            const { error } = await supabase.from('cms_pages').upsert(page, { onConflict: 'slug' });
            results.cms_pages.push({ slug: page.slug, status: error ? 'error' : 'success', message: error?.message });
        }

        // B. Client Logos (Sync with fallback)
        const clientLogos = [
            { company_name: 'Orbit Solutions', logo_url: '/logos/partner_1.png', display_order: 1, is_active: true },
            { company_name: 'Dashes n Hyphens', logo_url: '/logos/partner_2.jpg', display_order: 2, is_active: true },
            { company_name: 'Magniflex', logo_url: '/logos/partner_3.png', display_order: 3, is_active: true },
            { company_name: 'Flow Dynamics', logo_url: '/logos/partner_4.png', display_order: 4, is_active: true },
            { company_name: 'Body Perfect & Smile Lounge', logo_url: '/logos/partner_5.jpg', display_order: 5, is_active: true }
        ];

        for (const logo of clientLogos) {
            const { error } = await supabase.from('client_logos').upsert(logo, { onConflict: 'company_name' });
            results.client_logos.push({ company: logo.company_name, status: error ? 'error' : 'success', message: error?.message });
        }
    } else {
        results.db_status = 'error: supabase config missing';
    }

    return NextResponse.json(results);
}
