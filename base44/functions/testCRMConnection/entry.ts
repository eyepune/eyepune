import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { crm_provider } = await req.json();

        let result;
        
        switch (crm_provider) {
            case 'wix':
                result = await testWixConnection();
                break;
            case 'hubspot':
                result = await testHubSpotConnection();
                break;
            default:
                throw new Error('Unsupported CRM provider');
        }

        return Response.json(result);

    } catch (error) {
        console.error('Connection test error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});

async function testWixConnection() {
    const apiKey = Deno.env.get('WIX_API_KEY');
    const siteId = Deno.env.get('WIX_SITE_ID');
    const accountId = Deno.env.get('WIX_ACCOUNT_ID');

    if (!apiKey || !siteId || !accountId) {
        return {
            success: false,
            error: 'Missing Wix credentials. Please set WIX_API_KEY, WIX_SITE_ID, and WIX_ACCOUNT_ID'
        };
    }

    try {
        // Test API connection by querying contacts
        const response = await fetch(`https://www.wixapis.com/contacts/v4/contacts/query`, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'wix-site-id': siteId,
                'wix-account-id': accountId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    paging: {
                        limit: 1
                    }
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return {
                success: false,
                error: `Wix API Error: ${response.status} - ${error}`
            };
        }

        const data = await response.json();
        
        return {
            success: true,
            message: 'Successfully connected to Wix',
            contact_count: data.totalCount || 0
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function testHubSpotConnection() {
    const apiKey = Deno.env.get('HUBSPOT_API_KEY');

    if (!apiKey) {
        return {
            success: false,
            error: 'Missing HubSpot API Key. Please set HUBSPOT_API_KEY'
        };
    }

    try {
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            return {
                success: false,
                error: `HubSpot API Error: ${response.status} - ${error}`
            };
        }

        const data = await response.json();
        
        return {
            success: true,
            message: 'Successfully connected to HubSpot',
            contact_count: data.total || 0
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}