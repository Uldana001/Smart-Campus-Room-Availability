import { describe, it, expect } from 'vitest';
import { filterRooms } from './filterRooms';
import { SAMPLE_ROOMS } from '../data';
import type { Room } from '../types';

const makeRoom = (overrides: Partial<Room> = {}): Room => ({
  id: 'room-test',
  name: 'Test Room',
  building: 'Test Building',
  capacity: 30,
  blocked: false,
  equipment: [],
  bookings: [],
  ...overrides,
});

const idsOf = (rooms: Room[]) => rooms.map((room) => room.id);

describe('filterRooms', () => {
  it('includes a room whose capacity equals the attendee count (F1)', () => {
    const result = filterRooms(SAMPLE_ROOMS, { attendees: 30, requiredEquipment: [] });
    expect(idsOf(result)).toEqual(['room-a', 'room-b', 'room-c']);
  });

  it('excludes a room whose capacity is below the attendee count (F1)', () => {
    const room = makeRoom({ capacity: 30 });
    const result = filterRooms([room], { attendees: 31, requiredEquipment: [] });
    expect(result).toEqual([]);
  });

  it('keeps a blocked room in the list when it matches (F1, F2)', () => {
    const result = filterRooms(SAMPLE_ROOMS, { attendees: 20, requiredEquipment: ['projector'] });
    expect(idsOf(result)).toEqual(['room-a', 'room-b', 'room-c', 'room-f']);
  });

  it('requires a room to have every requested item and capacity (F1, F2)', () => {
    const result = filterRooms(SAMPLE_ROOMS, {
      attendees: 30,
      requiredEquipment: ['computers', 'projector'],
    });
    expect(idsOf(result)).toEqual(['room-c']);
  });

  it('excludes a room that has only one of the required items (F2)', () => {
    const room = makeRoom({ equipment: ['projector'] });
    const result = filterRooms([room], {
      attendees: 10,
      requiredEquipment: ['projector', 'whiteboard'],
    });
    expect(result).toEqual([]);
  });

  it('returns an empty array when no room matches (F1)', () => {
    const result = filterRooms(SAMPLE_ROOMS, { attendees: 200, requiredEquipment: [] });
    expect(result).toEqual([]);
  });

  it('does not mutate the input rooms and returns a new array (purity)', () => {
    const snapshot = JSON.stringify(SAMPLE_ROOMS);
    const result = filterRooms(SAMPLE_ROOMS, { attendees: 20, requiredEquipment: ['projector'] });
    expect(JSON.stringify(SAMPLE_ROOMS)).toBe(snapshot);
    expect(result).not.toBe(SAMPLE_ROOMS);
  });
});
