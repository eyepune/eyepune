import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { contract_id } = await req.json();

        if (!contract_id) {
            return Response.json({ error: 'Contract ID required' }, { status: 400 });
        }

        const contracts = await base44.entities.Contract.filter({ id: contract_id });
        const contract = contracts[0];

        if (!contract) {
            return Response.json({ error: 'Contract not found' }, { status: 404 });
        }

        const appUrl = Deno.env.get('BASE44_APP_URL') || 'https://your-app.base44.app';
        const signUrl = `${appUrl}/SignContract?id=${contract_id}`;

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Contract Signature Required</h2>
                
                <p>Dear ${contract.party_name},</p>
                
                <p>You have received a new contract from EyE PunE that requires your electronic signature.</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Contract Number:</strong> ${contract.contract_number}</p>
                    <p style="margin: 5px 0;"><strong>Contract Type:</strong> ${contract.contract_type.replace(/_/g, ' ')}</p>
                    ${contract.contract_value ? `<p style="margin: 5px 0;"><strong>Value:</strong> ₹${Number(contract.contract_value).toLocaleString()}</p>` : ''}
                </div>
                
                <p>Please click the button below to review and sign the contract:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${signUrl}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Review & Sign Contract
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    This link will take you to a secure page where you can review the contract details and provide your electronic signature.
                </p>
                
                <p style="color: #6b7280; font-size: 14px;">
                    If you have any questions, please contact us at connect@eyepune.com
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} EyE PunE. All rights reserved.
                </p>
            </div>
        `;

        await base44.integrations.Core.SendEmail({
            to: contract.party_email,
            subject: `Contract Signature Required - ${contract.contract_number}`,
            body: emailBody
        });

        await base44.entities.Contract.update(contract_id, {
            status: 'sent',
            sent_for_signature_date: new Date().toISOString()
        });

        return Response.json({ 
            success: true,
            message: 'Contract sent for signature',
            sign_url: signUrl
        });

    } catch (error) {
        console.error('Error sending contract:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});