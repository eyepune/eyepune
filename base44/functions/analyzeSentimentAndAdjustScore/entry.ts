import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { lead_id, conversation_text, current_activity } = await req.json();

        if (!lead_id || !conversation_text) {
            return Response.json({ error: 'lead_id and conversation_text are required' }, { status: 400 });
        }

        // Use AI to analyze sentiment
        const sentimentAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyze the sentiment of this sales conversation and provide a detailed assessment.

Conversation:
"""
${conversation_text}
"""

Analyze:
1. Overall sentiment (positive, neutral, negative, mixed)
2. Specific buying signals (if any)
3. Concerns or objections raised
4. Engagement level (high, medium, low)
5. Recommended action for sales team

Provide your analysis in structured format.`,
            response_json_schema: {
                type: "object",
                properties: {
                    sentiment: {
                        type: "string",
                        enum: ["positive", "neutral", "negative", "mixed"],
                        description: "Overall sentiment of the conversation"
                    },
                    confidence: {
                        type: "number",
                        description: "Confidence level 0-100"
                    },
                    buying_signals: {
                        type: "array",
                        items: { type: "string" },
                        description: "Specific buying signals detected"
                    },
                    concerns: {
                        type: "array",
                        items: { type: "string" },
                        description: "Concerns or objections raised"
                    },
                    engagement_level: {
                        type: "string",
                        enum: ["high", "medium", "low"]
                    },
                    key_phrases: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key phrases indicating sentiment"
                    },
                    recommended_action: {
                        type: "string",
                        description: "What the sales team should do next"
                    },
                    urgency_level: {
                        type: "string",
                        enum: ["immediate", "within_24h", "within_week", "routine"]
                    }
                },
                required: ["sentiment", "confidence", "engagement_level", "recommended_action"]
            }
        });

        const sentiment = sentimentAnalysis.sentiment;
        const analysis = sentimentAnalysis;

        // Fetch current lead data
        const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
        if (!leads || leads.length === 0) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        const lead = leads[0];
        const currentScore = lead.lead_score || 50;

        // Calculate score adjustment
        let scoreAdjustment = 0;
        switch (sentiment) {
            case 'positive':
                scoreAdjustment = 5;
                break;
            case 'neutral':
                scoreAdjustment = 0;
                break;
            case 'negative':
                scoreAdjustment = -10;
                break;
            case 'mixed':
                scoreAdjustment = -3;
                break;
        }

        const newScore = Math.max(0, Math.min(100, currentScore + scoreAdjustment));

        // Update lead score and tags
        const currentTags = lead.tags || [];
        let updatedTags = [...currentTags];

        // Add sentiment tag
        if (sentiment === 'negative' && !updatedTags.includes('negative-sentiment')) {
            updatedTags.push('negative-sentiment');
        }
        if (sentiment === 'positive' && !updatedTags.includes('high-engagement')) {
            updatedTags.push('high-engagement');
        }

        // Remove negative tag if sentiment improved
        if (sentiment === 'positive' && updatedTags.includes('negative-sentiment')) {
            updatedTags = updatedTags.filter(t => t !== 'negative-sentiment');
        }

        await base44.asServiceRole.entities.Lead.update(lead_id, {
            lead_score: newScore,
            tags: updatedTags,
            notes: (lead.notes || '') + `\n\n[${new Date().toLocaleDateString()}] Sentiment: ${sentiment} (${analysis.confidence}% confidence) | Score: ${currentScore} → ${newScore}`
        });

        // Create detailed activity log
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead_id,
            activity_type: 'note',
            title: `Sentiment Analysis: ${sentiment.toUpperCase()}`,
            description: `Engagement: ${analysis.engagement_level} | Confidence: ${analysis.confidence}%\n\n` +
                `Buying Signals: ${analysis.buying_signals?.join(', ') || 'None detected'}\n` +
                `Concerns: ${analysis.concerns?.join(', ') || 'None'}\n\n` +
                `Action: ${analysis.recommended_action}\n` +
                `Urgency: ${analysis.urgency_level}`,
            performed_by: 'AI Sentiment Analyzer',
            metadata: {
                sentiment: sentiment,
                confidence: analysis.confidence,
                score_change: scoreAdjustment,
                old_score: currentScore,
                new_score: newScore,
                buying_signals: analysis.buying_signals,
                concerns: analysis.concerns,
                engagement_level: analysis.engagement_level,
                key_phrases: analysis.key_phrases,
                urgency: analysis.urgency_level
            }
        });

        // For negative sentiment, create urgent follow-up
        if (sentiment === 'negative' || analysis.urgency_level === 'immediate') {
            await base44.asServiceRole.entities.Activity.create({
                lead_id: lead_id,
                activity_type: 'call',
                title: '⚠️ URGENT: Negative Sentiment - Human Intervention Required',
                description: `PRIORITY FOLLOW-UP NEEDED\n\n` +
                    `Concerns raised: ${analysis.concerns?.join(', ')}\n` +
                    `Recommended action: ${analysis.recommended_action}\n\n` +
                    `Admin: Contact within 24 hours to address concerns and rebuild trust.`,
                performed_by: 'AI Sales Assistant',
                metadata: {
                    priority: 'urgent',
                    sentiment_alert: true,
                    urgency: analysis.urgency_level,
                    requires_admin: true
                }
            });
        }

        return Response.json({
            success: true,
            sentiment: sentiment,
            confidence: analysis.confidence,
            scoreAdjustment: scoreAdjustment,
            oldScore: currentScore,
            newScore: newScore,
            analysis: analysis,
            urgentFollowupCreated: sentiment === 'negative' || analysis.urgency_level === 'immediate'
        });

    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});