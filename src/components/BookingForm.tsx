import { Clock, ArrowRight, Ban } from 'lucide-react';
import { formatMinutes } from '@/lib/availability';
import { DAY_END_MINUTES } from '@/lib/rules';
import type { Room } from '@/types';

interface Props {
  visibleRooms: Room[];
  currentRoom: Room | null;
  currentTimeStr: string;
  startStr: string;
  endStr: string;
  currentTime: number;
  start: number;
  end: number;
  hasValidNumbers: boolean;
  intervalValid: boolean;
  onRoomChange: (roomId: string) => void;
  onCurrentTimeChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCheck: () => void;
  onReset: () => void;
  onClearFilters: () => void;
}

export function BookingForm({
  visibleRooms,
  currentRoom,
  currentTimeStr,
  startStr,
  endStr,
  currentTime,
  start,
  end,
  hasValidNumbers,
  intervalValid,
  onRoomChange,
  onCurrentTimeChange,
  onStartChange,
  onEndChange,
  onCheck,
  onReset,
  onClearFilters,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
        Booking Request
      </h2>

      {currentRoom ? (
        <div className="space-y-4">
          {/* Room selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Room
            </label>
            <select
              value={currentRoom.id}
              onChange={(e) => onRoomChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {visibleRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (capacity {room.capacity})
                  {room.blocked ? ' — Blocked' : ''}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{currentRoom.building}</span>
              <span>Capacity: {currentRoom.capacity}</span>
              {currentRoom.blocked && (
                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                  <Ban className="w-3 h-3" /> Blocked
                </span>
              )}
            </div>
          </div>

          {/* Current time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Time (minutes since midnight)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={DAY_END_MINUTES}
                value={currentTimeStr}
                onChange={(e) => onCurrentTimeChange(e.target.value)}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {hasValidNumbers && currentTime >= 0 && currentTime <= DAY_END_MINUTES && (
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatMinutes(currentTime)}
                </span>
              )}
            </div>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Start (min)
              </label>
              <input
                type="number"
                min={0}
                max={DAY_END_MINUTES}
                value={startStr}
                onChange={(e) => onStartChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End (min)
              </label>
              <input
                type="number"
                min={0}
                max={DAY_END_MINUTES}
                value={endStr}
                onChange={(e) => onEndChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Live preview of duration / clock times */}
          {intervalValid && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                Interval:{' '}
                <span className="tabular-nums font-medium">
                  {formatMinutes(start)} – {formatMinutes(end)}
                </span>
              </span>
              <span>
                Duration:{' '}
                <span className="font-medium">{end - start} min</span>
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCheck}
              disabled={!hasValidNumbers}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Availability
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            No rooms match your requirements. Try fewer attendees or less equipment.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
