import React from 'react';

export default function Cookies() {
    return (
        <div className="min-h-screen py-32 px-6 bg-transparent">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Cookie Policy</h1>
                <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                    <p className="text-xl text-gray-400 mb-8">Last updated: May 24, 2026</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. What Are Cookies</h2>
                    <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Cookies</h2>
                    <p>We use cookies for various purposes, including:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                        <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                        <li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display relevant ads.</li>
                    </ul>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Managing Cookies</h2>
                    <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you.</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Changes to This Policy</h2>
                    <p>We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.</p>
                </div>
            </div>
        </div>
    );
}
