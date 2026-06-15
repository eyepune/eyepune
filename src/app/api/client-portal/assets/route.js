import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Basic auth check for Client Portal requests
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const clientId = formData.get('clientId') || 'anonymous_client';
        const projectPhase = formData.get('projectPhase') || 'onboarding';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert the uploaded file to a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage - 'client_assets' bucket
        const fileName = `${clientId}/${projectPhase}_${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('client_assets')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('[Asset Vault] Storage upload error:', error);
            return NextResponse.json({ error: 'Storage error' }, { status: 500 });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('client_assets')
            .getPublicUrl(fileName);

        // Log the asset to the database
        await supabase.from('activity_logs').insert([{
            action: 'client_asset_upload',
            details: `Client ${clientId} uploaded ${file.name}`,
            status: 'success'
        }]);

        return NextResponse.json({ 
            success: true, 
            fileUrl: publicUrlData.publicUrl,
            message: 'Asset successfully secured in the vault.'
        });

    } catch (error) {
        console.error('[Asset Vault] Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
