import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Support both direct call ({ lead_id }) and entity automation payload ({ event, data })
        let lead_id = body.lead_id;
        const force_send = body.force_send;
        
        // Entity automation from Lead creation: event.entity_id has the lead ID
        if (!lead_id && body.event?.entity_id) {
            lead_id = body.event.entity_id;
        }
        
        // Fallback to body.data.id
        if (!lead_id && body.data?.id) {
            lead_id = body.data.id;
        }

        if (!lead_id) {
            console.error('Payload received:', JSON.stringify(body, null, 2));
            return Response.json({ error: 'lead_id is required' }, { status: 400 });
        }

        // Fetch lead data
        const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
        if (!leads || leads.length === 0) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        const lead = leads[0];

        // Check if lead has unsubscribed
        if (lead.tags?.includes('unsubscribed') && !force_send) {
            return Response.json({ 
                success: false, 
                message: 'Lead has unsubscribed from communications' 
            });
        }

        // Check if outreach already sent (unless forced)
        if (lead.tags?.includes('outreach-sent') && !force_send) {
            return Response.json({ 
                success: false, 
                message: 'Initial outreach already sent to this lead' 
            });
        }

        // Fetch AI Assessment if available
        const assessments = await base44.asServiceRole.entities.AI_Assessment.filter({
            lead_email: lead.email
        });
        const assessment = assessments?.[0];

        // Build context for AI
        const context = {
            name: lead.full_name,
            company: lead.company,
            industry: lead.industry,
            source: lead.source,
            leadScore: lead.lead_score,
            notes: lead.notes,
            hasAssessment: !!assessment,
            growthScore: assessment?.growth_score,
            challenges: assessment?.biggest_challenge,
            goals: assessment?.growth_goals
        };

        // Generate personalized message using AI
        const aiMessage = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are writing the FIRST personalized outreach email to a potential client for EyE PunE, a business growth agency.

Lead Information:
- Name: ${context.name}
- Company: ${context.company || 'Not specified'}
- Industry: ${context.industry || 'Not specified'}
- Lead Source: ${context.source}
- Lead Score: ${context.leadScore || 'Not yet scored'}
${context.hasAssessment ? `
- Completed AI Assessment: Yes
- Growth Score: ${context.growthScore}/100
- Main Challenge: ${context.challenges}
- Growth Goals: ${context.goals}
` : '- Did not complete AI assessment yet'}
${context.notes ? `\nAdditional Notes: ${context.notes}` : ''}

Write a warm, personalized introduction email that:
1. Opens with a personalized greeting referencing how they found us
${context.hasAssessment ? '2. Acknowledges their AI assessment and specific challenges mentioned' : '2. Offers value upfront (free consultation, insights, resources)'}
3. Shows genuine interest in helping them grow their business
4. Includes a clear, low-pressure call-to-action (book a call, ask questions, or explore services)
5. Is conversational, friendly, and feels human (not robotic)
6. Keep it concise (3-4 short paragraphs max)

DO NOT be overly salesy. Focus on building rapport and providing value first.`,
            response_json_schema: {
                type: "object",
                properties: {
                    subject: {
                        type: "string",
                        description: "Compelling email subject line"
                    },
                    body: {
                        type: "string",
                        description: "Email body in plain text format with proper line breaks"
                    },
                    tone: {
                        type: "string",
                        enum: ["friendly", "professional", "casual"],
                        description: "Tone used in the message"
                    }
                },
                required: ["subject", "body"]
            }
        });

        const unsubscribeUrl = `${Deno.env.get('BASE44_APP_URL')}/unsubscribe?email=${encodeURIComponent(lead.email)}`;

        // Add unsubscribe footer
        const fullMessage = `${aiMessage.body}

---

Best regards,
EyE PunE Team
connect@eyepune.com
+91 9284712033

P.S. Not interested? No problem! You can unsubscribe here: ${unsubscribeUrl}
Or simply reply "STOP" to opt out of future emails.`;

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: lead.email,
            subject: aiMessage.subject,
            body: fullMessage
        });

        // Update lead with outreach tag
        const updatedTags = [...(lead.tags || [])];
        if (!updatedTags.includes('outreach-sent')) {
            updatedTags.push('outreach-sent');
        }

        await base44.asServiceRole.entities.Lead.update(lead_id, {
            tags: updatedTags,
            last_contacted: new Date().toISOString()
        });

        // Log activity
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead_id,
            activity_type: 'email',
            title: 'Automated Initial Outreach Sent',
            description: `Subject: ${aiMessage.subject}\n\nTone: ${aiMessage.tone}\n\nMessage previewed and sent successfully.`,
            performed_by: 'Automated Outreach System',
            metadata: {
                subject: aiMessage.subject,
                tone: aiMessage.tone,
                has_assessment: context.hasAssessment,
                automation_type: 'initial_outreach'
            }
        });

        // Track email analytics
        await base44.asServiceRole.entities.EmailAnalytics.create({
            lead_email: lead.email,
            subject: aiMessage.subject,
            sent_date: new Date().toISOString(),
            email_type: 'initial_outreach',
            campaign_name: 'Automated Lead Outreach'
        });

        return Response.json({
            success: true,
            message: 'Personalized outreach sent successfully',
            subject: aiMessage.subject,
            lead_name: lead.full_name
        });

    } catch (error) {
        console.error('Error in automated lead outreach:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});