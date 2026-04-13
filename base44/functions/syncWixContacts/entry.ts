import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get Wix OAuth access token
        const { accessToken } = await base44.asServiceRole.connectors.getConnection("wix");

        // Fetch all contacts with pagination
        let allContacts = [];
        let offset = 0;
        const limit = 1000;

        while (true) {
            const response = await fetch('https://www.wixapis.com/contacts/v4/contacts/query', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        fieldsets: ['FULL'],
                        paging: { limit, offset }
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Wix API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const contacts = data.contacts || [];
            allContacts = allContacts.concat(contacts);

            if (contacts.length < limit) break;
            offset += limit;
        }

        // Get existing leads to avoid duplicates
        const existingLeads = await base44.asServiceRole.entities.Lead.list();
        const existingEmails = new Set(existingLeads.map(l => l.email?.toLowerCase()).filter(Boolean));

        // Map new leads (skip duplicates)
        let skipped = 0;
        const newLeads = [];

        for (const contact of allContacts) {
            const email = contact.primaryInfo?.email || contact.info?.emails?.items?.[0]?.email;
            if (!email) { skipped++; continue; }
            if (existingEmails.has(email.toLowerCase())) { skipped++; continue; }

            const firstName = contact.info?.name?.first || '';
            const lastName = contact.info?.name?.last || '';
            const fullName = `${firstName} ${lastName}`.trim() || email;
            const phone = contact.primaryInfo?.phone || contact.info?.phones?.items?.[0]?.phone || '';
            const company = contact.info?.company || '';

            newLeads.push({
                full_name: fullName,
                email: email,
                phone: phone,
                company: company,
                source: 'other',
                status: 'new',
                tags: ['wix_sync']
            });
            existingEmails.add(email.toLowerCase());
        }

        // Bulk create in batches of 50
        let created = 0;
        const batchSize = 50;
        for (let i = 0; i < newLeads.length; i += batchSize) {
            const batch = newLeads.slice(i, i + batchSize);
            await base44.asServiceRole.entities.Lead.bulkCreate(batch);
            created += batch.length;
            if (i + batchSize < newLeads.length) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        return Response.json({
            success: true,
            total_fetched: allContacts.length,
            created,
            skipped
        });

    } catch (error) {
        console.error('syncWixContacts error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});