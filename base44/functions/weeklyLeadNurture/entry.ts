import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token error');
    return data.access_token;
}

async function sendEmail(to, subject, html) {
    const accessToken = await getAccessToken();
    const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
    const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';
    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAddress, toAddress: to, subject, content: html, mailFormat: 'html' })
    });
    return res.json();
}

// Weekly tips content rotation
const weeklyTips = [
    {
        subject: "💡 5 Ways AI Can Double Your Lead Generation",
        headline: "How AI is Transforming Lead Generation in 2025",
        body: "Businesses using AI-powered lead generation are seeing <strong>3x more qualified leads</strong> at half the cost. Here are 5 quick wins you can implement this week:",
        tips: ["Use AI chatbots to qualify leads 24/7", "Automate follow-up emails within 5 minutes of inquiry", "Leverage predictive scoring to focus on hot leads", "Use AI to personalize outreach at scale", "Automate social media posting to 10x your reach"]
    },
    {
        subject: "🚀 Your Competitors Are Using These Growth Hacks",
        headline: "3 Growth Strategies Dominating the Market Right Now",
        body: "While most businesses are stuck in old-school marketing, smart businesses are growing faster than ever. Here's what's working:",
        tips: ["Retargeting ads with 15-second video — 8x cheaper than cold ads", "WhatsApp business automation for instant follow-ups", "Local SEO optimisation — 46% of Google searches are local", "Google My Business posting — free traffic hack most ignore", "Video testimonials — 89% of buyers trust them more than text"]
    },
    {
        subject: "📊 Is Your Website Losing You Money?",
        headline: "10-Second Website Audit Checklist",
        body: "Most business websites lose <strong>70%+ of visitors</strong> in the first 3 seconds. Here's a quick self-audit:",
        tips: ["Does your homepage load in under 3 seconds?", "Is your phone number visible above the fold?", "Do you have a clear Call-to-Action on every page?", "Is your site mobile-optimized?", "Do you have a lead capture form or live chat?"]
    }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get active leads (new or contacted) who haven't been closed
        const leads = await base44.asServiceRole.entities.Lead.filter({ status: 'contacted' });
        const newLeads = await base44.asServiceRole.entities.Lead.filter({ status: 'new' });
        const allLeads = [...leads, ...newLeads];

        // Pick tip of the week based on week number
        const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
        const tip = weeklyTips[weekNum % weeklyTips.length];

        let sent = 0;
        for (const lead of allLeads) {
            if (!lead.email) continue;

            // Only nurture leads that were created more than 3 days ago
            const createdDaysAgo = (Date.now() - new Date(lead.created_date).getTime()) / (1000 * 60 * 60 * 24);
            if (createdDaysAgo < 3) continue;

            await sendEmail(lead.email, tip.subject, `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px; text-align: center;">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:40px;" />
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color:#111;">${tip.headline}</h2>
                        <p>Hi ${lead.full_name?.split(' ')[0] || 'there'},</p>
                        <p>${tip.body}</p>
                        <ol style="line-height:2.2; color:#444;">
                            ${tip.tips.map(t => `<li>${t}</li>`).join('')}
                        </ol>
                        <div style="background:#fff5f5; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
                            <p style="font-weight:bold; margin-bottom:12px;">Want us to implement these for your business?</p>
                            <a href="https://eyepune.com/Booking" style="background:#dc2626; color:#fff; text-decoration:none; padding:12px 28px; border-radius:50px; font-weight:bold;">Book Free Strategy Call →</a>
                        </div>
                        <p style="color:#999; font-size:12px;">You're receiving this because you enquired about our services. <a href="https://eyepune.com/Unsubscribe?email=${encodeURIComponent(lead.email)}" style="color:#999;">Unsubscribe</a></p>
                    </div>
                </div>
            `).catch(() => {}); // Skip failures silently for batch sends

            sent++;
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));
        }

        return Response.json({ success: true, nurtured: sent, total_leads: allLeads.length });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});