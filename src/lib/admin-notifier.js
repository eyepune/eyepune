import { sendWhatsAppText } from './whatsapp-service';

/**
 * Admin Notifier Service
 * Centralized utility for alerting the EyE PunE team about critical business events.
 */

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '919511210191';

export async function notifyAdmin(message) {
    if (!ADMIN_NUMBER) return { success: false, error: 'Admin number not configured' };
    
    return await sendWhatsAppText({
        to: ADMIN_NUMBER,
        text: message
    });
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

