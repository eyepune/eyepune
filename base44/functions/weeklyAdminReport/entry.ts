import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token error');
    return data.access_token;
}

async function sendEmail(to, subject, html) {
    const accessToken = await getAccessToken();
    const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
    const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';
    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAddress, toAddress: to, subject, content: html, mailFormat: 'html' })
    });
    return res.json();
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch all data in parallel
        const [leads, inquiries, bookings, invoices, projects] = await Promise.all([
            base44.asServiceRole.entities.Lead.list('-created_date', 500),
            base44.asServiceRole.entities.Inquiry.list('-created_date', 500),
            base44.asServiceRole.entities.Booking.list('-created_date', 500),
            base44.asServiceRole.entities.Invoice.list('-created_date', 500),
            base44.asServiceRole.entities.ClientProject.list('-created_date', 500),
        ]);

        // Filter to this week
        const thisWeekLeads = leads.filter(l => l.created_date >= oneWeekAgo);
        const thisWeekInquiries = inquiries.filter(i => i.created_date >= oneWeekAgo);
        const thisWeekBookings = bookings.filter(b => b.created_date >= oneWeekAgo);
        
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const thisWeekRevenue = paidInvoices
            .filter(i => i.paid_at >= oneWeekAgo)
            .reduce((sum, i) => sum + (i.total || 0), 0);
        const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
        
        const activeProjects = projects.filter(p => ['onboarding', 'in_progress', 'review'].includes(p.status));
        const overdueInvoices = invoices.filter(i => i.status === 'overdue');
        
        const leadsByStatus = leads.reduce((acc, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
        }, {});

        const weekStr = new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });

        await sendEmail('connect@eyepune.com', `📊 Weekly Business Report — Week of ${weekStr}`, `
            <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:48px;" />
                    <h1 style="color:#fff; margin:16px 0 4px;">Weekly Business Report</h1>
                    <p style="color:rgba(255,255,255,0.6); margin:0;">Week of ${weekStr}</p>
                </div>
                <div style="padding: 30px;">
                    <!-- KPI Grid -->
                    <h3 style="color:#dc2626; border-bottom:2px solid #fee2e2; padding-bottom:8px;">📈 This Week's Activity</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                        <tr>
                            <td style="padding:16px; background:#fff5f5; border-radius:8px; text-align:center; width:25%;">
                                <div style="font-size:28px; font-weight:bold; color:#dc2626;">${thisWeekLeads.length}</div>
                                <div style="font-size:12px; color:#666; margin-top:4px;">New Leads</div>
                            </td>
                            <td style="width:2%;"></td>
                            <td style="padding:16px; background:#f0fdf4; border-radius:8px; text-align:center; width:25%;">
                                <div style="font-size:28px; font-weight:bold; color:#16a34a;">₹${thisWeekRevenue.toLocaleString()}</div>
                                <div style="font-size:12px; color:#666; margin-top:4px;">Revenue This Week</div>
                            </td>
                            <td style="width:2%;"></td>
                            <td style="padding:16px; background:#eff6ff; border-radius:8px; text-align:center; width:25%;">
                                <div style="font-size:28px; font-weight:bold; color:#2563eb;">${thisWeekBookings.length}</div>
                                <div style="font-size:12px; color:#666; margin-top:4px;">New Bookings</div>
                            </td>
                            <td style="width:2%;"></td>
                            <td style="padding:16px; background:#fefce8; border-radius:8px; text-align:center; width:25%;">
                                <div style="font-size:28px; font-weight:bold; color:#ca8a04;">${thisWeekInquiries.length}</div>
                                <div style="font-size:12px; color:#666; margin-top:4px;">Inquiries</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Pipeline -->
                    <h3 style="color:#dc2626; border-bottom:2px solid #fee2e2; padding-bottom:8px;">🔥 Sales Pipeline</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                        ${Object.entries(leadsByStatus).map(([status, count]) => `
                        <tr>
                            <td style="padding:8px; border-bottom:1px solid #f3f4f6; color:#444; text-transform:capitalize;">${status.replace('_', ' ')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold;">${count} leads</td>
                        </tr>`).join('')}
                    </table>

                    <!-- Attention Items -->
                    ${overdueInvoices.length > 0 ? `
                    <div style="background:#fff5f5; border-left:4px solid #dc2626; padding:16px; margin-bottom:24px; border-radius:4px;">
                        <h4 style="margin:0 0 8px; color:#dc2626;">⚠️ ${overdueInvoices.length} Overdue Invoice(s) Need Attention</h4>
                        ${overdueInvoices.map(i => `<p style="margin:4px 0; font-size:13px;">• ${i.client_name} — ₹${(i.total || 0).toLocaleString()} (Due: ${i.due_date})</p>`).join('')}
                    </div>` : ''}

                    <!-- Summary Stats -->
                    <h3 style="color:#dc2626; border-bottom:2px solid #fee2e2; padding-bottom:8px;">📊 All-Time Summary</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;">Total Revenue Collected</td><td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; color:#16a34a;">₹${totalRevenue.toLocaleString()}</td></tr>
                        <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;">Total Leads</td><td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold;">${leads.length}</td></tr>
                        <tr><td style="padding:8px; border-bottom:1px solid #f3f4f6;">Active Projects</td><td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold;">${activeProjects.length}</td></tr>
                        <tr><td style="padding:8px;">Overdue Invoices</td><td style="padding:8px; text-align:right; font-weight:bold; color:${overdueInvoices.length > 0 ? '#dc2626' : '#16a34a'};">${overdueInvoices.length}</td></tr>
                    </table>

                    <div style="text-align:center; margin:30px 0 10px;">
                        <a href="https://eyepune.com/Admin_Dashboard" style="background:#dc2626; color:#fff; text-decoration:none; padding:12px 28px; border-radius:50px; font-weight:bold;">Open Dashboard →</a>
                    </div>
                </div>
            </div>
        `);

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});