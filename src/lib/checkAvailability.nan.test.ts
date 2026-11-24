import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
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

describe('checkAvailability NaN handling (E1, mitigation M1)', () => {
  it('rejects a request where start is NaN', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: NaN, end: 660, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Times must be valid numbers.');
  });

  it('rejects a request where end is NaN', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: NaN, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Times must be valid numbers.');
  });

  it('rejects a request where currentTime is NaN', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 660, currentTime: NaN });
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Times must be valid numbers.');
  });

  it('still allows a normal valid request on an unblocked room with no overlap (control, passes before and after the fix)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, { roomId: 'room-a', start: 600, end: 660, currentTime: 540 });
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});
