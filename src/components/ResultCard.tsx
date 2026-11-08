import { CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityResult } from '@/types';

interface Props {
  result: AvailabilityResult;
}

export function ResultCard({ result }: Props) {
  if (result.available) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-semibold text-emerald-800">Available</h3>
          <p className="text-sm text-emerald-700 mt-0.5">
            This room can be booked for the requested time interval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-semibold text-red-800">Unavailable</h3>
          <p className="text-sm text-red-700 mt-0.5">
            This room cannot be booked for the requested interval:
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 pl-9">
        {result.reasons.map((reason, i) => (
          <li
            key={i}
            className="text-sm text-red-700 flex items-start gap-2"
          >
            <span className="text-red-400 mt-0.5">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
