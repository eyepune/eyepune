import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Validate URL
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    
    new URL(validUrl); // throws if invalid

    // Fetch the URL
    const response = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EyEPunEBot/1.0; +https://eyepune.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Very basic extraction to avoid heavy dependencies like cheerio if possible
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract body text (strip script/style tags first)
    let bodyText = html;
    
    // Remove scripts and styles
    bodyText = bodyText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    bodyText = bodyText.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');
    bodyText = bodyText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');
    bodyText = bodyText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ');
    
    // Extract everything inside body tag if possible
    const bodyMatch = bodyText.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      bodyText = bodyMatch[1];
    }
    
    // Strip HTML tags
    bodyText = bodyText.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities (basic)
    bodyText = bodyText.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
    // Clean up whitespace
    bodyText = bodyText.replace(/\s+/g, ' ').trim();
    
    // Limit to prevent enormous tokens (approx 2000 words max)
    const MAX_LENGTH = 10000; 
    if (bodyText.length > MAX_LENGTH) {
      bodyText = bodyText.substring(0, MAX_LENGTH) + '...';
    }

    return NextResponse.json({
      success: true,
      url: validUrl,
      data: {
        title,
        description,
        content: bodyText
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to analyze website' 
    }, { status: 500 });
  }
}
