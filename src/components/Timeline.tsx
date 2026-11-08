import { Clock } from 'lucide-react';
import { formatMinutes } from '@/lib/availability';
import { DAY_END_MINUTES } from '@/lib/rules';
import type { Booking } from '@/types';

interface Props {
  bookings: Booking[];
}

export function BookingTimeline({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">No existing bookings today.</p>
    );
  }

  return (
    <div className="space-y-2">
      {bookings
        .slice()
        .sort((a, b) => a.start - b.start)
        .map((booking) => {
          const leftPct = (booking.start / DAY_END_MINUTES) * 100;
          const widthPct = ((booking.end - booking.start) / DAY_END_MINUTES) * 100;
          return (
            <div key={`${booking.start}-${booking.label}`}>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-medium">{booking.label}</span>
                <span className="tabular-nums">
                  {formatMinutes(booking.start)} – {formatMinutes(booking.end)}
                </span>
              </div>
              <div className="relative h-5 rounded bg-slate-100 overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded bg-amber-300/80"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

interface CandidateProps {
  start: number | null;
  end: number | null;
}

export function CandidateMarker({ start, end }: CandidateProps) {
  if (start === null || end === null || start >= end) return null;

  const leftPct = (start / DAY_END_MINUTES) * 100;
  const widthPct = ((end - start) / DAY_END_MINUTES) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span className="font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" /> Candidate
        </span>
        <span className="tabular-nums">
          {formatMinutes(start)} – {formatMinutes(end)}
        </span>
      </div>
      <div className="relative h-5 rounded bg-slate-100 overflow-hidden">
        <div
          className="absolute top-0 h-full rounded bg-emerald-400/70"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
