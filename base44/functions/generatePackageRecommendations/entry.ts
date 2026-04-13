import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { businessType, challenges, budget, industry } = await req.json();

        // Get existing packages and addons for context
        const existingPackages = await base44.asServiceRole.entities.Pricing_Plan.filter({ is_active: true });
        const existingAddons = await base44.asServiceRole.entities.ServiceAddon.filter({ is_active: true });

        // Use AI to generate recommendations
        const recommendations = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a pricing strategist for a business growth agency (EyE PunE) that offers:
- Social Media Management & Marketing
- Web & App Development
- AI Automation Solutions
- Branding & Design
- Business Growth Consulting

Context:
- Business Type: ${businessType}
- Main Challenges: ${challenges}
- Budget Range: ${budget || 'Not specified'}
- Industry: ${industry || 'Not specified'}

Existing Packages (for reference):
${existingPackages.map(p => `- ${p.name}: ₹${p.price} (${p.category})`).join('\n')}

Existing Add-ons (for reference):
${existingAddons.map(a => `- ${a.name}: ₹${a.price} (${a.category})`).join('\n')}

Task: Suggest 2-3 custom packages tailored to this business profile.

For each package, provide:
1. A compelling package name
2. Detailed description (2-3 sentences)
3. Recommended price in INR (based on market rates and value provided)
4. List of 5-8 specific features/deliverables
5. Suggested billing cycle (one_time, monthly, quarterly, yearly)
6. Category (starter, growth, scale, enterprise)
7. Whether it should be marked as popular

Also recommend 3-5 add-on services that would complement these packages:
- Add-on name
- Description
- Price in INR
- Category
- Which base package categories it's compatible with

Pricing Guidelines:
- Starter packages: ₹25,000 - ₹75,000
- Growth packages: ₹75,000 - ₹2,00,000
- Scale packages: ₹2,00,000 - ₹5,00,000
- Enterprise: ₹5,00,000+
- Add-ons: ₹5,000 - ₹50,000

Be specific and actionable. Focus on solving their actual challenges.`,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    packages: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                description: { type: "string" },
                                price: { type: "number" },
                                features: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                billing_cycle: { type: "string" },
                                category: { type: "string" },
                                is_popular: { type: "boolean" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    addons: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                description: { type: "string" },
                                price: { type: "number" },
                                category: { type: "string" },
                                compatible_with: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    overall_strategy: { type: "string" }
                }
            }
        });

        return Response.json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});