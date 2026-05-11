import { generateStrategyPDF } from '@/lib/pdf-generator';

export async function POST(request) {
    try {
        const data = await request.json();
        
        if (!data.name || !data.report) {
            return new Response(JSON.stringify({ error: 'Missing required data' }), { status: 400 });
        }

        const pdfBuffer = await generateStrategyPDF(data);

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="EyE_PunE_Strategy_${data.name.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('[PDF-API] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
