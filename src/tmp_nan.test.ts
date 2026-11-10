import { it } from 'vitest';
import { checkAvailability } from './lib/availability';
import { SAMPLE_ROOMS } from './data';
it('NaN start', () => {
  const room = SAMPLE_ROOMS[0];
  const r = checkAvailability(room, { roomId: room.id, currentTime: 540, start: NaN, end: 700 });
  console.log(JSON.stringify(r));
});