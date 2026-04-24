import { NextResponse } from 'next/server';

export async function GET(request) {
  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
  const origin = request.nextUrl.origin.replace('http://', 'https://');
  const redirectUri = `${origin}/api/zoho/callback`;
  
  // Scope for sending mail and reading account info
  const scope = 'ZohoMail.messages.CREATE,ZohoMail.accounts.READ';
  
  // Try .in by default, can be changed to .com
  const authUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=${scope}&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${redirectUri}&prompt=consent`;
  
  return NextResponse.redirect(authUrl);
}
