export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/Admin-Dashboard', '/Admin-CRM', '/Admin-Marketing', '/Admin-Documents', '/api/', '/_next/'],
      },
      {
        // Explicitly allow and guide AI Answer Engines (AEO/GEO)
        userAgent: ['ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'Claude-Web', 'anthropic-ai', 'cohere-ai'],
        allow: ['/Blog', '/Services', '/Solutions', '/About', '/Pricing'],
        disallow: ['/Admin-Dashboard', '/Admin-CRM', '/api/', '/_next/'],
      }
    ],
    sitemap: 'https://www.eyepune.com/sitemap.xml',
  }
}

