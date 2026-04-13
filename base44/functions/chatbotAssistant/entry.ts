import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { message, conversationHistory } = await req.json();

        if (!message) {
            return Response.json({ error: 'Message is required' }, { status: 400 });
        }

        const systemPrompt = `You are a helpful and friendly AI assistant for EyE PunE, a growth agency specializing in:
- Sales Systems & Funnels
- Marketing Automation  
- Website & App Development
- AI Tools for Business
- Analytics & Reporting
- Branding & Content

Your role is to:
1. Answer questions about these services
2. Help users understand how EyE PunE can help their business
3. Guide users to book consultations or take the AI Assessment
4. Provide general app navigation help
5. Be professional yet conversational

Key facts about EyE PunE:
- We help businesses connect, engage, and grow
- We offer a free AI Assessment to evaluate business growth
- Users can book consultations for personalized solutions
- We have flexible pricing plans
- Our tagline is "Connect - Engage - Grow"

When users ask about services, briefly explain how it helps their business. When appropriate, suggest:
- Taking the Free AI Assessment for a personalized growth plan
- Booking a consultation with our team
- Checking our pricing page for solutions

Keep responses concise, helpful, and action-oriented. If something is outside your knowledge, suggest contacting them at connect@eyepune.com or +91 9284712033.`;

        const conversationContext = conversationHistory && conversationHistory.length > 0 
            ? conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
            : '';

        const fullPrompt = conversationContext 
            ? `${conversationContext}\nUser: ${message}`
            : `User: ${message}`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: fullPrompt,
            add_context_from_internet: false,
        });

        return Response.json({ 
            reply: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});