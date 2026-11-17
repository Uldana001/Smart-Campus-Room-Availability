import type { ExplainAdapter, ExplainInput } from './explain';

const MOCK_SENTENCE_BY_CODE: Record<string, string> = {
  INVALID_INTERVAL: 'The requested time interval is not valid.',
  START_NOT_AFTER_CURRENT: 'The requested start time is not in the future.',
  TOO_LONG: 'The requested booking is too long.',
  ROOM_BLOCKED: 'The room is currently blocked.',
  OVERLAP: 'The requested time overlaps an existing booking.',
  UNKNOWN: 'This time cannot be booked.',
};

// MOCK adapter: deterministic, no network, no booking labels or personal data.
export const mockAdapter: ExplainAdapter = async (input: ExplainInput) => {
  if (input.isAvailable) {
    return {
      explanation: `${input.roomLabel} is free for the requested time.`,
    };
  }
  const firstCode = input.reasonCodes[0] ?? 'UNKNOWN';
  const cause = MOCK_SENTENCE_BY_CODE[firstCode] ?? MOCK_SENTENCE_BY_CODE.UNKNOWN;
  return {
    explanation: `${input.roomLabel} cannot be booked at that time. ${cause}`,
  };
};
