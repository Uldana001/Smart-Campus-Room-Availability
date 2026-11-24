import type { ExplainAdapter, ExplainInput } from './explain';
import { SENTENCE_BY_CODE } from './reasonSentences';

// MOCK adapter: deterministic, no network, no booking labels or personal data.
export const mockAdapter: ExplainAdapter = async (input: ExplainInput) => {
  if (input.isAvailable) {
    return {
      explanation: `${input.roomLabel} is free for the requested time.`,
    };
  }
  const firstCode = input.reasonCodes[0] ?? 'UNKNOWN';
  const cause = SENTENCE_BY_CODE[firstCode] ?? SENTENCE_BY_CODE.UNKNOWN;
  return {
    explanation: `${input.roomLabel} cannot be booked at that time. ${cause}`,
  };
};
