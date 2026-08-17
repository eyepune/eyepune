import React from 'react';

/**
 * SEO_JSONLD component
 * Implements Structured Data (Schema.org) enriched for AEO (Answer Engine Optimization) & GSO.
 * This optimizes our machine readability and brand entity recognition in AI-driven search models
 * like ChatGPT, Perplexity, and Google AI Overviews.
 * 
 * NOTE: This component is included in layout.jsx and only contains GLOBAL schemas.
 * Page-specific schemas (FAQ, Product, Article) are injected via SEOHead.jsx on specific views.
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
        "description": "EyE PunE is an elite digital marketing and AI automation agency in Pune, providing cutting-edge growth solutions, multi-model AI systems, and global brand acceleration.",
        "telephone": "+91 92847 12033",
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
            "longitude": 73.7868
        },
        "sameAs": [
            "https://www.facebook.com/eyepune",
            "https://www.instagram.com/eyepune",
            "https://www.linkedin.com/company/eyepune",
            "https://twitter.com/eyepune",
            "https://wa.me/919284712033",
            "https://www.wikidata.org/wiki/Q1"
        ],
        "knowsAbout": [
            "Generative AI",
            "AI Automation & Multi-Agent Orchestration",
            "NVIDIA AI Systems Integration",
            "Search Engine Optimization (SEO)",
            "Generative Search Optimization (GSO)",
            "Answer Engine Optimization (AEO)",
            "Web Development (Next.js, React, Tailwind CSS)",
            "B2B Lead Generation Engines",
            "Performance Marketing",
            "Social Media Management & Strategy"
        ],
        "founder": {
            "@type": "Person",
            "name": "EyE PunE Leadership",
            "jobTitle": "Founder & Principal Growth Officer"
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "EyE PunE",
        "url": "https://www.eyepune.com",
        "description": "Elite AI Automation and Web Development Agency.",
        "publisher": {
            "@id": "https://www.eyepune.com/#organization"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.eyepune.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    );
}
