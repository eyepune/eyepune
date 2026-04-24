import { NextResponse } from 'next/server';

export async function GET() {
  const isZohoConfigured = !!(process.env.ZOHO_REFRESH_TOKEN && process.env.ZOHO_MAIL_ACCOUNT_ID);
  
  return NextResponse.json({
    zoho: {
      configured: isZohoConfigured,
      username: process.env.ZOHO_MAIL_USERNAME || 'connect@eyepune.com'
    },
    env: process.env.NODE_ENV
  });
}
