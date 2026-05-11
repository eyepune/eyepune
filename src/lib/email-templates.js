/**
 * EyE PunE Elite Email Templates
 * Professional, high-conversion HTML templates for client and admin notifications.
 */

const BRAND_COLOR = '#ef4444'; // EyE PunE Red
const ACCENT_COLOR = '#f97316'; // Orange
const TEXT_COLOR = '#111827';
const BG_COLOR = '#ffffff';

export const getClientWelcomeTemplate = (name, service = 'Growth Solutions') => `
<div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: ${BG_COLOR}; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">EyE PunE</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">The Future of Digital Growth</p>
    </div>
    <div style="padding: 40px 30px;">
        <h2 style="color: ${TEXT_COLOR}; font-size: 22px; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            Thank you for reaching out to **EyE PunE**. We've received your inquiry regarding <strong>${service}</strong>.
        </p>
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            Our strategy team is currently reviewing your details. We don't just "reply"—we analyze your business and come back with a clear roadmap for growth.
        </p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid ${BRAND_COLOR};">
            <h3 style="margin-top: 0; font-size: 16px; color: ${TEXT_COLOR};">What happens next?</h3>
            <ul style="padding-left: 20px; margin-bottom: 0; color: #4b5563;">
                <li>Initial research on your industry.</li>
                <li>Strategic review by our growth experts.</li>
                <li>Call scheduled (within 24 business hours).</li>
            </ul>
        </div>
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            If you're in a hurry, you can book a direct strategy call below:
        </p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://eyepune.com/Booking" style="background: ${BRAND_COLOR}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Book Strategy Call →</a>
        </div>
    </div>
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">&copy; 2026 EyE PunE. Pune, Maharashtra.</p>
        <div style="margin-top: 15px;">
            <a href="https://instagram.com/eyepune" style="color: ${BRAND_COLOR}; text-decoration: none; margin: 0 10px;">Instagram</a>
            <a href="https://linkedin.com/company/eyepune" style="color: ${BRAND_COLOR}; text-decoration: none; margin: 0 10px;">LinkedIn</a>
        </div>
    </div>
</div>
`;

export const getBookingConfirmationTemplate = (name, date, time) => `
<div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: ${BG_COLOR}; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
    <div style="background: #000; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed</h1>
    </div>
    <div style="padding: 40px 30px;">
        <p style="color: #4b5563; font-size: 16px;">Hi ${name}, your discovery call is locked in.</p>
        <div style="background: #fef2f2; border: 1px solid ${BRAND_COLOR}20; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <div style="font-size: 14px; color: ${BRAND_COLOR}; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Date & Time</div>
            <div style="font-size: 20px; font-weight: bold; color: ${TEXT_COLOR};">${date}</div>
            <div style="font-size: 18px; color: #4b5563; margin-top: 4px;">at ${time} (IST)</div>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
            We'll be meeting over Google Meet. Please make sure you're in a quiet place with a good internet connection.
        </p>
        <a href="https://meet.google.com/lookup/eyepune" style="display: block; background: #111; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Join Meeting →</a>
    </div>
</div>
`;

export const getAdminNotificationTemplate = (type, data) => `
<div style="font-family: sans-serif; padding: 20px; background: #f3f4f6;">
    <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">🔔 New ${type}</h2>
        <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(data).map(([key, val]) => `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; width: 120px; text-transform: capitalize;">${key.replace('_', ' ')}</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${val}</td>
                </tr>
            `).join('')}
        </table>
        <div style="margin-top: 24px;">
            <a href="https://eyepune.com/Admin_CRM" style="background: ${BRAND_COLOR}; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage in CRM</a>
        </div>
    </div>
</div>
`;

export const getClientKickoffTemplate = (name) => `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #333;">
    <div style="padding: 60px 40px; text-align: center; background: linear-gradient(to bottom, #111, #000);">
        <div style="display: inline-block; padding: 10px 20px; background: #ef444420; border: 1px solid #ef444440; border-radius: 100px; color: #ef4444; font-size: 12px; font-weight: 900; letter-spacing: 2px; margin-bottom: 30px;">PARTNERSHIP ACTIVE</div>
        <h1 style="font-size: 42px; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -2px;">Welcome to the Elite.</h1>
        <p style="color: #666; font-size: 18px; margin-top: 20px;">Your growth engine is now online.</p>
    </div>
    <div style="padding: 40px; background: #0a0a0a;">
        <p style="font-size: 18px; line-height: 1.6; color: #ccc;">Hi ${name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #999;">
            We are thrilled to officially welcome you to the <strong>EyE PunE</strong> ecosystem. Your project has been initialized in our command center.
        </p>
        
        <div style="margin: 40px 0; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 30px 0;">
            <p style="font-size: 12px; font-weight: 900; color: #ef4444; margin-bottom: 15px; letter-spacing: 1px;">NEXT STEPS</p>
            <div style="margin-bottom: 15px; color: #fff; font-weight: bold;">1. Access Your Command Center</div>
            <p style="color: #666; font-size: 14px; margin-bottom: 25px;">Track milestones, review deliverables, and message your strategist in real-time.</p>
            
            <div style="margin-bottom: 15px; color: #fff; font-weight: bold;">2. Complete the Setup Wizard</div>
            <p style="color: #666; font-size: 14px;">Provide the necessary assets and access so our engineers can begin calibration.</p>
        </div>

        <a href="https://eyepune.com/Client_Dashboard" style="display: block; background: #ef4444; color: #fff; text-align: center; padding: 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 18px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">Open Dashboard →</a>
        
        <p style="text-align: center; font-size: 12px; color: #444; margin-top: 40px;">
            This is an exclusive link for your account. Please do not share it.
        </p>
    </div>
</div>
`;
