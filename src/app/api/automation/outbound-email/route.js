import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * 🚀 Outbound AI Lead Engine (Webhook Endpoint)
 * 
 * Flow:
 * 1. Receive Lead Data
 * 2. Ping LLM for Personalization
 * 3. Dispatch the email via ZOHO MAIL SMTP
 * 4. Log interaction
 */

export async function POST(request) {
    try {
        // 1. Verify Authentication (Zero-Trust)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error('❌ Unauthorized access to Outbound AI Lead Engine');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Incoming Webhook Payload
        const body = await request.json();
        const { 
            lead_email, 
            lead_name, 
            company_name, 
            industry,
        } = body;

        if (!lead_email || !company_name) {
            return NextResponse.json(
                { error: 'Missing required lead data (lead_email, company_name)' }, 
                { status: 400 }
            );
        }

        console.log(`🤖 [Outbound Engine] Processing new lead: ${lead_name} at ${company_name}`);

        // 3. AI Personalization Layer (Live LLM Integration)
        let generatedSubject = `Scaling ${company_name}'s AI Architecture`;
        let generatedBody = `Hi ${lead_name},\n\nI noticed ${company_name} is operating in the ${industry} space. We build autonomous AI growth engines and Next.js architectures that could help you scale...\n\nBest,\nEyE PunE Team`;

        const LLM_API_KEY = process.env.LLM_API_KEY;
        const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';

        if (LLM_API_KEY) {
            console.log(`🧠 [Outbound Engine] Querying LLM for hyper-personalization...`);
            const prompt = `Write a short, highly converting cold email to ${lead_name}, who works at ${company_name} (Industry: ${industry}). You are EyE PunE, an elite AI automation and Next.js web development agency. Keep it under 4 sentences. Make it sound human. Do not use placeholders. Provide the output in JSON format: {"subject": "the subject", "body": "the email body"}`;
            
            try {
                const aiResponse = await fetch(LLM_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${LLM_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'meta/llama3-70b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 500,
                        response_format: { type: "json_object" }
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const aiResult = JSON.parse(aiData.choices[0].message.content);
                    generatedSubject = aiResult.subject || generatedSubject;
                    generatedBody = aiResult.body || generatedBody;
                    console.log(`🧠 [Outbound Engine] LLM generated personalized pitch successfully.`);
                } else {
                    console.error('⚠️ LLM API error, falling back to template:', await aiResponse.text());
                }
            } catch (err) {
                console.error('⚠️ LLM fetch failed, falling back to template:', err);
            }
        } else {
            console.warn('⚠️ No LLM_API_KEY found, using fallback email template.');
        }

        // 4. Dispatch Email via ZOHO MAIL SMTP
        console.log(`📨 [Outbound Engine] Dispatching email to ${lead_email} via Zoho Mail...`);
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // true for 465, false for 587
            auth: {
                user: process.env.ZOHO_EMAIL_ADDRESS,
                pass: process.env.ZOHO_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.ZOHO_EMAIL_ADDRESS,
            to: lead_email,
            subject: generatedSubject,
            text: generatedBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Zoho SMTP] Email sent successfully: ${info.messageId}`);

        return NextResponse.json({
            success: true,
            message: 'Outbound AI email dispatched via Zoho Mail.',
            data: {
                target: lead_email,
                message_id: info.messageId
            }
        });

    } catch (error) {
        console.error('❌ Outbound AI Engine Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error processing lead.' },
            { status: 500 }
        );
    }
}
