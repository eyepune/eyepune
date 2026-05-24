import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch active CRM configurations
        const configs = await base44.asServiceRole.entities.CRMSyncConfig.filter({
            is_active: true
        });

        if (!configs || configs.length === 0) {
            return Response.json({ 
                success: false, 
                message: 'No active CRM sync configurations' 
            });
        }

        const results = [];

        for (const config of configs) {
            // Skip if sync direction doesn't include "from_external"
            if (config.sync_direction === 'to_external') {
                continue;
            }

            try {
                const externalData = await fetchFromCRM(config, base44);
                const imported = await importLeadsFromCRM(base44, externalData, config);

                results.push({
                    crm_provider: config.crm_provider,
                    success: true,
                    imported_count: imported.length
                });

                // Update sync stats
                await base44.asServiceRole.entities.CRMSyncConfig.update(config.id, {
                    last_sync: new Date().toISOString(),
                    sync_stats: {
                        total_synced: (config.sync_stats?.total_synced || 0) + imported.length,
                        last_sync_count: imported.length,
                        errors: config.sync_stats?.errors || 0
                    }
                });

            } catch (error) {
                console.error(`Error syncing from ${config.crm_provider}:`, error);
                results.push({
                    crm_provider: config.crm_provider,
                    success: false,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error in CRM sync from external:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchFromCRM(config, base44) {
    let endpoint, headers;

    switch (config.crm_provider) {
        case 'wix':
            const wixApiKey = Deno.env.get('WIX_API_KEY');
            const wixSiteId = Deno.env.get('WIX_SITE_ID');
            const wixAccountId = Deno.env.get('WIX_ACCOUNT_ID');
            
            if (!wixApiKey || !wixSiteId || !wixAccountId) {
                throw new Error('Missing Wix credentials');
            }
            
            endpoint = `https://www.wixapis.com/contacts/v4/contacts/query`;
            headers = {
                'Authorization': wixApiKey,
                'wix-site-id': wixSiteId,
                'wix-account-id': wixAccountId,
                'Content-Type': 'application/json'
            };
            break;

        case 'hubspot':
            const hubspotKey = Deno.env.get('HUBSPOT_API_KEY');
            if (!hubspotKey) {
                throw new Error('Missing HubSpot API Key');
            }
            endpoint = `https://api.hubapi.com/crm/v3/objects/contacts`;
            headers = {
                'Authorization': `Bearer ${hubspotKey}`,
                'Content-Type': 'application/json'
            };
            break;

        case 'custom':
            const customKey = Deno.env.get('CUSTOM_CRM_API_KEY');
            endpoint = config.api_endpoint;
            headers = {
                'Authorization': `Bearer ${customKey}`,
                'Content-Type': 'application/json'
            };
            break;

        default:
            throw new Error(`Unsupported CRM provider: ${config.crm_provider}`);
    }

    const requestOptions = {
        headers
    };

    // Wix requires POST for query
    if (config.crm_provider === 'wix') {
        requestOptions.method = 'POST';
        requestOptions.body = JSON.stringify({
            query: {
                paging: {
                    limit: 100
                }
            }
        });
    } else {
        requestOptions.method = 'GET';
    }

    const response = await fetch(endpoint, requestOptions);

    if (!response.ok) {
        throw new Error(`CRM API error: ${response.statusText}`);
    }

    return await response.json();
}

async function importLeadsFromCRM(base44, externalData, config) {
    const imported = [];
    let contacts = [];

    // Parse response based on CRM provider
    switch (config.crm_provider) {
        case 'wix':
            contacts = externalData.contacts || externalData.contactsV4?.contacts || [];
            break;
        case 'hubspot':
            contacts = externalData.results || [];
            break;
        case 'custom':
            contacts = Array.isArray(externalData) ? externalData : externalData.contacts || [];
            break;
    }

    for (const contact of contacts) {
        try {
            const leadData = mapExternalToInternal(contact, config);
            
            // Check if lead already exists
            const existing = await base44.asServiceRole.entities.Lead.filter({
                email: leadData.email
            });

            if (existing && existing.length > 0) {
                // Update existing lead
                const lead = existing[0];
                await base44.asServiceRole.entities.Lead.update(lead.id, leadData);
                imported.push({ id: lead.id, action: 'updated' });
            } else {
                // Create new lead
                const newLead = await base44.asServiceRole.entities.Lead.create(leadData);
                imported.push({ id: newLead.id, action: 'created' });
            }
        } catch (error) {
            console.error('Error importing contact:', error);
        }
    }

    return imported;
}

function mapExternalToInternal(contact, config) {
    const mapped = {};

    if (config.field_mappings && config.field_mappings.length > 0) {
        config.field_mappings.forEach(mapping => {
            if (mapping.sync_direction !== 'to_external') {
                mapped[mapping.internal_field] = getNestedValue(contact, mapping.external_field);
            }
        });
    } else {
        // Default mappings based on CRM provider
        switch (config.crm_provider) {
            case 'wix':
                mapped.full_name = `${contact.info?.name?.first || ''} ${contact.info?.name?.last || ''}`.trim();
                mapped.email = contact.info?.emails?.[0]?.email;
                mapped.phone = contact.info?.phones?.[0]?.phone;
                mapped.company = contact.customFields?.company;
                mapped.lead_score = contact.customFields?.leadScore;
                mapped.status = contact.customFields?.status || 'new';
                break;

            case 'hubspot':
                mapped.full_name = `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim();
                mapped.email = contact.properties?.email;
                mapped.phone = contact.properties?.phone;
                mapped.company = contact.properties?.company;
                mapped.status = contact.properties?.hs_lead_status || 'new';
                break;

            case 'custom':
                mapped.full_name = contact.name;
                mapped.email = contact.email;
                mapped.phone = contact.phone;
                mapped.company = contact.company;
                mapped.lead_score = contact.score;
                mapped.status = contact.status || 'new';
                break;
        }
    }

    mapped.source = mapped.source || 'external_crm';
    return mapped;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}