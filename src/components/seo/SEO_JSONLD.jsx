import React from 'react';

/**
 * SEO_JSONLD component
 * Implements Structured Data (Schema.org) enriched for GSO (Generative Search Optimization).
 * This optimizes our machine readability and brand entity recognition in AI-driven search models.
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
        "priceRange": "$$$",
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
        "knowsAbout": [
            "Generative AI",
            "AI Automation & Multi-Agent Orchestration",
            "NVIDIA AI Systems Integration",
            "Search Engine Optimization (SEO)",
            "Generative Search Optimization (GSO)",
            "Web Development (Next.js, React, Tailwind CSS)",
            "B2B Lead Generation Engines",
            "YouTube Growth Systems & Viral Distribution",
            "Performance Marketing (Google Ads & Meta Ads)",
            "Social Media Management & Strategy",
            "Sales Funnels & Conversion Rate Optimization (CRO)",
            "Elite Brand Strategy & Design"
        ],
        "founder": {
            "@type": "Person",
            "name": "EyE PunE Leadership",
            "jobTitle": "Founder & Principal Growth Officer"
        },
        "areaServed": [
            {
                "@type": "Country",
                "name": "Global"
            },
            {
                "@type": "AdministrativeArea",
                "name": "Pune, Maharashtra, India"
            }
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
        "name": "Growth Acceleration Services",
        "serviceType": "AI Automation, Web Development, & Digital Marketing",
        "provider": {
            "@type": "ProfessionalService",
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
                        "description": "Custom Multi-Model AI Orchestration, WhatsApp marketing automation, and smart website bots that qualify leads, answer FAQs, and schedule consults 24/7."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "High-Performance Website Development",
                        "description": "Bespoke full-stack web applications, ultra-fast Next.js and Tailwind CSS websites, and robust technical architectures optimized for modern UX and business growth."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "B2B Lead Generation & Outreach Engine",
                        "description": "24/7 automated cold outreach setups on LinkedIn and Email, list building, and intelligent lead qualifying and nurturing pipelines designed for Founders and Agencies."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Performance Marketing (Google & Meta Ads)",
                        "description": "Data-driven advertising campaigns on Google, Meta, and LinkedIn focused on maximizing ROI, advanced custom audiences, and high-converting retargeting funnels."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Social Media Management & Content Distribution",
                        "description": "Premium brand presence strategy, custom high-impact visual assets, engaging copy creation, and automated content distribution engines."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Sales Funnels & Landing Page Optimization",
                        "description": "High-converting landing pages and sequential sales funnels designed to turn raw traffic into revenue with seamless user journeys."
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
