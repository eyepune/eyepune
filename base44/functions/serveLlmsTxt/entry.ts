/**
 * Serves /llms.txt – machine-readable site summary for LLM crawlers
 * Spec: https://llmstxt.org/
 */
Deno.serve(async (req) => {
    try {
        const siteUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";

        const llmsTxt = `# EyE PunE

> EyE PunE is Pune's all-in-one digital growth agency helping businesses Connect, Engage, and Grow using proven systems and AI-powered tools.

EyEPunE (also written as EyE PunE) is a full-service digital marketing and technology agency based in Pune, Maharashtra, India. Founded to help ambitious Indian businesses scale predictably, the agency integrates sales, marketing, and technology into a single service model.

## Services

- [Social Media Management](${siteUrl}/Services_Detail): Content creation, scheduling, community management across Instagram, Facebook, LinkedIn, X, YouTube and more. Plans from ₹30,000/month.
- [Website Development](${siteUrl}/Services_Detail): Responsive websites, custom UI/UX, CMS, web apps and SaaS platforms from ₹25,000.
- [AI Automation](${siteUrl}/Services_Detail): AI chatbots, workflow automation, CRM integration, custom AI agents and LLM integrations from ₹40,000.
- [Paid Advertising](${siteUrl}/Services_Detail): Meta Ads (Facebook + Instagram) and Google Ads campaign management from ₹20,000/month.
- [Branding & Creative](${siteUrl}/Services_Detail): Logo design, brand identity, marketing graphics and promotional videos from ₹10,000.
- [Lead Generation & Sales](${siteUrl}/Services_Detail): Targeted campaigns, appointment booking and CRM tracking at ₹800–₹6,000 per lead/appointment.

## Pricing

Full transparent pricing available at: [${siteUrl}/Pricing](${siteUrl}/Pricing)

## Key Pages

- [Home](${siteUrl}/Home)
- [Services](${siteUrl}/Services_Detail)
- [Pricing](${siteUrl}/Pricing)
- [Blog](${siteUrl}/Blog)
- [About Us](${siteUrl}/About)
- [Contact](${siteUrl}/Contact)
- [Free AI Business Assessment](${siteUrl}/AI_Assessment)
- [Book a Consultation](${siteUrl}/Booking)

## Contact

- Email: connect@eyepune.com
- Phone: +91 7718899466 / +91 9284712033
- Location: Pune, Maharashtra, India
- WhatsApp: https://wa.me/917718899466
- LinkedIn: https://linkedin.com/company/eyepune
- Instagram: https://instagram.com/eyepune

## About

EyE PunE was founded to bridge the gap between digital strategy and execution for growing businesses. We serve startups, SMEs and established brands across India with result-oriented, AI-integrated marketing and technology solutions.
`;

        return new Response(llmsTxt, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});