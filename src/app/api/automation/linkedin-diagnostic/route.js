import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const setOrgId = searchParams.get('orgId');
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // -- AUTO-FIX FEATURE --
        if (setOrgId) {
            const { data: config } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'linkedin_config')
                .single();

            let newValue = config?.value || {};
            newValue.urn = `urn:li:organization:${setOrgId}`;

            await supabase
                .from('system_settings')
                .upsert({ key: 'linkedin_config', value: newValue });

            return NextResponse.json({
                success: true,
                message: `SUCCESS! Your LinkedIn Organization ID (${setOrgId}) has been hardcoded into the database. All future AI blogs and automated posts will now hit the EyE PunE Company Page!`
            });
        }

        let diagnostics = {
            status: 'Checking...',
            errors: [],
            warnings: [],
            success: false,
            data: {
                hasEnvToken: false,
                hasDbToken: false,
                tokenStatus: 'Unknown',
                personUrn: null,
                organizationUrn: null,
                targetUrn: null
            }
        };

        // 1. Check Token Sources
        diagnostics.data.hasEnvToken = !!process.env.LINKEDIN_ACCESS_TOKEN;
        
        const { data: config } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'linkedin_config')
            .single();

        if (config?.value?.token) {
            diagnostics.data.hasDbToken = true;
        }

        const token = config?.value?.token || process.env.LINKEDIN_ACCESS_TOKEN;
        const dbUrn = config?.value?.urn;

        if (!token) {
            diagnostics.errors.push("No LinkedIn Access Token found in Database or Environment Variables.");
            diagnostics.status = "FAILED";
            return NextResponse.json(diagnostics, { status: 400 });
        }

        // 2. Validate Token via LinkedIn API
        const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!meRes.ok) {
            const errData = await meRes.text();
            diagnostics.errors.push(`LinkedIn Token is INVALID or EXPIRED. HTTP ${meRes.status}: ${errData}`);
            diagnostics.data.tokenStatus = 'Invalid/Expired';
            diagnostics.status = "FAILED";
            return NextResponse.json(diagnostics, { status: 401 });
        }

        const meData = await meRes.json();
        if (meData.sub) {
            diagnostics.data.personUrn = `urn:li:person:${meData.sub}`;
            diagnostics.data.tokenStatus = 'Valid';
        } else {
            diagnostics.errors.push("Token is valid, but couldn't retrieve user profile URN.");
        }

        // 3. Check Organization ID
        const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
        if (orgId) {
            diagnostics.data.organizationUrn = `urn:li:organization:${orgId}`;
            diagnostics.data.targetUrn = diagnostics.data.organizationUrn;
            diagnostics.warnings.push("Environment Organization ID found. The system will attempt to post to the Company Page first.");
        } else if (dbUrn && dbUrn.includes('organization')) {
            diagnostics.data.organizationUrn = dbUrn;
            diagnostics.data.targetUrn = dbUrn;
            diagnostics.warnings.push("Database Organization ID found. The system is perfectly configured to post to the Company Page!");
        } else {
            diagnostics.data.targetUrn = diagnostics.data.personUrn;
            diagnostics.warnings.push("No LINKEDIN_ORGANIZATION_ID found. The system will post to your Personal LinkedIn Profile. To fix this, add ?orgId=YOUR_COMPANY_ID to the end of this URL.");
        }

        // Finalize
        if (diagnostics.errors.length === 0) {
            diagnostics.status = "HEALTHY";
            diagnostics.success = true;
        }

        return NextResponse.json(diagnostics);

    } catch (error) {
        return NextResponse.json({
            status: "CRITICAL_ERROR",
            success: false,
            errors: [error.message]
        }, { status: 500 });
    }
}
