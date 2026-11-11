import { describe, it, expect } from 'vitest';
import { checkAvailability } from '/home/project/src/lib/availability.ts';
import { SAMPLE_ROOMS } from '../data';
import type { Room } from '../types';

const makeRoom = (overrides: Partial<Room> = {}): Room => ({
  id: 'room-a',
  name: 'Room A',
  building: 'Building 1',
  capacity: 10,
  blocked: false,
  equipment: [],
  bookings: [],
  ...overrides,
});

describe('checkAvailability', () => {
  it('allows a booking that only touches the end of an existing booking (AC4)', () => {
    const room = makeRoom({ bookings: [{ start: 600, end: 660, label: 'Existing' }] });
    const result = checkAvailability(room, { roomId: 'room-a', start: 660, end: 720, currentTime: 540 });
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects a booking that genuinely overlaps an existing booking (AC4)', () => {
    const room = makeRoom({ bookings: [{ start: 600, end: 660, label: 'Existing' }] });
    const result = checkAvailability(room, { roomId: 'room-a', start: 630, end: 690, currentTime: 540 });
    expect(result.available).toBe(false);
  });

    it('does not mutate the original bookings array (AC5)', () => {
    const bookings = [
      { start: 800, end: 860, label: 'Second' },
      { start: 600, end: 660, label: 'First' },
    ];
    const room = makeRoom({ bookings });
    const snapshot = JSON.stringify(bookings);

    checkAvailability(room, { roomId: 'room-a', start: 900, end: 950, currentTime: 540 });

    expect(JSON.stringify(bookings)).toBe(snapshot);
    expect(bookings[0].label).toBe('Second'); // порядок не должен поменяться
  });
    it('rejects when start is not after current time (AC1)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 540, end: 600, currentTime: 540 });
    expect(result.available).toBe(false);
  });

  it('allows exactly 120 minutes duration (AC2)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 720, currentTime: 540 });
    expect(result.available).toBe(true);
  });

  it('rejects duration over 120 minutes (AC2)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 721, currentTime: 540 });
    expect(result.available).toBe(false);
  });

  it('rejects a blocked room (AC3)', () => {
    const room = makeRoom({ blocked: true });
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 660, currentTime: 540 });
    expect(result.available).toBe(false);
  });

  it('rejects a start time earlier than the current time (AC1)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 500, end: 560, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Start time must be after the current time.');
  });

  it('rejects a reversed interval where end is before start (AC1)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 700, end: 650, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Start time must be earlier than end time.');
  });

  it('reports the duration reason for a 121-minute booking (AC2)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 721, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Booking duration cannot exceed 120 minutes.');
  });

  it('reports the blocked reason for a blocked room (AC3)', () => {
    const room = makeRoom({ name: 'Room C', blocked: true });
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 660, currentTime: 540 });
    expect(result.reasons).toContain('Room C is currently blocked and unavailable.');
  });

  it('reports the overlapping booking (AC4)', () => {
    const room = makeRoom({ bookings: [{ start: 600, end: 660, label: 'Existing' }] });
    const result = checkAvailability(room, { roomId: 'room-a', start: 630, end: 690, currentTime: 540 });
    expect(result.reasons).toContain('Overlaps existing booking "Existing" (600–660).');
  });

  it('allows a booking that ends exactly where an existing booking starts (AC4)', () => {
    const room = makeRoom({ bookings: [{ start: 600, end: 660, label: 'Existing' }] });
    const result = checkAvailability(room, { roomId: 'room-a', start: 540, end: 600, currentTime: 480 });
    expect(result.available).toBe(true);
  });

  it('leaves the sample room fixtures unchanged after checks (AC5)', () => {
    const snapshot = JSON.stringify(SAMPLE_ROOMS);
    for (const room of SAMPLE_ROOMS) {
      checkAvailability(room, { roomId: 'room-a', start: 700, end: 750, currentTime: 540 });
      checkAvailability(room, { roomId: 'room-a', start: 600, end: 660, currentTime: 540 });
    }
    expect(JSON.stringify(SAMPLE_ROOMS)).toBe(snapshot);
  });
});