import { NextResponse } from 'next/server';
import { generateStrategyPDF } from '@/lib/pdf-generator';
import { sendEmail } from '@/lib/email-service';

export async function POST(request) {
  try {
    const { email, keyword, name } = await request.json();

    if (!email || !keyword) {
      return NextResponse.json({ error: 'Missing email or keyword' }, { status: 400 });
    }
    
    const prospectName = name || 'Growth Leader';

    console.log(`[Blueprint Automator] Generating Blueprint for: ${keyword}, sending to: ${email} (${prospectName})`);

    // Generate programmatic SEO blueprint content based on the keyword
    const reportMarkdown = `
# Executive Strategy: ${keyword}

Welcome to your customized 2026 Growth Blueprint from EyE PunE. Based on your interest in **${keyword}**, we have outlined the exact framework our agency uses to generate hyper-qualified leads and scale revenues autonomously.

## Phase 1: Foundation & Audit
The most critical step in mastering ${keyword} is auditing your current digital footprint. We recommend:
* Implementing a unified analytics tracking architecture.
* Scoring your current digital assets for conversion rate optimization.
* Reverse-engineering your top 3 competitors in the ${keyword} space.

## Phase 2: AI & Automation Injection
Modern ${keyword} strategies require automation to scale.
1. Integrate AI-driven CRM workflows to capture intent instantly.
2. Deploy programmatic landing pages tailored to high-converting niches.
3. Utilize AI agents for 24/7 client onboarding and qualification.

## Phase 3: The Scaling Protocol
Once the foundation and AI systems are active:
* Scale paid and organic acquisition channels simultaneously.
* Monitor lead velocity and adjust algorithmic targeting.
* Prepare your sales team for 3x volume using our automated closing scripts.

---

**Next Steps:**
This blueprint provides a high-level roadmap. To execute this with military precision, our Growth Engineers are ready to build this entire system into your business.
    `;

    // Generate PDF Buffer
    const pdfArrayBuffer = await generateStrategyPDF({
      name: prospectName,
      business: `Strategy for ${keyword}`,
      score: 95,
      report: reportMarkdown
    });

    const pdfBase64 = Buffer.from(pdfArrayBuffer).toString('base64');

    // Send via Zoho (using existing email-service)
    const emailResult = await sendEmail({
      to: email,
      subject: `Your EyE PunE Blueprint: ${keyword}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #ef4444;">Your Growth Blueprint is Here!</h2>
          <p>Hi ${prospectName},</p>
          <p>You recently requested our exclusive 2026 <strong>${keyword}</strong> Growth Blueprint.</p>
          <p>I have attached your custom PDF roadmap to this email. This is the exact framework we use to scale our clients globally.</p>
          <p>Once you review the PDF, I highly recommend booking a free strategy session with our team to discuss how we can implement this autonomous system directly into your business.</p>
          <p><a href="https://eyepune.com/Booking" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Your Strategy Call</a></p>
          <br/>
          <p>Best regards,<br/><strong>EyE PunE Team</strong></p>
        </div>
      `,
      attachments: [{
        filename: `${keyword.replace(/\s+/g, '_')}_Blueprint.pdf`,
        content: pdfBase64,
        type: 'application/pdf'
      }]
    });

    console.log(`[Blueprint Automator] Blueprint sent successfully to ${email}`);

    return NextResponse.json({ success: true, emailResult });
  } catch (error) {
    console.error('[Blueprint Automator] Failed to generate/send blueprint:', error);
    return NextResponse.json({ error: 'Failed to automate blueprint' }, { status: 500 });
  }
}
