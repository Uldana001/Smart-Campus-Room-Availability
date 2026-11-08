import { describe, it, expect } from 'vitest';
import { SAMPLE_ROOMS } from './data';
import { filterRooms } from './lib/filterRooms';
import { checkAvailability } from './lib/availability';

const NOW = 540;

function roomById(id: string) {
  const room = SAMPLE_ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Unknown room: ${id}`);
  return room;
}

function check(roomId: string, start: number, end: number) {
  const room = roomById(roomId);
  return checkAvailability(room, { roomId: room.id, currentTime: NOW, start, end });
}

describe('filter + availability pipeline (integration)', () => {
  it('F3: a blocked room that passes the filters is never reported available', () => {
    const visible = filterRooms(SAMPLE_ROOMS, {
      attendees: 30,
      requiredEquipment: ['computers', 'projector'],
    });
    expect(visible.map((r) => r.id)).toEqual(['room-c']);
    const result = check('room-c', 700, 750);
    expect(result.available).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('blocked'))).toBe(true);
  });

  it('uses the chosen room own bookings, not another room data', () => {
    const roomA = check('room-a', 630, 690);
    expect(roomA.available).toBe(false);
    expect(roomA.reasons.some((r) => r.includes('CS 101 Lecture'))).toBe(true);
    expect(check('room-d', 630, 690).available).toBe(true);
    expect(check('room-b', 630, 690).available).toBe(true);
  });

  it('F4: no room matches an impossible requirement', () => {
    expect(filterRooms(SAMPLE_ROOMS, { attendees: 200, requiredEquipment: [] })).toEqual([]);
  });

  it('F1 + F2 + availability: blocked room stays visible but is not available', () => {
    const visible = filterRooms(SAMPLE_ROOMS, { attendees: 20, requiredEquipment: ['projector'] });
    expect(visible.map((r) => r.id)).toEqual(['room-a', 'room-b', 'room-c', 'room-f']);
    const availableIds = visible.filter((r) => check(r.id, 700, 750).available).map((r) => r.id);
    expect(availableIds).toEqual(['room-a', 'room-b', 'room-f']);
  });

  it('AC5: filtering and checking every room leaves the sample data unchanged', () => {
    const before = JSON.stringify(SAMPLE_ROOMS);
    const visible = filterRooms(SAMPLE_ROOMS, { attendees: 1, requiredEquipment: [] });
    visible.forEach((room) => check(room.id, 700, 750));
    expect(JSON.stringify(SAMPLE_ROOMS)).toBe(before);
  });
});