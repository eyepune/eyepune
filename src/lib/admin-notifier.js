import { sendWhatsAppText } from './whatsapp-service';
import { sendEmail } from './email-service';

/**
 * Admin Notifier Service
 * Centralized utility for alerting the EyE PunE team about critical business events.
 */

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '919284712033';
const ADMIN_EMAIL = 'team@eyepune.com';

export async function notifyAdmin(message) {
    const promises = [];
    
    if (ADMIN_NUMBER) {
        promises.push(sendWhatsAppText({
            to: ADMIN_NUMBER,
            text: message
        }).catch(e => console.warn('Failed to send admin WhatsApp:', e)));
    }
    
    // Extract a subject line from the first line of the message
    const subject = message.split('\n')[0].replace(/[*🚀📊📩📅]/g, '').trim() || 'New EyE PunE Notification';
    
    promises.push(sendEmail({
        to: ADMIN_EMAIL,
        subject: subject,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                 <h2 style="color: #ef4444;">EyE PunE Admin Alert</h2>
                 <pre style="background: #f4f4f4; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: inherit;">${message}</pre>
               </div>`
    }));

    await Promise.all(promises);
    return { success: true };
}

export async function notifyNewLead({ name, email, phone, company, source }) {
    const message = `🚀 *NEW LEAD CAPTURED* 🚀\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || 'Not provided'}\n*Company:* ${company || 'Not provided'}\n*Source:* ${source}\n\n*Action:* Open CRM to follow up!\nhttps://eyepune.com/Admin-CRM`;
    
    return await notifyAdmin(message);
}

export async function notifyNewAssessment({ name, business, score, challenge }) {
    const message = `📊 *NEW AI ASSESSMENT* 📊\n\n*User:* ${name}\n*Business:* ${business || 'Not provided'}\n*Growth Score:* ${score}/100\n*Challenge:* "${challenge}"\n\n*Action:* Review their roadmap and reach out!\nhttps://eyepune.com/Admin-Dashboard`;
    
    return await notifyAdmin(message);
}

export async function notifyNewInquiry({ name, email, service, message: userMessage }) {
    const message = `📩 *NEW INQUIRY* 📩\n\n*Name:* ${name}\n*Email:* ${email}\n*Service:* ${service}\n*Message:* "${userMessage}"\n\n*Action:* Respond via Admin Panel!\nhttps://eyepune.com/Admin-Marketing`;
    
    return await notifyAdmin(message);
}

export async function notifyNewBooking({ name, email, date, time, notes }) {
    const message = `📅 *NEW BOOKING* 📅\n\n*Client:* ${name}\n*Date:* ${date}\n*Time:* ${time}\n*Email:* ${email}\n*Notes:* "${notes || 'No notes provided'}"\n\n*Action:* Block your calendar and prepare!\nhttps://eyepune.com/Admin-Dashboard`;
    
    return await notifyAdmin(message);
}

