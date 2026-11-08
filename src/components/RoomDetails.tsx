import { Ban } from 'lucide-react';
import { BookingTimeline, CandidateMarker } from '@/components/Timeline';
import type { Room } from '@/types';

interface Props {
  room: Room;
  start: number;
  end: number;
  intervalValid: boolean;
}

export function RoomDetails({ room, start, end, intervalValid }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {room.name}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {room.building} · Seats {room.capacity}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            room.blocked
              ? 'bg-red-100 text-red-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {room.blocked ? (
            <>
              <Ban className="w-3.5 h-3.5" /> Blocked
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </>
          )}
        </span>
      </div>

      <div className="space-y-4">
        {/* Existing bookings */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Existing Bookings
          </h3>
          <BookingTimeline bookings={room.bookings} />
        </div>

        {/* Candidate interval preview */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Candidate Interval
          </h3>
          {room.blocked ? (
            <p className="text-sm text-red-600 font-medium">
              This room is blocked and cannot be booked.
            </p>
          ) : intervalValid ? (
            <CandidateMarker start={start} end={end} />
          ) : (
            <p className="text-sm text-slate-400 italic">
              Enter a valid start and end time to preview the interval.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
