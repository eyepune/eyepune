import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { event_type, lead_name, lead_email, details } = await req.json();

        // Get all admin WhatsApp conversations
        const conversations = await base44.asServiceRole.agents.listConversations({ 
            agent_name: 'salesAssistant' 
        });
        
        // Find all admin notification conversations (one per admin user)
        const adminConversations = conversations.filter(c => c.metadata?.is_admin_notifications === true);

        // Format notification message
        let message = '';
        
        switch(event_type) {
            case 'new_assessment':
                message = `🎯 *NEW AI ASSESSMENT ALERT*\n\n` +
                         `👤 *Lead:* ${lead_name}\n` +
                         `📧 *Email:* ${lead_email}\n` +
                         `📊 *Growth Score:* ${details.score}/100\n` +
                         `💡 *Challenge:* ${details.challenge}\n\n` +
                         `⏰ *Action Required:* Contact within 24 hours for 3x better conversion\n` +
                         `🎁 Offer free strategy call to convert`;
                break;
                
            case 'qualified_lead':
                message = `✅ *QUALIFIED LEAD - READY TO CLOSE*\n\n` +
                         `👤 *Name:* ${lead_name}\n` +
                         `💰 *Budget:* ${details.budget}\n` +
                         `⏱️ *Timeline:* ${details.timeline}\n` +
                         `🔥 *Interest Level:* HIGH\n\n` +
                         `📋 *Next Step:* Send custom proposal immediately\n` +
                         `🤝 Schedule closing call within 48 hours`;
                break;
                
            case 'booking_confirmed':
                message = `📅 *NEW CONSULTATION BOOKED*\n\n` +
                         `👤 *Client:* ${lead_name}\n` +
                         `📆 *Date & Time:* ${details.date}\n` +
                         `📞 *Type:* ${details.type}\n` +
                         `📊 *Score:* ${details.score || 'N/A'}/100\n\n` +
                         `✅ *Prep Checklist:*\n` +
                         `• Review their assessment report\n` +
                         `• Prepare custom solution deck\n` +
                         `• Send Google Meet link 1 hour before\n` +
                         `• Set reminder 15 mins before call`;
                break;
                
            case 'high_score_assessment':
                message = `⚡ *🔥 HIGH-VALUE LEAD - PRIORITY ALERT 🔥*\n\n` +
                         `👤 *Lead:* ${lead_name}\n` +
                         `📧 *Email:* ${lead_email}\n` +
                         `📊 *Growth Score:* ${details.score}/100 🎯\n` +
                         `💰 *Revenue Potential:* ₹${details.potential}\n` +
                         `💡 *Challenge:* ${details.challenge}\n\n` +
                         `🚨 *URGENT ACTION:*\n` +
                         `1️⃣ Call within 2 hours (strike while hot)\n` +
                         `2️⃣ Personalize proposal with their exact pain points\n` +
                         `3️⃣ Offer premium package + immediate onboarding\n\n` +
                         `💎 This is a HOT lead - don't let it cool down!`;
                break;
                
            default:
                message = `📢 *New Activity*\n\n` +
                         `${lead_name} - ${details}`;
        }

        // Send notification to all connected admin WhatsApp numbers
        const notificationPromises = adminConversations.map(conv =>
            base44.asServiceRole.agents.addMessage(conv, {
                role: 'user',
                content: message
            }).catch(err => {
                console.error(`Failed to send to conversation ${conv.id}:`, err);
                return null;
            })
        );

        await Promise.all(notificationPromises);

        return Response.json({ 
            success: true, 
            sentTo: adminConversations.length 
        });

    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});