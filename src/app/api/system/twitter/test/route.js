import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    try {
        let dbTwitter = null;
        const { data } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'twitter_config')
            .single();
        if (data && data.value) {
            dbTwitter = data.value;
        }

        const API_KEY = dbTwitter?.apiKey || process.env.TWITTER_API_KEY;
        const API_SECRET = dbTwitter?.apiSecret || process.env.TWITTER_API_SECRET;
        const ACCESS_TOKEN = dbTwitter?.accessToken || process.env.TWITTER_ACCESS_TOKEN;
        const ACCESS_SECRET = dbTwitter?.accessSecret || process.env.TWITTER_ACCESS_SECRET;
        
        if (!API_KEY || !ACCESS_TOKEN) {
            return NextResponse.json({ success: false, error: 'Missing Twitter API credentials.' }, { status: 400 });
        }

        // Dynamically import the twitter client
        const { TwitterApi } = await import('twitter-api-v2');
        
        const client = new TwitterApi({
            appKey: API_KEY,
            appSecret: API_SECRET,
            accessToken: ACCESS_TOKEN,
            accessSecret: ACCESS_SECRET,
        });

        const rwClient = client.readWrite;
        
        const testTweet = `System Diagnostic: Test tweet from EyE PunE automated testing suite. Timestamp: ${new Date().toISOString()}`;
        
        // Post a single test tweet
        await rwClient.v2.tweet(testTweet);
        
        return NextResponse.json({ success: true, message: 'Test tweet sent successfully.' });
    } catch (error) {
        console.error('[Twitter Test API Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
