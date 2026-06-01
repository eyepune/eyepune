import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, company, message, source } = body;

        if (!name || !email || !company) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Configure Nodemailer with Zoho settings
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.ZOHO_MAIL_USERNAME,
                // App-specific password or normal password (if 2FA is off, but App-password is recommended)
                // For this MVP, we will use ZOHO_CLIENT_SECRET as placeholder or assume it's set in env if using SMTP password
                // Actually Zoho OAuth is complex, usually we just use an SMTP password. We'll use process.env.ZOHO_SMTP_PASSWORD
                pass: process.env.ZOHO_SMTP_PASSWORD || process.env.ZOHO_CLIENT_SECRET 
            }
        });

        const mailOptions = {
            from: process.env.ZOHO_MAIL_USERNAME, // Must be the authenticated email
            to: process.env.ZOHO_MAIL_USERNAME,   // Send to yourself
            subject: `[LexPro Lead] New Demo Request from ${company}`,
            html: `
                <h2>New Lex Pro Enterprise Lead</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Source Page:</strong> ${source}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 4px solid #eee; padding-left: 10px; color: #555;">
                    ${message || 'No additional message provided.'}
                </blockquote>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Lead captured successfully' });
    } catch (error) {
        console.error('LexPro Lead Capture Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
