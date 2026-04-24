import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const contentRef = React.useRef(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', service_interest: '', message: '' });

    React.useEffect(() => {
        if (contentRef.current && isSuccess) contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [isSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Honeypot spam protection (Renamed from website_url to avoid auto-fill)
        if (formData.verification_token) {
            console.warn('Bot detected by honeypot');
            setIsSuccess(true); 
            return;
        }

        console.log('Sending submission for:', formData.name);

        setIsSubmitting(true);
        try {
            // 1. Save inquiry to Supabase
            const { error: dbError } = await supabase.from('inquiries').insert([{
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                service_interest: formData.service_interest,
                message: formData.message,
                status: 'new'
            }]);
            if (dbError) throw dbError;

            // 2. Trigger automation (sends welcome email to lead)
            // Non-blocking — failure does not interrupt the user flow
            fetch('/api/automation/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trigger: 'new_inquiry',
                    payload: {
                        name: formData.name,
                        email: formData.email,
                        company: formData.company || 'their business',
                        service: formData.service_interest || 'General Inquiry'
                    }
                })
            }).catch(err => console.warn('[Contact] Automation trigger failed:', err));

            // 3. Send admin notification email
            fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'connect@eyepune.com',
                    subject: `🔔 New Inquiry: ${formData.name} — ${formData.service_interest || 'General'}`,
                    html: `
                        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #ef4444; margin-top: 0;">🔔 New Website Inquiry</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${formData.name}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #111827;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; color: #111827;">${formData.phone || '—'}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Company</td><td style="padding: 8px 0; color: #111827;">${formData.company || '—'}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Service</td><td style="padding: 8px 0; color: #111827;">${formData.service_interest || 'General'}</td></tr>
                            </table>
                            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 16px 0;">
                                <p style="margin: 0; color: #374151;">${formData.message}</p>
                            </div>
                            <a href="https://eyepune.com/Admin_CRM" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Open CRM Dashboard →</a>
                        </div>
                    `
                })
            }).catch(err => console.warn('[Contact] Admin notification failed:', err));

            setIsSuccess(true);
        } catch (error) {
            console.error('Contact form submission failed:', error);
            alert(`Error: ${error.message || 'The server did not respond. Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden pt-20">

            {/* ── HERO ── */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }}
                />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-2xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-red-400 text-sm font-medium">Get in Touch</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-5 leading-[0.95]">
                                Let's Grow<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Together</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Ready to scale? Tell us about your goals and we'll respond within 24 hours with a clear action plan.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── FORM + INFO ── */}
            <section className="pb-24 border-t border-white/[0.06]" ref={contentRef}>
                <div className="max-w-7xl mx-auto px-6 pt-16">
                    <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12">

                        {/* Form */}
                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            {isSuccess ? (
                                <div className="p-14 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                                        className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
                                    >
                                        <CheckCircle className="w-12 h-12 text-green-400" />
                                    </motion.div>
                                    <h3 className="text-3xl font-black text-white mb-3">Message Sent!</h3>
                                    <p className="text-gray-400 text-lg">Our team will reach out within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6 hover:border-red-500/10 transition-all">
                                    {/* Honeypot field (hidden from users) */}
                                    <div className="sr-only opacity-0 absolute -z-10 pointer-events-none">
                                        <input
                                            type="text"
                                            name="verification_token"
                                            value={formData.verification_token || ''}
                                            onChange={handleChange}
                                            tabIndex="-1"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-500 mb-2 block text-sm">Full Name *</Label>
                                            <Input name="name" value={formData.name} onChange={handleChange} required
                                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-700 focus:border-red-500/50 rounded-xl h-12"
                                                placeholder="Your name" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 mb-2 block text-sm">Email *</Label>
                                            <Input name="email" type="email" value={formData.email} onChange={handleChange} required
                                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-700 focus:border-red-500/50 rounded-xl h-12"
                                                placeholder="your@email.com" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-500 mb-2 block text-sm">Phone</Label>
                                            <Input name="phone" value={formData.phone} onChange={handleChange}
                                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-700 focus:border-red-500/50 rounded-xl h-12"
                                                placeholder="+91 98765 43210" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 mb-2 block text-sm">Company</Label>
                                            <Input name="company" value={formData.company} onChange={handleChange}
                                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-700 focus:border-red-500/50 rounded-xl h-12"
                                                placeholder="Your company" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500 mb-2 block text-sm">What are you looking for?</Label>
                                        <Select value={formData.service_interest} onValueChange={(v) => setFormData({ ...formData, service_interest: v })}>
                                            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white h-12 rounded-xl">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="social_media">Social Media Marketing</SelectItem>
                                                <SelectItem value="web_app">Website / App Development</SelectItem>
                                                <SelectItem value="ai_automation">AI Automations</SelectItem>
                                                <SelectItem value="branding">Branding & Content</SelectItem>
                                                <SelectItem value="growth_bundle">Full Growth Bundle</SelectItem>
                                                <SelectItem value="custom">Custom Solution</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500 mb-2 block text-sm">Tell us about your project *</Label>
                                        <Textarea name="message" value={formData.message} onChange={handleChange} required
                                            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-700 focus:border-red-500/50 min-h-[140px] rounded-xl"
                                            placeholder="What are your goals and challenges?" />
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}
                                        className="w-full py-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-base font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all">
                                        {isSubmitting ? 'Sending...' : <><Send className="w-4 h-4 mr-2 inline" />Send Message</>}
                                    </Button>
                                </form>
                            )}
                        </motion.div>

                        {/* Info sidebar */}
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-5">
                            {/* Quick contact */}
                            <div className="p-7 rounded-2xl bg-gradient-to-br from-red-950/30 to-[#080808] border border-red-500/10">
                                <h3 className="text-lg font-bold text-white mb-6">Quick Contact</h3>
                                <div className="space-y-5">
                                    {[
                                        { icon: Mail, label: 'Email', value: 'connect@eyepune.com', href: 'mailto:connect@eyepune.com' },
                                        
                                        { icon: Phone, label: 'Sales Team', value: '+91 92847 12033', href: 'tel:+919284712033' },
                                        { icon: Phone, label: 'WhatsApp (Avinash)', value: '+91 77188 99466', href: 'https://wa.me/917718899466' },
                                        { icon: MapPin, label: 'Location', value: 'Pune, Maharashtra, India', href: null },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            {item.href ? (
                                                <a href={item.href} className="flex items-center gap-4 group">
                                                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-colors flex-shrink-0">
                                                        <item.icon className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 uppercase tracking-wider">{item.label}</p>
                                                        <p className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">{item.value}</p>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                                        <item.icon className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 uppercase tracking-wider">{item.label}</p>
                                                        <p className="text-white text-sm font-medium">{item.value}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social */}
                            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                <h3 className="text-lg font-bold text-white mb-5">Follow Us</h3>
                                <div className="flex gap-3">
                                    {[
                                        { label: 'Instagram', tag: 'IG', href: 'https://instagram.com/eyepune' },
                                        { label: 'LinkedIn', tag: 'LI', href: 'https://linkedin.com/company/eyepune' },
                                        { label: 'WhatsApp', tag: 'WA', href: 'https://wa.me/917718899466' },
                                    ].map((s, i) => (
                                        <motion.a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                            whileHover={{ y: -3 }}
                                            className="flex flex-col items-center gap-1.5 flex-1 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.05] transition-all"
                                        >
                                            <span className="font-black text-gray-400 hover:text-red-400 text-xs">{s.tag}</span>
                                            <span className="text-gray-600 text-xs">{s.label}</span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Response time */}
                            <div className="p-7 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium opacity-90">We're Online</span>
                                </div>
                                <h3 className="text-xl font-black mb-2">Lightning-Fast Response</h3>
                                <p className="opacity-75 text-sm leading-relaxed">
                                    Average response: <strong className="opacity-100">under 2 hours</strong> during business hours.
                                </p>
                                <div className="mt-4 text-sm font-medium opacity-80 flex items-center gap-1">
                                    Mon – Sat: 9AM – 8PM IST <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}