export default function sitemap() {
  const baseUrl = 'https://eyepune.com';
  
  const routes = [
    '',
    '/About',
    '/Services',
    '/Portfolio',
    '/Blog',
    '/Contact',
    '/Pricing',
    '/Testimonials',
    '/Booking',
    '/AI_Assessment',
    '/Service_WebDev',
    '/Service_SocialMedia',
    '/Service_AI',
    '/Service_PaidAds',
    '/Service_Branding',
    '/Service_Funnels',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
