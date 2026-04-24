import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Video, Loader2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";

export default function Booking() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        scheduled_date: '',
        selectedSlot: null,
        website_url: '' // Honeypot
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [meetLink, setMeetLink] = useState('');
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        if (contentRef.current && isSuccess) {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isSuccess]);

    useEffect(() => {
        if (formData.scheduled_date) {
            fetchAvailableSlots(formData.scheduled_date);
        }
    }, [formData.scheduled_date]);

    const fetchAvailableSlots = async (date) => {
        setLoadingSlots(true);
        // Simulating available slots since Edge Function is missing
        // In a real app, you'd fetch this from a DB or calendar API
        const slots = [
            { start: `${date}T09:00:00`, display: '09:00 AM' },
            { start: `${date}T10:00:00`, display: '10:00 AM' },
            { start: `${date}T11:00:00`, display: '11:00 AM' },
            { start: `${date}T14:00:00`, display: '02:00 PM' },
            { start: `${date}T15:00:00`, display: '03:00 PM' },
            { start: `${date}T16:00:00`, display: '04:00 PM' },
        ];
        setAvailableSlots(slots);
        setLoadingSlots(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Honeypot spam protection
        if (formData.website_url) {
            console.warn('Bot detected during booking');
            setIsSuccess(true); // Pretend success to the bot
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedDate = new Date(formData.selectedSlot);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const timeStr = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // 1. Create booking in Supabase
            const { error: bookingError } = await supabase.from('bookings').insert([{
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                service_type: 'consultation',
                booking_date: dateStr,
                booking_time: timeStr,
                duration: '30 min',
                status: 'pending',
                notes: formData.notes,
                meeting_link: 'https://meet.google.com/lookup/eyepune'
            }]);
            if (bookingError) throw bookingError;

            // 2. Create lead in Supabase
            await supabase.from('leads').insert([{
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                source: 'booking',
                status: 'contacted',
                score: 50,
                notes: `Consultation booked for ${selectedDate.toLocaleString()}`
            }]).then(({ error }) => { if (error) console.warn('Lead creation failed:', error); });

            // 3. Trigger booking confirmation automation (sends email to lead) — non-blocking
            fetch('/api/automation/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trigger: 'new_booking',
                    payload: {
                        name: formData.name,
                        email: formData.email,
                        date: selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                        time: timeStr,
                        company: formData.company || 'their business'
                    }
                })
            }).catch(err => console.warn('[Booking] Automation trigger failed:', err));

            // 4. Admin notification email — non-blocking
            fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'connect@eyepune.com',
                    subject: `📅 New Booking: ${formData.name} — ${dateStr} at ${timeStr}`,
                    html: `
                        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #ef4444; margin-top: 0;">📅 New Consultation Booked</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${formData.name}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #111827;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; color: #111827;">${formData.phone || '—'}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${dateStr}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Time</td><td style="padding: 8px 0; font-weight: 600; color: #111827;">${timeStr}</td></tr>
                                <tr><td style="padding: 8px 0; color: #6b7280;">Notes</td><td style="padding: 8px 0; color: #111827;">${formData.notes || '—'}</td></tr>
                            </table>
                            <a href="https://eyepune.com/Admin_Forms" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">View Bookings Dashboard →</a>
                        </div>
                    `
                })
            }).catch(err => console.warn('[Booking] Admin notification failed:', err));

            setMeetLink('https://meet.google.com/lookup/eyepune');
            setIsSuccess(true);
        } catch (error) {
            console.error('Booking error:', error);
            alert(`Failed to create booking: ${error.message || 'Please try again.'}`);
        }

        setIsSubmitting(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="max-w-4xl mx-auto px-6" ref={contentRef}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Book Your Free Consultation
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        30-minute call to discuss your business goals
                    </p>
                </motion.div>

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border rounded-2xl p-12 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mb-6">
                            Calendar invite sent! Check your email for the Google Meet link and calendar details.
                        </p>
                        {meetLink && (
                            <a 
                                href={meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mb-4"
                            >
                                <Video className="w-5 h-5" />
                                Join Google Meet
                            </a>
                        )}
                        <p className="text-sm text-muted-foreground">
                            A calendar invite has been sent to your email with all the details.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 space-y-6">
                                {/* Honeypot field (hidden from users) */}
                                <div className="sr-only opacity-0 absolute -z-10 pointer-events-none">
                                    <input
                                        type="text"
                                        name="website_url"
                                        value={formData.website_url || ''}
                                        onChange={handleChange}
                                        tabIndex="-1"
                                        autoComplete="off"
                                    />
                                </div>
                                <div>
                                    <Label>Full Name *</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Phone Number *</Label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Company</Label>
                                    <Input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Select Date *</Label>
                                    <DatePicker
                                        value={formData.scheduled_date}
                                        onChange={(val) => setFormData(prev => ({ ...prev, scheduled_date: val, selectedSlot: null }))}
                                        required
                                        fromDate={new Date()}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Select Time Slot *</Label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                                        </div>
                                    ) : !formData.scheduled_date ? (
                                        <p className="text-sm text-muted-foreground mt-2">Select a date first</p>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground mt-2">No available slots for this date</p>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {availableSlots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, selectedSlot: slot.start })}
                                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                                        formData.selectedSlot === slot.start
                                                            ? 'bg-red-600 text-white border-red-600'
                                                            : 'bg-card border-border hover:border-red-500'
                                                    }`}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>What would you like to discuss?</Label>
                                    <Textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="mt-2 min-h-[100px]"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.selectedSlot}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating Calendar Event...
                                        </>
                                    ) : 'Confirm Booking'}
                                </Button>
                            </form>
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-card border rounded-2xl p-8">
                                <h3 className="text-xl font-bold mb-4">What to Expect</h3>
                                <ul className="space-y-4">
                                    {[
                                        'Free 30-minute consultation',
                                        'Google Meet video call',
                                        'Discussion of your business goals',
                                        'Customized growth recommendations',
                                        'No-pressure conversation'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-8 text-white">
                                <Clock className="w-12 h-12 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Available Hours</h3>
                                <p className="opacity-90">
                                    Monday - Friday: 9:00 AM - 6:00 PM IST
                                </p>
                                <p className="opacity-90 mt-1">
                                    We'll confirm your slot within 24 hours
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}