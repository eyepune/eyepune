import { NextResponse } from 'next/server';
import { generateStrategyPDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reportMarkdown = `
# Executive Strategy: AI Automation

Welcome to your customized 2026 Growth Blueprint from EyE PunE. Based on your interest in **AI Automation**, we have outlined the exact framework our agency uses to generate hyper-qualified leads and scale revenues autonomously.

## Phase 1: Foundation & Audit
The most critical step in mastering AI Automation is auditing your current digital footprint. We recommend:
* Implementing a unified analytics tracking architecture.
* Scoring your current digital assets for conversion rate optimization.
* Reverse-engineering your top 3 competitors in the AI Automation space.

## Phase 2: AI & Automation Injection
Modern AI Automation strategies require automation to scale.
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
      name: 'John Doe',
      business: 'Strategy for AI Automation',
      score: 95,
      report: reportMarkdown
    });

    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="EyE_PunE_Blueprint_Preview.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF Preview Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF preview' }, { status: 500 });
  }
}
