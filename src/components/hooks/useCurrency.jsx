import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useCurrency() {
    const [currency, setCurrency] = useState({
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        conversionRate: 1,
        country: 'IN',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const response = await base44.functions.invoke('getUserCountry');
                setCurrency({
                    code: response.data.currency,
                    symbol: response.data.currencySymbol,
                    name: response.data.currencyName,
                    conversionRate: response.data.conversionRate,
                    country: response.data.country,
                });
            } catch (error) {
                console.error('Failed to fetch currency:', error);
                // Default to INR if fetch fails
                setCurrency({
                    code: 'INR',
                    symbol: '₹',
                    name: 'Indian Rupee',
                    conversionRate: 1,
                    country: 'IN',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrency();
    }, []);

    const formatPrice = (priceInINR) => {
        const convertedPrice = priceInINR * currency.conversionRate;
        return `${currency.symbol}${convertedPrice.toLocaleString('en-US', {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        })}`;
    };

    return {
        ...currency,
        isLoading,
        formatPrice,
    };
}