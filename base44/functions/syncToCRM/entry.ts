import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { lead_id, activity_id, force_sync } = await req.json();

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
            // Skip if sync direction doesn't include "to_external"
            if (config.sync_direction === 'from_external' && !force_sync) {
                continue;
            }

            try {
                let syncResult;

                if (lead_id) {
                    syncResult = await syncLeadToCRM(base44, lead_id, config, base44);
                } else if (activity_id) {
                    syncResult = await syncActivityToCRM(base44, activity_id, config, base44);
                }

                results.push({
                    crm_provider: config.crm_provider,
                    success: true,
                    ...syncResult
                });

                // Update sync stats
                await base44.asServiceRole.entities.CRMSyncConfig.update(config.id, {
                    last_sync: new Date().toISOString(),
                    sync_stats: {
                        total_synced: (config.sync_stats?.total_synced || 0) + 1,
                        last_sync_count: 1,
                        errors: config.sync_stats?.errors || 0
                    }
                });

            } catch (error) {
                console.error(`Error syncing to ${config.crm_provider}:`, error);
                results.push({
                    crm_provider: config.crm_provider,
                    success: false,
                    error: error.message
                });

                // Update error count
                await base44.asServiceRole.entities.CRMSyncConfig.update(config.id, {
                    sync_stats: {
                        ...config.sync_stats,
                        errors: (config.sync_stats?.errors || 0) + 1
                    }
                });
            }
        }

        return Response.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error in CRM sync:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function syncLeadToCRM(base44, lead_id, config, base44Client) {
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
    if (!leads || leads.length === 0) {
        throw new Error('Lead not found');
    }

    const lead = leads[0];
    
    // Map fields according to configuration
    const mappedData = {};
    if (config.field_mappings && config.field_mappings.length > 0) {
        config.field_mappings.forEach(mapping => {
            if (mapping.sync_direction !== 'from_external') {
                mappedData[mapping.external_field] = lead[mapping.internal_field];
            }
        });
    } else {
        // Default mappings
        mappedData.name = lead.full_name;
        mappedData.email = lead.email;
        mappedData.phone = lead.phone;
        mappedData.company = lead.company;
        mappedData.score = lead.lead_score;
        mappedData.status = lead.status;
    }

    // Send to external CRM
    const crmData = await sendToCRM(config, 'contact', mappedData, lead.id, base44Client);

    return {
        entity_type: 'lead',
        entity_id: lead_id,
        external_id: crmData.contact?.id || crmData.id
    };
}

async function syncActivityToCRM(base44, activity_id, config, base44Client) {
    const activities = await base44.asServiceRole.entities.Activity.filter({ id: activity_id });
    if (!activities || activities.length === 0) {
        throw new Error('Activity not found');
    }

    const activity = activities[0];

    const mappedData = {
        title: activity.title,
        description: activity.description,
        type: activity.activity_type,
        date: activity.created_date,
        lead_reference: activity.lead_id
    };

    const crmData = await sendToCRM(config, 'activity', mappedData, activity.id, base44Client);

    return {
        entity_type: 'activity',
        entity_id: activity_id,
        external_id: crmData.activity?.id || crmData.id
    };
}

async function sendToCRM(config, entityType, data, internalId, base44) {
    let endpoint, headers, body;

    switch (config.crm_provider) {
        case 'wix':
            const wixApiKey = Deno.env.get('WIX_API_KEY');
            const wixSiteId = Deno.env.get('WIX_SITE_ID');
            const wixAccountId = Deno.env.get('WIX_ACCOUNT_ID');
            
            if (!wixApiKey || !wixSiteId || !wixAccountId) {
                throw new Error('Missing Wix credentials');
            }
            
            endpoint = `https://www.wixapis.com/contacts/v4/contacts`;
            headers = {
                'Authorization': wixApiKey,
                'wix-site-id': wixSiteId,
                'wix-account-id': wixAccountId,
                'Content-Type': 'application/json'
            };
            body = {
                info: {
                    name: { 
                        first: data.name?.split(' ')[0] || '', 
                        last: data.name?.split(' ').slice(1).join(' ') || '' 
                    },
                    emails: data.email ? [{ 
                        tag: 'MAIN',
                        email: data.email
                    }] : [],
                    phones: data.phone ? [{ 
                        tag: 'MAIN',
                        phone: data.phone
                    }] : []
                },
                ...(data.company && {
                    info: {
                        ...body?.info,
                        company: data.company
                    }
                })
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
            body = {
                properties: {
                    firstname: data.name?.split(' ')[0] || '',
                    lastname: data.name?.split(' ').slice(1).join(' ') || '',
                    email: data.email,
                    phone: data.phone,
                    company: data.company,
                    hs_lead_status: data.status
                }
            };
            break;

        case 'custom':
            const customKey = Deno.env.get('CUSTOM_CRM_API_KEY');
            endpoint = config.api_endpoint;
            headers = {
                'Authorization': `Bearer ${customKey}`,
                'Content-Type': 'application/json'
            };
            body = data;
            break;

        default:
            throw new Error(`Unsupported CRM provider: ${config.crm_provider}`);
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`CRM API error: ${error}`);
    }

    return await response.json();
}