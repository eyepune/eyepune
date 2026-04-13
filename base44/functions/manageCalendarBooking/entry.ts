import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, bookingData, date } = await req.json();

        let accessToken;
        try {
            accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
        } catch (error) {
            console.error('Failed to get access token:', error);
            return Response.json({ 
                error: 'Google Calendar not connected. Please contact support.' 
            }, { status: 500 });
        }

        if (action === 'getAvailableSlots') {
            // Get busy times from Google Calendar
            const calendarId = 'primary';
            const timeMin = new Date(date);
            timeMin.setHours(0, 0, 0, 0);
            const timeMax = new Date(date);
            timeMax.setHours(23, 59, 59, 999);

            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/freeBusy`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        timeMin: timeMin.toISOString(),
                        timeMax: timeMax.toISOString(),
                        items: [{ id: calendarId }]
                    })
                }
            );

            const busyData = await response.json();
            const busySlots = busyData.calendars?.[calendarId]?.busy || [];

            // Generate available slots (9 AM - 6 PM, 30-min intervals)
            const availableSlots = [];
            const startHour = 9;
            const endHour = 18;
            
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotStart = new Date(date);
                    slotStart.setHours(hour, minute, 0, 0);
                    const slotEnd = new Date(slotStart);
                    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

                    // Check if slot is in the past
                    if (slotStart < new Date()) continue;

                    // Check if slot overlaps with busy times
                    const isBusy = busySlots.some(busy => {
                        const busyStart = new Date(busy.start);
                        const busyEnd = new Date(busy.end);
                        return slotStart < busyEnd && slotEnd > busyStart;
                    });

                    if (!isBusy) {
                        availableSlots.push({
                            start: slotStart.toISOString(),
                            end: slotEnd.toISOString(),
                            display: slotStart.toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                            })
                        });
                    }
                }
            }

            return Response.json({ availableSlots });
        }

        if (action === 'createEvent') {
            const scheduledDate = new Date(bookingData.scheduled_date);
            const endDate = new Date(scheduledDate);
            endDate.setMinutes(endDate.getMinutes() + 30);

            // Create Google Calendar event with Meet link
            const event = {
                summary: `Consultation: ${bookingData.name}`,
                description: `Free consultation call with ${bookingData.name}\n\nCompany: ${bookingData.company || 'N/A'}\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\n\nNotes: ${bookingData.notes || 'None'}`,
                start: {
                    dateTime: scheduledDate.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                end: {
                    dateTime: endDate.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                attendees: [
                    { email: bookingData.email }
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `booking-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'email', minutes: 60 },
                    ],
                },
            };

            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event)
                }
            );

            const createdEvent = await response.json();
            
            if (!response.ok) {
                console.error('Calendar API Error:', createdEvent);
                throw new Error(createdEvent.error?.message || 'Failed to create calendar event');
            }

            // Note: Email confirmation is handled by Google Calendar's sendUpdates=all parameter
            // The calendar invite will be sent to the attendee automatically

            return Response.json({ 
                success: true,
                eventId: createdEvent.id,
                meetLink: createdEvent.hangoutLink,
                htmlLink: createdEvent.htmlLink
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Calendar error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});