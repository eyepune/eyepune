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

    // --- NEW: ADVANCED SEO & TECH STACK EXTRACTION ---
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
    
    const h1Count = h1Match ? h1Match.length : 0;
    const h2Count = h2Match ? h2Match.length : 0;
    const wordCount = bodyText.split(/\s+/).length;

    // Image Alt Analysis
    const imgMatch = html.match(/<img[^>]+>/gi) || [];
    let imagesWithAlt = 0;
    imgMatch.forEach(img => {
      if (img.match(/alt=["']([^"']+)["']/i)) imagesWithAlt++;
    });
    const altRatio = imgMatch.length > 0 ? Math.round((imagesWithAlt / imgMatch.length) * 100) : 100;

    // Tech Stack Detection
    let techStack = [];
    if (html.match(/wp-content|wp-includes/i)) techStack.push('WordPress');
    if (html.match(/cdn\.shopify\.com/i)) techStack.push('Shopify');
    if (html.match(/_next\/static/i) || html.match(/next\/router/i)) techStack.push('Next.js');
    if (html.match(/data-reactroot|react-dom/i) && !techStack.includes('Next.js')) techStack.push('React');
    if (html.match(/wix\.com/i)) techStack.push('Wix');
    if (techStack.length === 0) techStack.push('Custom Built');

    // Calculate a raw On-Page SEO Score (0-100)
    let rawSeoScore = 50;
    if (title && title.length > 10 && title.length < 70) rawSeoScore += 15;
    if (description && description.length > 50 && description.length < 160) rawSeoScore += 15;
    if (h1Count === 1) rawSeoScore += 10;
    if (altRatio > 80) rawSeoScore += 10;
    if (rawSeoScore > 100) rawSeoScore = 100;

    const seoMetrics = {
      h1Count,
      h2Count,
      wordCount,
      totalImages: imgMatch.length,
      altRatio,
      techStack: techStack.join(', '),
      rawSeoScore
    };

    return NextResponse.json({
      success: true,
      url: validUrl,
      data: {
        title,
        description,
        content: bodyText,
        seo: seoMetrics
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
