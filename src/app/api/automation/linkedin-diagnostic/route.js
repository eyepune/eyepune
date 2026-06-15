import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

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
            diagnostics.warnings.push("Organization ID found. The system will attempt to post to the Company Page first. Ensure your token has 'w_organization_social' scopes.");
        } else {
            diagnostics.data.targetUrn = diagnostics.data.personUrn;
            diagnostics.warnings.push("No LINKEDIN_ORGANIZATION_ID found. The system will post to your Personal LinkedIn Profile.");
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
