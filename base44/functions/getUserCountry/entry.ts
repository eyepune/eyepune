import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const clientIp = req.headers.get('cf-connecting-ip') || 
                        req.headers.get('x-forwarded-for')?.split(',')[0] ||
                        req.headers.get('x-real-ip') ||
                        'unknown';

        let country = 'IN';
        let currency = 'INR';

        if (clientIp !== 'unknown') {
            const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
            if (response.ok) {
                const data = await response.json();
                country = data.country_code || 'IN';
                currency = data.currency || 'INR';
            }
        }

        const currencyMap = {
            'USD': { symbol: '$', name: 'US Dollar' },
            'INR': { symbol: '₹', name: 'Indian Rupee' },
            'GBP': { symbol: '£', name: 'British Pound' },
            'EUR': { symbol: '€', name: 'Euro' },
            'AUD': { symbol: 'A$', name: 'Australian Dollar' },
            'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
            'SGD': { symbol: 'S$', name: 'Singapore Dollar' },
            'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
        };

        const conversionRates = {
            'INR': 1,
            'USD': 0.012,
            'GBP': 0.0095,
            'EUR': 0.011,
            'AUD': 0.018,
            'CAD': 0.017,
            'SGD': 0.016,
            'AED': 0.044,
        };

        return Response.json({
            country,
            currency,
            currencySymbol: currencyMap[currency]?.symbol || '₹',
            currencyName: currencyMap[currency]?.name || 'Indian Rupee',
            conversionRate: conversionRates[currency] || 1,
        });
    } catch (error) {
        return Response.json({
            country: 'IN',
            currency: 'INR',
            currencySymbol: '₹',
            currencyName: 'Indian Rupee',
            conversionRate: 1,
        });
    }
});