import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req) {
    try {
        const { email, role, organizationId } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // 1. Create a transporter using Zoho SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_MAIL_USERNAME,
                pass: process.env.ZOHO_SMTP_PASSWORD,
            }
        });

        // 2. Generate an invite link (In a real app, use Supabase admin auth to generate invite links)
        const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://eyepune.com'}/lex-pro/login?invite=${organizationId}`;

        // 3. Send Email
        const mailOptions = {
            from: `"Lex Pro Admin" <${process.env.ZOHO_MAIL_USERNAME}>`,
            to: email,
            subject: 'You have been invited to join a Lex Pro Workspace',
            html: `
                <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#0A0F1C] text-white">
                    <h2 style="color: #3b82f6;">Lex Pro Enterprise</h2>
                    <p>You have been invited to join a legal workspace as a <strong>${role || 'Member'}</strong>.</p>
                    <p>Click the secure link below to accept the invitation and set up your account:</p>
                    <br/>
                    <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
                    <br/><br/>
                    <p style="color: #6b7280; font-size: 12px;">If you did not expect this invitation, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Invitation sent successfully.' });

    } catch (error) {
        console.error('Invite Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
