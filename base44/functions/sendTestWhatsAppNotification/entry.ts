import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get or create user-specific admin notification conversation
        const conversations = await base44.asServiceRole.agents.listConversations({ 
            agent_name: 'salesAssistant' 
        });
        
        let userConv = conversations.find(c => 
            c.metadata?.is_admin_notifications === true && 
            c.metadata?.admin_email === user.email
        );
        
        if (!userConv) {
            userConv = await base44.asServiceRole.agents.createConversation({
                agent_name: 'salesAssistant',
                metadata: {
                    name: `Admin Notifications - ${user.full_name || user.email}`,
                    is_admin_notifications: true,
                    admin_email: user.email,
                    admin_name: user.full_name
                }
            });
        }

        // Send test notification
        const testMessage = `🔔 *Test Notification*\n\n` +
                          `This is a test message from your EyE PunE dashboard.\n\n` +
                          `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
                          `Admin: ${user.full_name || user.email}\n\n` +
                          `✅ WhatsApp notifications are working correctly for your account!`;

        await base44.asServiceRole.agents.addMessage(userConv, {
            role: 'user',
            content: testMessage
        });

        return Response.json({ 
            success: true, 
            message: 'Test notification sent to your WhatsApp',
            conversationId: userConv.id 
        });

    } catch (error) {
        console.error('Error sending test notification:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});