export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/Admin-Dashboard', '/Admin-CRM', '/Admin-Marketing', '/Admin-Documents'],
    },
    sitemap: 'https://www.eyepune.com/sitemap.xml',
  }
}
