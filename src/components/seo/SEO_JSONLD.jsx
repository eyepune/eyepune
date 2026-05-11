import React from 'react';

/**
 * SEO_JSONLD component
 * Implements Structured Data (Schema.org) for better visibility on Google/Bing.
 * This includes LocalBusiness, ProfessionalService, and SearchAction schemas.
 */
export default function SEO_JSONLD() {
    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "EyE PunE",
        "alternateName": ["EyePune", "EyEPunE", "Eye Pune"],
        "url": "https://www.eyepune.com",
        "logo": "https://www.eyepune.com/logo.png",
        "image": "https://www.eyepune.com/opengraph-image.png",
        "description": "EyE PunE is an elite digital marketing and AI automation agency in Pune, providing cutting-edge growth solutions for global brands.",
        "telephone": "+91 92847 12033",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Baner",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "postalCode": "411045",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 18.5590,
            "longitude": 73.7799
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            "opens": "09:00",
            "closes": "20:00"
        },
        "sameAs": [
            "https://www.facebook.com/eyepune",
            "https://www.instagram.com/eyepune",
            "https://www.linkedin.com/company/eyepune",
            "https://twitter.com/eyepune",
            "https://wa.me/919284712033"
        ],
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.eyepune.com/Blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "AI Digital Marketing & Automation",
        "provider": {
            "@type": "LocalBusiness",
            "name": "EyE PunE"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Global"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Digital Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "AI Automation & Chatbots"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Performance Web Development"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "B2B Lead Generation"
                    }
                }
            ]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
        </>
    );
}

