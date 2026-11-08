import type { Room } from './types';

export const SAMPLE_ROOMS: Room[] = [
  {
    id: 'room-a',
    name: 'Room A — Lecture Hall',
    building: 'Engineering Block',
    capacity: 120,
    blocked: false,
    equipment: ['projector', 'whiteboard', 'microphone'],
    bookings: [
      { start: 600, end: 660, label: 'CS 101 Lecture' },
    ],
  },
  {
    id: 'room-b',
    name: 'Room B — Seminar Room',
    building: 'Science Block',
    capacity: 30,
    blocked: false,
    equipment: ['projector', 'whiteboard'],
    bookings: [],
  },
  {
    id: 'room-c',
    name: 'Room C — Lab',
    building: 'Innovation Wing',
    capacity: 40,
    blocked: true,
    equipment: ['computers', 'projector'],
    bookings: [],
  },
  {
    id: 'room-d',
    name: 'Room D — Study Lounge',
    building: 'Library',
    capacity: 15,
    blocked: false,
    equipment: ['whiteboard'],
    bookings: [
      { start: 540, end: 570, label: 'Reading Group' },
      { start: 780, end: 840, label: 'Project Meeting' },
    ],
  },
  {
    id: 'room-e',
    name: 'Room E — Meeting Room',
    building: 'Library',
    capacity: 10,
    blocked: false,
    equipment: ['video-conferencing', 'whiteboard'],
    bookings: [],
  },
  {
    id: 'room-f',
    name: 'Room F — Computer Lab',
    building: 'Innovation Wing',
    capacity: 25,
    blocked: false,
    equipment: ['computers', 'projector'],
    bookings: [
      { start: 840, end: 900, label: 'Software Workshop' },
    ],
  },
];
