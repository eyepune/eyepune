import React from 'react';
import LexProClientLayout from './LexProClientLayout';

export const metadata = {
    title: 'Lex Pro | The Autonomous Legal OS for India',
    description: 'Generate India-compliant legal contracts instantly with AI. Lex Pro is the elite legal drafting and analysis platform for founders and businesses.',
    openGraph: {
        title: 'Lex Pro | The Autonomous Legal OS for India',
        description: 'Generate India-compliant legal contracts instantly with AI. Lex Pro is the elite legal drafting and analysis platform for founders and businesses.',
        url: 'https://www.eyepune.com/lex-pro',
        siteName: 'Lex Pro by EyE PunE',
        images: [
            {
                url: 'https://www.eyepune.com/og-image.jpg', // Using global default
                width: 1200,
                height: 630,
                alt: 'Lex Pro by EyE PunE',
            }
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lex Pro | Autonomous Legal OS',
        description: 'Generate India-compliant legal contracts instantly with AI.',
    },
};

export default function LexProLayout({ children }) {
    // Generate specialized JSON-LD for Lex Pro
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Lex Pro',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web browser',
        description: 'Autonomous AI-powered legal document drafting and risk analysis platform specifically designed for the Indian legal framework.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
        },
        provider: {
            '@type': 'Organization',
            name: 'EyE PunE',
            url: 'https://www.eyepune.com'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <LexProClientLayout>
                {children}
            </LexProClientLayout>
        </>
    );
}
