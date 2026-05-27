import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: templates, error } = await supabaseAdmin.from('email_templates').select('*');
    
    if (error) throw error;
    
    let updated = 0;
    for (const template of templates) {
      if (template.content && template.content.includes('EyE PunE')) {
        const replacementHtml = `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
  <img src="https://eyepune.com/logo.svg" alt="Logo" style="height: 32px;" />
  <h2 style="margin: 0; color: #111827; font-size: 26px; font-weight: 900;">EyE <span style="color: #ef4444;">PunE</span></h2>
</div>`;

        let newContent = template.content.replace(/# EyE PunE.*/g, replacementHtml);
        newContent = newContent.replace(/<h[1-2][^>]*>.*?EyE PunE.*?<\/h[1-2]>/ig, replacementHtml);
        
        if (newContent !== template.content) {
            await supabaseAdmin.from('email_templates').update({ content: newContent }).eq('id', template.id);
            updated++;
        }
      }
    }
    
    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return new NextResponse(err.stack, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}
