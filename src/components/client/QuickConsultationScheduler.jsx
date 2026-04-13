import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from 'sonner';

export default function QuickConsultationScheduler({ project, user, open, onClose }) {
    const [formData, setFormData] = useState({
        scheduled_date: '',
        selectedSlot: null,
        notes: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
                    name: user.full_name,
                    email: user.email,
                    company: project?.project_name || '',
                    notes: formData.notes,
                    scheduled_date: formData.selectedSlot
                }
            });

            if (!calendarResponse.data.success) {
                throw new Error('Failed to create calendar event');
            }

            // Create booking in database
            await base44.entities.Booking.create({
                name: user.full_name,
                email: user.email,
                booking_type: 'consultation',
                scheduled_date: formData.selectedSlot,
                duration_minutes: 30,
                status: 'scheduled',
                notes: `Project: ${project?.project_name}. ${formData.notes}`,
                google_calendar_event_id: calendarResponse.data.eventId,
                google_meet_link: calendarResponse.data.meetLink
            });

            // Send notification message
            await base44.entities.ClientMessage.create({
                project_id: project.id,
                sender_email: user.email,
                sender_name: user.full_name,
                message_text: `📅 Consultation scheduled for ${new Date(formData.selectedSlot).toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                })}`,
                sender_type: 'client'
            });

            setIsSuccess(true);
            toast.success('Consultation scheduled successfully!');
            
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFormData({ scheduled_date: '', selectedSlot: null, notes: '' });
            }, 2000);

        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to schedule consultation. Please try again.');
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Schedule Quick Consultation</DialogTitle>
                </DialogHeader>
                
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Booking Confirmed!</h3>
                        <p className="text-sm text-muted-foreground">
                            Calendar invite sent to your email
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Select Date *</Label>
                            <DatePicker
                                value={formData.scheduled_date}
                                onChange={(val) => setFormData({ ...formData, scheduled_date: val, selectedSlot: null })}
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
                                <div className="grid grid-cols-3 gap-2 mt-2 max-h-[200px] overflow-y-auto">
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
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Brief description of topics you'd like to cover..."
                                className="mt-2 min-h-[80px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !formData.selectedSlot}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        Confirm
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}