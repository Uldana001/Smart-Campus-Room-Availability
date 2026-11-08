import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { SAMPLE_ROOMS } from '@/data';
import { checkAvailability } from '@/lib/availability';
import { filterRooms } from '@/lib/filterRooms';
import { isValidInterval } from '@/lib/interval';
import { DAY_END_MINUTES, MAX_DURATION_MINUTES } from '@/lib/rules';
import type { AvailabilityResult, Room, RoomFilter } from '@/types';
import { ResultCard } from '@/components/ResultCard';
import { RoomFilters } from '@/components/RoomFilters';
import { BookingForm } from '@/components/BookingForm';
import { RoomDetails } from '@/components/RoomDetails';

const DEFAULT_ATTENDEES = '1';

function parseAttendees(value: string): number {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function checkRoom(
  room: Room,
  currentTime: number,
  start: number,
  end: number
): AvailabilityResult {
  return checkAvailability(room, { roomId: room.id, currentTime, start, end });
}

export default function App() {
  const [attendeesStr, setAttendeesStr] = useState(DEFAULT_ATTENDEES);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [roomId, setRoomId] = useState(SAMPLE_ROOMS[0].id);
  const [currentTimeStr, setCurrentTimeStr] = useState('540');
  const [startStr, setStartStr] = useState('700');
  const [endStr, setEndStr] = useState('750');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const filter: RoomFilter = {
    attendees: parseAttendees(attendeesStr),
    requiredEquipment,
  };
  const visibleRooms = filterRooms(SAMPLE_ROOMS, filter);
  const currentRoom = visibleRooms.find((room) => room.id === roomId) ?? null;

  const currentTime = parseInt(currentTimeStr, 10);
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);

  const hasValidNumbers =
    !Number.isNaN(currentTime) &&
    !Number.isNaN(start) &&
    !Number.isNaN(end);
  const intervalValid = hasValidNumbers && isValidInterval(start, end);

  function applyFilter(nextAttendeesStr: string, nextEquipment: string[]) {
    const nextRooms = filterRooms(SAMPLE_ROOMS, {
      attendees: parseAttendees(nextAttendeesStr),
      requiredEquipment: nextEquipment,
    });
    setAttendeesStr(nextAttendeesStr);
    setRequiredEquipment(nextEquipment);
    if (!nextRooms.some((room) => room.id === roomId)) {
      setRoomId(nextRooms.length > 0 ? nextRooms[0].id : '');
      setResult(null);
    }
  }

  function handleClearFilters() {
    applyFilter(DEFAULT_ATTENDEES, []);
  }

  function handleCheck() {
    if (!currentRoom || !hasValidNumbers) return;
    setResult(checkRoom(currentRoom, currentTime, start, end));
  }

  function handleRoomChange(nextRoomId: string) {
    const nextRoom = visibleRooms.find((room) => room.id === nextRoomId);
    setRoomId(nextRoomId);
    setResult(
      result && nextRoom && hasValidNumbers
        ? checkRoom(nextRoom, currentTime, start, end)
        : null
    );
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs text-slate-500">
              Check whether a room can be booked for a given time interval.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid gap-6 lg:grid-cols-5">
        {/* Left column — filters and form */}
        <section className="lg:col-span-2 space-y-5">
          <RoomFilters
            attendeesValue={attendeesStr}
            requiredEquipment={requiredEquipment}
            visibleCount={visibleRooms.length}
            totalCount={SAMPLE_ROOMS.length}
            onChange={applyFilter}
          />

          <BookingForm
            visibleRooms={visibleRooms}
            currentRoom={currentRoom}
            currentTimeStr={currentTimeStr}
            startStr={startStr}
            endStr={endStr}
            currentTime={currentTime}
            start={start}
            end={end}
            hasValidNumbers={hasValidNumbers}
            intervalValid={intervalValid}
            onRoomChange={handleRoomChange}
            onCurrentTimeChange={setCurrentTimeStr}
            onStartChange={setStartStr}
            onEndChange={setEndStr}
            onCheck={handleCheck}
            onReset={handleReset}
            onClearFilters={handleClearFilters}
          />

          {/* Result */}
          {result && <ResultCard result={result} />}
        </section>

        {/* Right column — room detail / timeline */}
        <section className="lg:col-span-3 space-y-5">
          {currentRoom && (
            <RoomDetails
              room={currentRoom}
              start={start}
              end={end}
              intervalValid={intervalValid}
            />
          )}

          {/* Legend / help */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Rules
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">1.</span>
                Interval must satisfy 0 ≤ start &lt; end ≤ {DAY_END_MINUTES}, and start must
                be after the current time.
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">2.</span>
                Booking duration cannot exceed {MAX_DURATION_MINUTES} minutes.
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">3.</span>
                Blocked rooms cannot be booked.
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">4.</span>
                No overlap with existing bookings (touching endpoints are
                allowed).
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 text-center text-xs text-slate-400">
        Fictional sample data · No bookings are actually created or modified.
      </footer>
    </div>
  );
}
