import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { SAMPLE_ROOMS } from '../data';

const ROOM_A = SAMPLE_ROOMS.find((room) => room.id === 'room-a')!;
const ROOM_C = SAMPLE_ROOMS.find((room) => room.id === 'room-c')!;

describe('checkAvailability acceptance (T1-T8)', () => {
  it('T1: allows a free slot on room-a', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 760, currentTime: 540 });
    expect(result.available).toBe(true);
  });

  it('T2: rejects an overlapping booking on room-a with the overlap reason', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 630, end: 690, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons.some((reason) => reason.startsWith('Overlaps existing booking'))).toBe(true);
  });

  it('T3: rejects a blocked room with a reason mentioning it', () => {
    const result = checkAvailability(ROOM_C, { roomId: 'room-c', start: 700, end: 760, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons.some((reason) => reason.includes('blocked'))).toBe(true);
  });

  it('T4: rejects start === end with exactly the ordering reason', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 700, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Start time must be earlier than end time.']);
  });

  it('T5: rejects a 121-minute booking with exactly the duration reason', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 821, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Booking duration cannot exceed 120 minutes.']);
  });

  it('T6: rejects a start before current time with exactly the current-time reason', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 500, end: 560, currentTime: 540 });
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Start time must be after the current time.']);
  });

  it('T7: allows a booking that starts exactly when the existing booking ends', () => {
    const result = checkAvailability(ROOM_A, { roomId: 'room-a', start: 660, end: 720, currentTime: 540 });
    expect(result.available).toBe(true);
  });

  it('T8: never mutates SAMPLE_ROOMS (AC5)', () => {
    const before = JSON.stringify(SAMPLE_ROOMS);
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 760, currentTime: 540 });
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 630, end: 690, currentTime: 540 });
    checkAvailability(ROOM_C, { roomId: 'room-c', start: 700, end: 760, currentTime: 540 });
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 700, currentTime: 540 });
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 700, end: 821, currentTime: 540 });
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 500, end: 560, currentTime: 540 });
    checkAvailability(ROOM_A, { roomId: 'room-a', start: 660, end: 720, currentTime: 540 });
    const after = JSON.stringify(SAMPLE_ROOMS);
    expect(before).toBe(after);
  });
});
