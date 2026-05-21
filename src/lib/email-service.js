/**
 * Shared Email Service
 * Handles Zoho Mail (Primary) and Resend (Fallback)
 */

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNT_ID = process.env.ZOHO_MAIL_ACCOUNT_ID;
const ZOHO_USERNAME = process.env.ZOHO_MAIL_USERNAME || 'connect@eyepune.com';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || `EyE PunE <${ZOHO_USERNAME}>`;

/**
 * Refreshes the Zoho OAuth access token
 */
async function getZohoAccessToken() {
  if (!ZOHO_REFRESH_TOKEN) {
    throw new Error('ZOHO_REFRESH_TOKEN is missing. Please visit /api/zoho/auth to authorize the application.');
  }
  
  // Try .in first (common for Pune/India), then .com as fallback if needed
  const domains = ['zoho.in', 'zoho.com'];
  let lastError = null;

  for (const domain of domains) {
    try {
      const response = await fetch(`https://accounts.${domain}/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: ZOHO_REFRESH_TOKEN,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      });
      
      const data = await response.json();
      if (data.access_token) return { token: data.access_token, domain };
      if (data.error) lastError = `Zoho (${domain}) Error: ${data.error}`;
    } catch (e) {
      lastError = e.message;
    }
  }
  
  throw new Error(`Zoho Token Refresh Failed: ${lastError}`);
}

/**
 * Sends email via Zoho Mail API
 */
export async function sendViaZoho({ to, subject, html, text, attachments }) {
  if (!ZOHO_ACCOUNT_ID) throw new Error('ZOHO_MAIL_ACCOUNT_ID is missing');
  
  const { token, domain } = await getZohoAccessToken();
  
  let zohoAttachments = [];
  
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        console.log(`[EmailService] Uploading attachment ${attachment.filename} to Zoho...`);
        const buffer = Buffer.from(attachment.content, 'base64');
        const formData = new FormData();
        const blob = new Blob([buffer], { type: attachment.type });
        formData.append('attach', blob, attachment.filename);
        
        const uploadResponse = await fetch(`https://mail.${domain}/api/accounts/${ZOHO_ACCOUNT_ID}/messages/attachments?uploadType=multipart`, {
          method: 'POST',
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`
          },
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(`Zoho Upload Error (${uploadResponse.status}): ${JSON.stringify(uploadResult)}`);
        }
        
        console.log(`[EmailService] Zoho upload success:`, uploadResult);
        
        const attachmentList = Array.isArray(uploadResult.data) ? uploadResult.data : [uploadResult.data];
        for (const item of attachmentList) {
          if (item && item.attachmentPath) {
            zohoAttachments.push({
              attachmentName: item.attachmentName || attachment.filename,
              attachmentPath: item.attachmentPath,
              storeName: item.storeName
            });
          }
        }
      } catch (uploadErr) {
        console.error(`[EmailService] Failed to upload attachment ${attachment.filename} to Zoho:`, uploadErr.message);
      }
    }
  }

  const messagePayload = {
    fromAddress: ZOHO_USERNAME,
    toAddress: Array.isArray(to) ? to.join(',') : to,
    subject,
    content: html || text,
  };

  if (zohoAttachments.length > 0) {
    messagePayload.attachments = zohoAttachments;
  }

  const response = await fetch(`https://mail.${domain}/api/accounts/${ZOHO_ACCOUNT_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messagePayload),
  });
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Zoho API Error (${response.status}): ${JSON.stringify(result)}`);
  }
  return result;
}

/**
 * Sends email via Resend API
 */
export async function sendViaResend({ to, subject, html, text, from, replyTo, attachments }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is missing');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: from || DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html && { html }),
      ...(text && { text }),
      ...(replyTo && { reply_to: replyTo }),
      ...(attachments && { attachments })
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API Error: ${response.status} - ${error}`);
  }
  return await response.json();
}

/**
 * Unified send function that handles provider priority
 */
export async function sendEmail(payload) {
  // If there are attachments, we prioritize Resend as it handles them much easier via base44
  if (payload.attachments && payload.attachments.length > 0 && RESEND_API_KEY) {
    try {
      console.log('[EmailService] Attachments detected, using Resend...');
      return await sendViaResend(payload);
    } catch (err) {
      console.error('[EmailService] Resend with attachments failed:', err.message);
      // If Resend fails, we still want to try Zoho but without attachments
    }
  }

  // 1. Try Zoho first (normal flow)
  if (ZOHO_REFRESH_TOKEN && ZOHO_ACCOUNT_ID) {
    try {
      return await sendViaZoho(payload);
    } catch (err) {
      console.error('[EmailService] Zoho failed:', err.message);
      if (!RESEND_API_KEY) throw err;
      console.log('[EmailService] Falling back to Resend...');
    }
  }

  // 2. Try Resend
  if (RESEND_API_KEY) {
    return await sendViaResend(payload);
  }

  throw new Error('No email service configured');
}
