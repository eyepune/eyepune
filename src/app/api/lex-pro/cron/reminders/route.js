import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// This endpoint should be triggered daily by GitHub Actions or Vercel Cron
export async function GET(req) {
    // Basic API Key protection for cron job
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Fetch contracts that are 'Pending Signature' and older than 48 hours
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        
        const { data: pendingContracts, error } = await supabase
            .from('contracts')
            .select('id, title, created_at, counterparty_email, organization_id')
            .eq('status', 'Pending Signature')
            .lt('created_at', fortyEightHoursAgo)
            .not('counterparty_email', 'is', null);

        if (error) throw error;
        if (!pendingContracts || pendingContracts.length === 0) {
            return NextResponse.json({ success: true, message: 'No reminders needed today.' });
        }

        // Setup Mailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_MAIL_USERNAME,
                pass: process.env.ZOHO_SMTP_PASSWORD,
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eyepune.com';
        let sentCount = 0;

        // Process reminders
        for (const contract of pendingContracts) {
            const signLink = `${baseUrl}/lex-pro/sign/${contract.id}`;
            
            const mailOptions = {
                from: `"Lex Pro Notifications" <${process.env.ZOHO_MAIL_USERNAME}>`,
                to: contract.counterparty_email,
                subject: `Action Required: Signature Pending for ${contract.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#0A0F1C] text-white">
                        <h2 style="color: #3b82f6;">Signature Reminder</h2>
                        <p>This is an automated reminder that you have a legal document pending your cryptographic signature.</p>
                        <p><strong>Document:</strong> ${contract.title}</p>
                        <br/>
                        <a href="${signLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Sign Now</a>
                        <br/><br/>
                        <p style="color: #6b7280; font-size: 12px;">Powered by Lex Pro Enterprise Legal Framework.</p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                sentCount++;
                
                // Optionally log that a reminder was sent in a separate table, 
                // or update a 'last_reminded_at' column to avoid spamming daily.
            } catch (mailErr) {
                console.error(`Failed to send reminder for contract ${contract.id}:`, mailErr);
            }
        }

        return NextResponse.json({ success: true, message: `Reminders sent to ${sentCount} counterparties.` });

    } catch (error) {
        console.error('Reminder Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
