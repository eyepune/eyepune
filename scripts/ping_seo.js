const https = require('https');

const sitemaps = [
    'https://www.eyepune.com/sitemap.xml',
    'https://www.eyepune.com/image-sitemap.xml'
];

const engines = [
    { name: 'Bing', url: 'https://www.bing.com/ping?sitemap=' }
];

console.log('🚀 Pinging search engines with latest sitemaps...\n');

sitemaps.forEach(sitemap => {
    engines.forEach(engine => {
        const pingUrl = `${engine.url}${encodeURIComponent(sitemap)}`;
        
        https.get(pingUrl, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ Successfully pinged ${engine.name} with ${sitemap}`);
            } else {
                console.log(`⚠️ ${engine.name} responded with status code ${res.statusCode} for ${sitemap}`);
            }
        }).on('error', (e) => {
            console.error(`❌ Error pinging ${engine.name}: ${e.message}`);
        });
    });
});

console.log('✅ Ping script executed. (Note: Google deprecated their open ping endpoint in Jan 2024, so Google requires you to submit via Google Search Console).');
