'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function LeadMagnetForm({ keyword }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.name) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'SEO Blueprint Lead',
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.name, // Storing their actual name here since we use the primary 'name' to flag the lead type
                    service_interest: keyword,
                    message: `Requested the 2026 ${keyword} Growth Blueprint. Name: ${formData.name}, Phone: ${formData.phone}`,
                    hp_verification: ''
                })
            });

            if (!response.ok) throw new Error('Failed to submit lead');
            
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit lead", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 mt-2">
                <h4 className="text-white font-bold text-lg mb-1">Success! 🎉</h4>
                <p className="text-red-300 text-sm">Your blueprint is being prepared and will be sent to <strong>{formData.email}</strong> shortly.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your Full Name" 
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    required
                />
                <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Phone Number (Optional)" 
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your best email..." 
                    className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    required
                />
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-6 font-bold shadow-lg shadow-red-500/20 whitespace-nowrap disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send My Blueprint'}
                </Button>
            </div>
        </form>
    );
}
