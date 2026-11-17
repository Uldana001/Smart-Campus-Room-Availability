import { DAY_END_MINUTES } from '../rules';
import { formatMinutes } from '../availability';

export type ReasonCode =
  | 'INVALID_INTERVAL'
  | 'START_NOT_AFTER_CURRENT'
  | 'TOO_LONG'
  | 'ROOM_BLOCKED'
  | 'OVERLAP'
  | 'UNKNOWN';

export interface ExplainInput {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCodes: ReasonCode[];
}

export interface ExplainOutput {
  explanation: string;
}

export type ExplainAdapter = (input: ExplainInput) => Promise<ExplainOutput>;

export const EXPLAIN_TIMEOUT_MS = 3000;

const INPUT_BOUND = 100000;
const MAX_LABEL_LENGTH = 80;
const MAX_EXPLANATION_LENGTH = 250;

const REASON_MAPPINGS: Array<{ pattern: RegExp; code: ReasonCode }> = [
  { pattern: /^Start time must be 0 or greater/, code: 'INVALID_INTERVAL' },
  { pattern: /^End time must be \d+ or less/, code: 'INVALID_INTERVAL' },
  { pattern: /^Start time must be earlier than end time/, code: 'INVALID_INTERVAL' },
  { pattern: /^Start time must be after the current time/, code: 'START_NOT_AFTER_CURRENT' },
  { pattern: /^Booking duration cannot exceed \d+ minutes/, code: 'TOO_LONG' },
  { pattern: / is currently blocked and unavailable\.$/, code: 'ROOM_BLOCKED' },
  { pattern: /^Overlaps existing booking/, code: 'OVERLAP' },
];

export function mapReasonsToCodes(reasons: string[]): ReasonCode[] {
  const codes: ReasonCode[] = [];
  for (const reason of reasons) {
    const match = REASON_MAPPINGS.find((mapping) => mapping.pattern.test(reason));
    const code = match ? match.code : 'UNKNOWN';
    if (!codes.includes(code)) {
      codes.push(code);
    }
  }
  return codes;
}

export function validateInput(input: ExplainInput): boolean {
  if (typeof input.roomLabel !== 'string') return false;
  const label = input.roomLabel.trim();
  if (label.length < 1 || label.length > MAX_LABEL_LENGTH) return false;

  if (!Number.isInteger(input.start) || !Number.isInteger(input.end)) return false;
  if (Math.abs(input.start) > INPUT_BOUND || Math.abs(input.end) > INPUT_BOUND) return false;

  if (!Array.isArray(input.reasonCodes)) return false;
  for (const code of input.reasonCodes) {
    if (!REASON_MAPPINGS.some((mapping) => mapping.code === code) && code !== 'UNKNOWN') {
      return false;
    }
    if (code === 'UNKNOWN' && input.isAvailable) return false;
  }

  if (input.isAvailable && input.reasonCodes.length !== 0) return false;
  if (!input.isAvailable && input.reasonCodes.length === 0) return false;

  if (input.isAvailable) {
    if (input.start < 0 || input.start >= input.end || input.end > DAY_END_MINUTES) {
      return false;
    }
  }

  return true;
}

function countSentences(text: string): number {
  return text.split(/[.!?](?:\s|$)/).filter((part) => part.trim().length > 0).length;
}

export function validateExplanation(text: string, isAvailable: boolean): boolean {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_EXPLANATION_LENGTH) return false;
  if (countSentences(trimmed) > 2) return false;

  const forbiddenChars = /[*_`#<>]|https?:\/\//;
  if (forbiddenChars.test(trimmed)) return false;

  if (isAvailable) {
    const contradictions = /cannot|not available|unavailable|blocked|overlap/i;
    if (contradictions.test(trimmed)) return false;
  } else {
    const contradictions = /can be booked|is available/i;
    if (contradictions.test(trimmed)) return false;
  }

  return true;
}

const GENERIC_FALLBACK = 'Explanation unavailable for this request.';
const NEUTRAL_FALLBACK = 'This time cannot be booked.';

const FALLBACK_BY_CODE: Record<ReasonCode, string> = {
  INVALID_INTERVAL: 'The requested time interval is not valid.',
  START_NOT_AFTER_CURRENT: 'The requested start time is not in the future.',
  TOO_LONG: 'The requested booking is too long.',
  ROOM_BLOCKED: 'The room is currently blocked.',
  OVERLAP: 'The requested time overlaps an existing booking.',
  UNKNOWN: NEUTRAL_FALLBACK,
};

export function buildFallback(input: ExplainInput): string {
  if (typeof input.roomLabel !== 'string' || !Number.isInteger(input.start) || !Number.isInteger(input.end)) {
    return GENERIC_FALLBACK;
  }
  const label = input.roomLabel.trim();
  if (label.length < 1 || label.length > MAX_LABEL_LENGTH) {
    return GENERIC_FALLBACK;
  }

  const timesArePrintable =
    input.start >= 0 && input.start < input.end && input.end <= DAY_END_MINUTES;

  if (input.isAvailable) {
    if (!timesArePrintable) {
      return GENERIC_FALLBACK;
    }
    return `${label} can be booked from ${formatMinutes(input.start)} to ${formatMinutes(input.end)}.`;
  }

  const codes = input.reasonCodes.length > 0 ? input.reasonCodes : (['UNKNOWN'] as ReasonCode[]);
  if (codes.includes('INVALID_INTERVAL')) {
    return `${label} cannot be booked: the requested time interval is not valid.`;
  }
  const parts = codes.map((code) => FALLBACK_BY_CODE[code]);
  const cause = parts.filter((part) => part !== NEUTRAL_FALLBACK).join(' ');
  if (cause.length === 0) {
    return NEUTRAL_FALLBACK;
  }
  return `${label} cannot be booked. ${cause}`;
}

export async function explainAvailability(
  input: ExplainInput,
  adapter: ExplainAdapter,
  timeoutMs: number = EXPLAIN_TIMEOUT_MS
): Promise<{ explanation: string; usedFallback: boolean }> {
  if (!validateInput(input)) {
    return { explanation: buildFallback(input), usedFallback: true };
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('explanation timed out')), timeoutMs);
  });

  let output: ExplainOutput | null = null;
  try {
    const result = await Promise.race([adapter(input), timeoutPromise]);
    output = result;
  } catch {
    return { explanation: buildFallback(input), usedFallback: true };
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }

  if (
    output === null ||
    typeof output !== 'object' ||
    typeof output.explanation !== 'string' ||
    !validateExplanation(output.explanation, input.isAvailable)
  ) {
    return { explanation: buildFallback(input), usedFallback: true };
  }

  return { explanation: output.explanation, usedFallback: false };
}
