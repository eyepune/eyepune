import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from "@/api/base44Client";
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
        selectedSlot: null
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
        try {
            const response = await base44.functions.invoke('manageCalendarBooking', {
                action: 'getAvailableSlots',
                date: date
            });
            setAvailableSlots(response.data.availableSlots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
        }
        setLoadingSlots(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create Google Calendar event
            const calendarResponse = await base44.functions.invoke('manageCalendarBooking', {
                action: 'createEvent',
                bookingData: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    notes: formData.notes,
                    scheduled_date: formData.selectedSlot
                }
            });

            if (calendarResponse.data.error) {
                throw new Error(calendarResponse.data.error);
            }
            
            if (!calendarResponse.data.success) {
                throw new Error('Failed to create calendar event');
            }

            // Create booking in database
            const booking = await base44.entities.Booking.create({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                booking_type: 'consultation',
                scheduled_date: formData.selectedSlot,
                duration_minutes: 30,
                status: 'scheduled',
                notes: formData.notes,
                google_calendar_event_id: calendarResponse.data.eventId,
                google_meet_link: calendarResponse.data.meetLink
            });

            // Create lead
            const lead = await base44.entities.Lead.create({
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                source: 'booking',
                status: 'contacted',
                notes: `Consultation booked for ${new Date(formData.selectedSlot).toLocaleString()}`
            });

            // Log activity
            await base44.entities.Activity.create({
                lead_id: lead.id,
                activity_type: 'booking',
                title: 'Booked free consultation',
                description: `Scheduled for ${new Date(formData.selectedSlot).toLocaleString()}`,
                performed_by: 'system'
            });

            // Send WhatsApp notification to admin
            try {
                await base44.functions.invoke('sendAdminWhatsAppNotification', {
                    event_type: 'booking_confirmed',
                    lead_name: formData.name,
                    lead_email: formData.email,
                    details: {
                        date: new Date(formData.selectedSlot).toLocaleString(),
                        type: 'Free Consultation'
                    }
                });
            } catch (e) {
                console.log('WhatsApp notification failed (non-critical):', e);
            }

            // Send email notifications to customer + admin
            try {
                await base44.functions.invoke('sendBookingNotification', {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    scheduledDate: formData.selectedSlot,
                    meetLink: calendarResponse.data.meetLink,
                    notes: formData.notes
                });
            } catch (e) {
                console.log('Email notification failed (non-critical):', e);
            }

            setMeetLink(calendarResponse.data.meetLink);
            setIsSuccess(true);
        } catch (error) {
            console.error('Booking error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Please try again.';
            alert(`Failed to create booking: ${errorMessage}`);
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