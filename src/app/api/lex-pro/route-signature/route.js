import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
    try {
        const { contractId, partyName, email } = await req.json();

        if (!contractId || !partyName || !email) {
            return NextResponse.json({ success: false, error: 'Contract ID, Party Name, and Email are required' }, { status: 400 });
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;
        const token = authHeader.replace('Bearer ', '');
        
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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

        // 2. Generate a signing link
        const signingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://eyepune.com'}/lex-pro/sign/${contractId}?party=${encodeURIComponent(partyName)}`;

        // 3. Send Email
        const mailOptions = {
            from: `"Lex Pro Documents" <${process.env.ZOHO_MAIL_USERNAME}>`,
            to: email,
            subject: `Action Required: Signature Requested for Document [Lex Pro]`,
            html: `
                <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#0A0F1C] text-white">
                    <h2 style="color: #f97316;">Lex Pro Secure Signature</h2>
                    <p>You have been requested to review and sign a legally binding document as <strong>${partyName}</strong>.</p>
                    <p>Please click the secure link below to review the document and apply your cryptographic signature:</p>
                    <br/>
                    <a href="${signingLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review and Sign</a>
                    <br/><br/>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated legal routing notification. Your digital signature will be captured and appended to a cryptographic audit trail.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // 4. Update the contract status in Supabase (Fail gracefully if column doesn't exist)
        try {
            await supabase
                .from('contracts')
                .update({ status: `Pending ${partyName}` })
                .eq('id', contractId);
        } catch (dbErr) {
            console.warn("Could not update contract status, column might be missing.", dbErr);
        }

        return NextResponse.json({ success: true, message: `Signature route initiated for ${partyName}.` });

    } catch (error) {
        console.error('[Lex Pro Route Signature] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
