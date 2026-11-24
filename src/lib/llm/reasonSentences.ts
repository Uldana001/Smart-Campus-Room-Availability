import type { ReasonCode } from './explain';

export const SENTENCE_BY_CODE: Record<ReasonCode, string> = {
  INVALID_INTERVAL: 'The requested time interval is not valid.',
  START_NOT_AFTER_CURRENT: 'The requested start time is not in the future.',
  TOO_LONG: 'The requested booking is too long.',
  ROOM_BLOCKED: 'The room is currently blocked.',
  OVERLAP: 'The requested time overlaps an existing booking.',
  UNKNOWN: 'This time cannot be booked.',
};
