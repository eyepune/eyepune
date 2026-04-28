export function createPageUrl(pageName: string) {
    if (pageName === 'Home') return '/';
    // Standardize underscores and spaces to hyphens for SEO-friendly URLs
    // This matches the updated keys in pages.config.js
    return '/' + pageName.replace(/[ _]/g, '-');
}