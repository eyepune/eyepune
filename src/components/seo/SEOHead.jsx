import React from 'react';

export default function SEOHead({ 
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    structuredData,
    author
}) {
    // We now rely on Next.js 13+ native generateMetadata in page.jsx for title/meta tags.
    // This component only injects page-specific structured data (JSON-LD) for AEO/GEO.
    
    if (!structuredData) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

// Helper function to generate organization structured data
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "LocalBusiness"],
        "name": "EyE PunE",
        "alternateName": ["EyePune", "EyEPunE", "Eye Pune"],
        "url": "https://www.eyepune.com",
        "logo": "https://www.eyepune.com/icon",
        "image": "https://www.eyepune.com/opengraph-image",
        "description": "Global AI Growth Engine and Elite Digital Agency. We empower Founders, Creators, and Startups with NVIDIA-accelerated AI automation, custom web development, and performance-driven marketing systems.",
        "priceRange": "$$$",
        "telephone": "+91-9284712033",
        "knowsAbout": [
            "AI Automation", 
            "NVIDIA AI Systems", 
            "B2B Lead Generation", 
            "YouTube Growth Systems", 
            "Next.js Development", 
            "Founder Growth Strategy",
            "Digital Marketing ROI"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9284712033",
            "contactType": "global growth consulting",
            "areaServed": "Global",
            "availableLanguage": ["English", "Hindi"]
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Baner",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "postalCode": "411045",
            "addressCountry": "IN"
        },
        "sameAs": [
            "https://instagram.com/eyepune",
            "https://linkedin.com/company/eyepune",
            "https://twitter.com/eyepune",
            "https://facebook.com/eyepune"
        ],
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.eyepune.com/Blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
}

// Helper function to generate breadcrumb structured data
export function generateBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://www.eyepune.com${item.path}`
        }))
    };
}

// Helper function to generate service structured data
export function generateServiceSchema(serviceName, description, price) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceName,
        "description": description,
        "provider": {
            "@type": "Organization",
            "name": "EyE PunE"
        },
        "areaServed": "Global",
        "offers": price ? {
            "@type": "Offer",
            "price": price,
            "priceCurrency": "USD"
        } : undefined
    };
}

// Helper function to generate FAQ structured data
export function generateFAQSchema(faqs) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}