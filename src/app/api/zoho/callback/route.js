/**
 * Next.js API Route: /api/zoho/callback
 *
 * Handles the Zoho OAuth callback — exchanges the authorization code
 * for a refresh token and displays it so you can add it to .env.
 * This route is only needed during initial setup.
 */

import { NextResponse } from 'next/server';

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new Response(`<h1>Authorization Error</h1><p>${error}</p>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!code) {
    return new Response('<h1>Error</h1><p>No authorization code received.</p>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        redirect_uri: 'https://eyepune.com/api/zoho/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(
        `<h1>Token Error</h1><p>${tokenData.error}</p><p>${tokenData.error_description || ''}</p><pre>${JSON.stringify(tokenData, null, 2)}</pre>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;

    // If we got an access token, try to fetch the account ID
    let accountId = 'NOT_FOUND';
    if (accessToken) {
      try {
        const accountsResponse = await fetch('https://mail.zoho.in/api/accounts', {
          headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` },
        });
        const accountsData = await accountsResponse.json();
        if (accountsData.data && accountsData.data.length > 0) {
          accountId = accountsData.data[0].accountId;
        }
      } catch (e) {
        // Non-critical — we'll show what we have
      }
    }

    // Display the results as a nice HTML page
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Zoho OAuth Setup Complete</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0a0a0a; color: #e5e5e5; }
    h1 { color: #22c55e; }
    .value { background: #1a1a2e; border: 1px solid #333; padding: 12px 16px; border-radius: 8px; font-family: monospace; word-break: break-all; margin: 8px 0 20px; cursor: pointer; }
    .value:hover { border-color: #22c55e; }
    .label { color: #94a3b8; font-size: 14px; margin-top: 16px; }
    .instructions { background: #1e293b; padding: 16px; border-radius: 8px; margin-top: 24px; }
    .instructions code { background: #334155; padding: 2px 6px; border-radius: 4px; }
    .copy-btn { background: #22c55e; color: #000; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 8px; }
    .copy-btn:hover { background: #16a34a; }
  </style>
</head>
<body>
  <h1>✅ Zoho OAuth Setup Complete!</h1>
  
  <p class="label">Refresh Token <button class="copy-btn" onclick="copyText('refresh-token')">Copy</button></p>
  <div class="value" id="refresh-token">${refreshToken || 'NOT_RECEIVED'}</div>
  
  <p class="label">Account ID <button class="copy-btn" onclick="copyText('account-id')">Copy</button></p>
  <div class="value" id="account-id">${accountId}</div>
  
  <div class="instructions">
    <h3>📋 Next Steps</h3>
    <p>Add these values to your <code>.env</code> file:</p>
    <pre style="background:#0f172a; padding:12px; border-radius:6px; overflow-x:auto;">
ZOHO_REFRESH_TOKEN=${refreshToken || 'PASTE_HERE'}
ZOHO_MAIL_ACCOUNT_ID=${accountId}</pre>
    <p>Then restart the dev server.</p>
  </div>
  
  <script>
    function copyText(id) {
      const text = document.getElementById(id).textContent;
      navigator.clipboard.writeText(text);
      const btn = event.target;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    return new Response(
      `<h1>Error</h1><p>${err.message}</p>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
