import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen py-32 px-6 bg-[#040404]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Privacy Policy</h1>
                <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                    <p className="text-xl text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Information We Collect</h2>
                    <p>At EyE PunE, we collect information that you provide directly to us, including when you create an account, request a proposal, or contact us for support. This may include your name, email address, phone number, and company details.</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Provide, maintain, and improve our services.</li>
                        <li>Process transactions and send related information.</li>
                        <li>Send technical notices, updates, and support messages.</li>
                        <li>Communicate with you about products, services, offers, and events.</li>
                    </ul>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to maintain the safety of your personal information. However, please note that no method of transmission over the Internet is 100% secure.</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Sharing of Information</h2>
                    <p>We do not share your personal information with third parties except as described in this privacy policy, such as with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                    
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@eyepune.com.</p>
                </div>
            </div>
        </div>
    );
}
