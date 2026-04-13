import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Video, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-gray-500/20 text-gray-400',
};

export default function BookingsSection() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings-admin'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100),
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => qc.invalidateQueries(['bookings-admin']),
  });

  const upcoming = bookings.filter(b => b.status === 'scheduled');
  const past = bookings.filter(b => b.status !== 'scheduled');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Bookings & Consultations</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', count: bookings.filter(b => b.status === 'scheduled').length, color: 'text-blue-400' },
          { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'text-green-400' },
          { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-400' },
          { label: 'No Show', count: bookings.filter(b => b.status === 'no_show').length, color: 'text-gray-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 && <p className="text-gray-600 text-sm">No upcoming bookings</p>}
        <div className="space-y-3">
          {upcoming.map(b => (
            <div key={b.id} className="flex items-start gap-4 p-3 bg-white/[0.03] rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{b.name}</p>
                <p className="text-sm text-gray-500">{b.email} · {b.phone}</p>
                {b.company && <p className="text-sm text-gray-600">{b.company}</p>}
                <p className="text-sm text-blue-400 mt-1">
                  {b.scheduled_date ? format(new Date(b.scheduled_date), 'EEEE, MMM d · h:mm a') : ''}
                </p>
                {b.notes && <p className="text-xs text-gray-600 mt-1">{b.notes}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {b.google_meet_link && (
                  <a href={b.google_meet_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-500/10 px-2 py-1 rounded-lg"
                  >
                    <Video className="w-3 h-3" /> Join Meet
                  </a>
                )}
                <button
                  onClick={() => updateBooking.mutate({ id: b.id, data: { status: 'completed' } })}
                  className="flex items-center gap-1.5 text-xs text-white bg-green-600/20 hover:bg-green-600/30 px-2 py-1 rounded-lg"
                >
                  <CheckCircle2 className="w-3 h-3" /> Done
                </button>
                <button
                  onClick={() => updateBooking.mutate({ id: b.id, data: { status: 'cancelled' } })}
                  className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg"
                >
                  <XCircle className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Past Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Email', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {past.map(b => (
                <tr key={b.id}>
                  <td className="py-2.5 pr-4 text-white">{b.name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{b.email}</td>
                  <td className="py-2.5 pr-4 text-gray-500 text-xs">{b.scheduled_date ? format(new Date(b.scheduled_date), 'MMM d, yyyy') : ''}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {past.length === 0 && <p className="text-gray-600 text-sm py-4">No past bookings</p>}
        </div>
      </div>
    </div>
  );
}