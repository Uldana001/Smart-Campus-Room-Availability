import type { Room, AvailabilityResult, AvailabilityRequest } from '../types';
import { DAY_END_MINUTES, MAX_DURATION_MINUTES } from './rules';

export function checkAvailability(
  room: Room,
  request: AvailabilityRequest
): AvailabilityResult {
  const { start, end, currentTime } = request;
  const reasons: string[] = [];

  if (start < 0) {
    reasons.push('Start time must be 0 or greater.');
  }
  if (end > DAY_END_MINUTES) {
    reasons.push(`End time must be ${DAY_END_MINUTES} or less (midnight boundary).`);
  }
  if (start >= end) {
    reasons.push('Start time must be earlier than end time.');
  }
  if (start <= currentTime) {
    reasons.push('Start time must be after the current time.');
  }

  if (end - start > MAX_DURATION_MINUTES) {
    reasons.push(`Booking duration cannot exceed ${MAX_DURATION_MINUTES} minutes.`);
  }

  if (room.blocked) {
    reasons.push(`${room.name} is currently blocked and unavailable.`);
  }

 
  for (const booking of room.bookings) {
    const overlaps = start < booking.end && end > booking.start;
    if (overlaps) {
      reasons.push(
        `Overlaps existing booking "${booking.label}" (${booking.start}–${booking.end}).`
      );
    }
  }

  // AC5: return decision without mutating booking data
  return {
    available: reasons.length === 0,
    reasons,
  };
}

export function formatMinutes(min: number): string {
  const clamped = Math.max(0, Math.min(DAY_END_MINUTES, Math.round(min)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}
