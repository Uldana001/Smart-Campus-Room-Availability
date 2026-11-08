export interface Booking {
  start: number;
  end: number;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
  bookings: Booking[];
}

export interface RoomFilter {
  attendees: number;
  requiredEquipment: string[];
}

export interface AvailabilityResult {
  available: boolean;
  reasons: string[];
}

export interface AvailabilityRequest {
  roomId: string;
  currentTime: number;
  start: number;
  end: number;
}
