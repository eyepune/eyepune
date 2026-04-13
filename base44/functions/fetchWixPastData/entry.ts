import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const WIX_API_KEY = Deno.env.get('WIX_API_KEY');
const WIX_ACCOUNT_ID = Deno.env.get('WIX_ACCOUNT_ID');
const WIX_SITE_ID = Deno.env.get('WIX_SITE_ID');

const wixHeaders = {
    'Authorization': WIX_API_KEY,
    'wix-account-id': WIX_ACCOUNT_ID,
    'wix-site-id': WIX_SITE_ID,
    'Content-Type': 'application/json',
};

async function fetchWixInvoices() {
    const res = await fetch('https://www.wixapis.com/invoices/v1/invoices/list', {
        method: 'POST',
        headers: wixHeaders,
        body: JSON.stringify({ paging: { limit: 200 } }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.invoices || [];
}

async function fetchWixContacts() {
    const res = await fetch('https://www.wixapis.com/contacts/v4/contacts?limit=200', {
        headers: wixHeaders,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.contacts || [];
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { type = 'all' } = body;

        const results = {};

        if (type === 'all' || type === 'invoices') {
            results.invoices = await fetchWixInvoices();
        }

        if (type === 'all' || type === 'contacts') {
            results.contacts = await fetchWixContacts();
        }

        // Enrich with our lead data for cross-reference
        if (type === 'all' || type === 'leads') {
            const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 2000);
            results.leads_count = leads.length;

            // Cross-reference invoices with leads
            if (results.invoices && leads) {
                const leadEmails = new Set(leads.map(l => l.email?.toLowerCase()));
                results.past_clients = results.invoices
                    .filter(inv => inv.status === 'PAID')
                    .map(inv => ({
                        id: inv.id,
                        customer_name: inv.customer?.name || '',
                        customer_email: inv.customer?.email || '',
                        total: inv.totals?.total || 0,
                        currency: inv.currency || 'INR',
                        status: inv.status,
                        created_date: inv.dates?.issueDate,
                        invoice_number: inv.number,
                        is_known_lead: leadEmails.has(inv.customer?.email?.toLowerCase()),
                    }));
            }
        }

        return Response.json({ success: true, ...results });
    } catch (error) {
        console.error('fetchWixPastData error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});