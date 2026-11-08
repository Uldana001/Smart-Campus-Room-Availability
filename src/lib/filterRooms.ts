import type { Room, RoomFilter } from '../types';

export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= filter.attendees &&
      filter.requiredEquipment.every((item) => room.equipment.includes(item)),
  );
}
