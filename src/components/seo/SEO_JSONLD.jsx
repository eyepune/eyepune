import React from 'react';

/**
 * SEO_JSONLD component
 * Implements Structured Data (Schema.org) enriched for AEO (Answer Engine Optimization) & GSO.
 * This optimizes our machine readability and brand entity recognition in AI-driven search models
 * like ChatGPT, Perplexity, and Google AI Overviews.
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

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What services does EyE PunE provide?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "EyE PunE provides comprehensive digital growth services including Custom AI Chatbots, Multi-Agent Orchestration, Full-Stack Next.js Website Development, B2B Lead Generation (LinkedIn & cold email outreach), and Performance Marketing globally."
                }
            },
            {
                "@type": "Question",
                "name": "Where is EyE PunE located and who do they serve?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "EyE PunE is headquartered in Pune, India, but operates globally, serving elite clients, startups, and founders across the United States, United Kingdom, Canada, Australia, and the Middle East."
                }
            },
            {
                "@type": "Question",
                "name": "How much does it cost to build a custom AI lead generation chatbot?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The cost of building a custom AI lead generation chatbot varies based on complexity and integration needs. At EyE PunE, our comprehensive Growth Engine packages start at $999, providing a fully automated, multi-model AI orchestration system tailored to scaling B2B businesses."
                }
            },
            {
                "@type": "Question",
                "name": "How does EyE PunE generate B2B leads autonomously?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We build automated B2B growth engines that utilize AI to scrape, enrich, and outreach to ideal client profiles on LinkedIn and via email. This creates a 24/7 autonomous sales pipeline for founders and agencies without requiring manual intervention."
                }
            }
        ]
    };

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "EyE PunE Growth Engine",
        "image": "https://www.eyepune.com/logo.png",
        "description": "The ultimate B2B AI Automation and Lead Generation system for scaling enterprises.",
        "brand": {
            "@type": "Brand",
            "name": "EyE PunE"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://www.eyepune.com/Pricing",
            "priceCurrency": "USD",
            "price": "999",
            "availability": "https://schema.org/InStock"
        }
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Growth Acceleration Services",
        "serviceType": "AI Automation, Web Development, & Digital Marketing",
        "provider": {
            "@type": "Organization",
            "@id": "https://www.eyepune.com/#organization",
            "name": "EyE PunE",
            "url": "https://www.eyepune.com"
        },
        "areaServed": [
            { "@type": "Country", "name": "Global" },
            { "@type": "Country", "name": "United States" },
            { "@type": "Country", "name": "United Kingdom" },
            { "@type": "Country", "name": "Canada" },
            { "@type": "Country", "name": "Australia" },
            { "@type": "Region", "name": "Middle East" },
            { "@type": "Region", "name": "Western Europe" },
            { "@type": "Region", "name": "Latin America" },
            { "@type": "Region", "name": "Asia" },
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
                        "description": "Custom Multi-Model AI Orchestration, WhatsApp marketing automation, and smart website bots designed to eliminate operational bottlenecks and scale operations globally."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "High-Performance Website Development",
                        "description": "Bespoke full-stack web applications, ultra-fast Next.js, React, and Tailwind CSS websites optimized for conversion, security, and Generative Search Optimization (GSO)."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "24/7 B2B Lead Generation Engines",
                        "description": "Automated B2B growth engines that utilize AI to scrape, enrich, and outreach to ideal client profiles on LinkedIn and via cold email, creating continuous sales pipelines."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Performance Marketing & Paid Ads",
                        "description": "Maximized ROI through data-driven ad campaigns on Google, Meta, and LinkedIn. Strategic budget allocation to ensure your business reaches its high-intent target audience."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Social Media Marketing & Management",
                        "description": "Build an elite social presence with AI-powered content strategy, high-impact community management, and algorithmic distribution (Viral Slicer) for YouTube, Instagram, and TikTok."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Elite Brand Strategy & Design",
                        "description": "Create a powerful brand identity that resonates globally. From visual UI/UX design to strategic market positioning, we build premium brands that stand out in crowded markets."
                    }
                },
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Conversion-Optimized Sales Funnels",
                        "description": "Turn traffic into revenue with high-converting sales funnels and automated lead nurturing systems using Supabase, CRM integrations, and seamless user journeys."
                    }
                }
            ]
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.eyepune.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": "https://www.eyepune.com/Services"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Global Locations",
                "item": "https://www.eyepune.com/Locations"
            }
        ]
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
