import React from 'react';
import { useEffect } from 'react';

export default function SEOHead({ 
    title = "EyE PunE - Connect Engage Grow | Digital Marketing & Web Solutions",
    description = "Transform your business with EyE PunE's comprehensive digital solutions. Expert social media marketing, web app development, AI automation, and branding services in Pune, India.",
    keywords = "digital marketing pune, web development pune, social media marketing, AI automation, branding services, business growth, lead generation, sales automation, CRM solutions, SEO services",
    ogImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    canonicalUrl,
    structuredData,
    author = "EyE PunE"
}) {
    useEffect(() => {
        // Update document title
        document.title = title;

        // Helper to update or create meta tag
        const setMetaTag = (name, content, isProperty = false) => {
            if (!content) return;
            const attribute = isProperty ? 'property' : 'name';
            let tag = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attribute, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        // Basic meta tags
        setMetaTag('description', description);
        setMetaTag('keywords', keywords);
        setMetaTag('author', author);
        setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        
        // Open Graph tags
        setMetaTag('og:title', title, true);
        setMetaTag('og:description', description, true);
        setMetaTag('og:image', ogImage, true);
        setMetaTag('og:type', 'website', true);
        setMetaTag('og:site_name', 'EyE PunE', true);
        setMetaTag('og:locale', 'en_IN', true);
        
        if (canonicalUrl) {
            setMetaTag('og:url', canonicalUrl, true);
        }

        // Twitter Card tags
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', ogImage);
        setMetaTag('twitter:site', '@eyepune');
        setMetaTag('twitter:creator', '@eyepune');

        // Canonical URL
        if (canonicalUrl) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonicalUrl);
        }

        // Structured Data (JSON-LD) — inject as new script each time for multi-schema support
        if (structuredData) {
            // Remove old page-level schema if any
            const old = document.querySelector('script[data-page-schema="true"]');
            if (old) old.remove();
            const script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.setAttribute('data-page-schema', 'true');
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }
    }, [title, description, keywords, ogImage, canonicalUrl, structuredData, author]);

    return null;
}

// Helper function to generate organization structured data
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "LocalBusiness"],
        "name": "EyE PunE",
        "alternateName": ["EyePune", "EyEPunE", "Eye Pune"],
        "url": "https://eyepune.com",
        "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png",
        "description": "Transform your business with comprehensive digital solutions including social media marketing, web development, AI automation, and branding services.",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9284712033",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
        },
        "sameAs": [
            "https://instagram.com/eyepune",
            "https://linkedin.com/company/eyepune"
        ]
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
        "areaServed": "IN",
        "offers": price ? {
            "@type": "Offer",
            "price": price,
            "priceCurrency": "INR"
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