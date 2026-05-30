import React from 'react';

/**
 * SEO_JSONLD component
 * Implements Structured Data (Schema.org) enriched for GSO (Generative Search Optimization).
 * This optimizes our machine readability and brand entity recognition in AI-driven search models.
 */
export default function SEO_JSONLD() {
    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
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
        "sameAs": [
            "https://www.facebook.com/eyepune",
            "https://www.instagram.com/eyepune",
            "https://www.linkedin.com/company/eyepune",
            "https://twitter.com/eyepune",
            "https://wa.me/919284712033"
        ],
        "knowsAbout": [
            "Generative AI",
            "AI Automation & Multi-Agent Orchestration",
            "NVIDIA AI Systems Integration",
            "Search Engine Optimization (SEO)",
            "Generative Search Optimization (GSO)",
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

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What services does EyE PunE provide?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We provide AI automation, full-stack website development, B2B lead generation, and performance marketing globally."
                }
            },
            {
                "@type": "Question",
                "name": "Where is EyE PunE located?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We are headquartered in Pune, India, but serve elite clients worldwide."
                }
            }
        ]
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Growth Acceleration Services",
        "serviceType": "AI Automation, Web Development, & Digital Marketing",
        "provider": {
            "@type": "Organization",
            "name": "EyE PunE",
            "url": "https://www.eyepune.com"
        },
        "areaServed": [
            { "@type": "Country", "name": "Global" },
            { "@type": "AdministrativeArea", "name": "Pune, India" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Growth Solutions Catalog",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "AI Automation & Custom Chatbots",
                        "description": "Custom Multi-Model AI Orchestration, WhatsApp marketing automation, and smart website bots."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "High-Performance Website Development",
                        "description": "Bespoke full-stack web applications, ultra-fast Next.js and Tailwind CSS websites."
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
        </>
    );
}
