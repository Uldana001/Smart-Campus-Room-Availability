import { describe, it, expect, vi } from 'vitest';
import {
  mapReasonsToCodes,
  validateInput,
  validateExplanation,
  buildFallback,
  explainAvailability,
  type ExplainInput,
  type ExplainAdapter,
  type ReasonCode,
} from './explain';
import { mockAdapter } from './mockAdapter';
import { SAMPLE_ROOMS } from '../../data';

const validInput: ExplainInput = {
  roomLabel: 'Room A',
  start: 600,
  end: 660,
  isAvailable: true,
  reasonCodes: [],
};

const unavailableInput: ExplainInput = {
  roomLabel: 'Room C',
  start: 600,
  end: 660,
  isAvailable: false,
  reasonCodes: ['ROOM_BLOCKED'],
};

const ALL_CODES: ReasonCode[] = [
  'INVALID_INTERVAL',
  'START_NOT_AFTER_CURRENT',
  'TOO_LONG',
  'ROOM_BLOCKED',
  'OVERLAP',
  'UNKNOWN',
];

describe('mapReasonsToCodes', () => {
  it('maps "Start time must be 0 or greater." to INVALID_INTERVAL', () => {
    expect(mapReasonsToCodes(['Start time must be 0 or greater.'])).toEqual(['INVALID_INTERVAL']);
  });

  it('maps "End time must be 1440 or less (midnight boundary)." to INVALID_INTERVAL', () => {
    expect(mapReasonsToCodes(['End time must be 1440 or less (midnight boundary).'])).toEqual(['INVALID_INTERVAL']);
  });

  it('maps "Start time must be earlier than end time." to INVALID_INTERVAL', () => {
    expect(mapReasonsToCodes(['Start time must be earlier than end time.'])).toEqual(['INVALID_INTERVAL']);
  });

  it('maps "Start time must be after the current time." to START_NOT_AFTER_CURRENT', () => {
    expect(mapReasonsToCodes(['Start time must be after the current time.'])).toEqual(['START_NOT_AFTER_CURRENT']);
  });

  it('maps "Booking duration cannot exceed 120 minutes." to TOO_LONG', () => {
    expect(mapReasonsToCodes(['Booking duration cannot exceed 120 minutes.'])).toEqual(['TOO_LONG']);
  });

  it('maps the blocked reason to ROOM_BLOCKED', () => {
    expect(mapReasonsToCodes(['Room C is currently blocked and unavailable.'])).toEqual(['ROOM_BLOCKED']);
  });

  it('maps the overlap reason to OVERLAP', () => {
    expect(mapReasonsToCodes(['Overlaps existing booking "CS 101 Lecture" (600\u2013660).'])).toEqual(['OVERLAP']);
  });

  it('maps an unmatched reason string to UNKNOWN', () => {
    expect(mapReasonsToCodes(['Something entirely unexpected.'])).toEqual(['UNKNOWN']);
  });

  it('deduplicates repeated codes', () => {
    expect(
      mapReasonsToCodes([
        'Start time must be 0 or greater.',
        'Start time must be earlier than end time.',
      ])
    ).toEqual(['INVALID_INTERVAL']);
  });
});

describe('validateInput', () => {
  it('accepts a valid available input', () => {
    expect(validateInput(validInput)).toBe(true);
  });

  it('rejects an empty room label', () => {
    expect(validateInput({ ...validInput, roomLabel: '   ' })).toBe(false);
  });

  it('rejects a room label over 80 characters', () => {
    expect(validateInput({ ...validInput, roomLabel: 'R'.repeat(81) })).toBe(false);
  });

  it('rejects NaN start', () => {
    expect(validateInput({ ...validInput, start: NaN })).toBe(false);
  });

  it('rejects float times', () => {
    expect(validateInput({ ...validInput, start: 600.5 })).toBe(false);
  });

  it('rejects huge values outside -100000..100000', () => {
    expect(validateInput({ ...validInput, end: 200000 })).toBe(false);
  });

  it('rejects an available input with a strict-range violation', () => {
    expect(validateInput({ ...validInput, start: 1500, end: 1600 })).toBe(false);
  });

  it('accepts an unavailable input with INVALID_INTERVAL and out-of-order times', () => {
    const input: ExplainInput = {
      roomLabel: 'Room A',
      start: 800,
      end: 700,
      isAvailable: false,
      reasonCodes: ['INVALID_INTERVAL'],
    };
    expect(validateInput(input)).toBe(true);
  });

  it('accepts an unavailable input with INVALID_INTERVAL and out-of-range end', () => {
    const input: ExplainInput = {
      roomLabel: 'Room A',
      start: 700,
      end: 1500,
      isAvailable: false,
      reasonCodes: ['INVALID_INTERVAL'],
    };
    expect(validateInput(input)).toBe(true);
  });

  it('rejects unknown reason codes', () => {
    const input = { ...unavailableInput, reasonCodes: ['NOT_A_CODE' as ReasonCode] };
    expect(validateInput(input)).toBe(false);
  });

  it('rejects UNKNOWN when isAvailable is true', () => {
    const input: ExplainInput = {
      ...validInput,
      isAvailable: false,
      reasonCodes: ['UNKNOWN'],
    };
    expect(validateInput({ ...input, isAvailable: true })).toBe(false);
  });

  it('rejects isAvailable=true with non-empty reasonCodes', () => {
    expect(validateInput({ ...validInput, reasonCodes: ['OVERLAP'] })).toBe(false);
  });

  it('rejects isAvailable=false with empty reasonCodes', () => {
    expect(validateInput({ ...unavailableInput, reasonCodes: [] })).toBe(false);
  });
});

describe('validateExplanation', () => {
  it('accepts a short agreeing explanation for an available room', () => {
    expect(validateExplanation('The room is free at 11:40 AM.', true)).toBe(true);
  });

  it('accepts a short agreeing explanation for an unavailable room', () => {
    expect(validateExplanation('The room cannot be booked at 11:40 AM.', false)).toBe(true);
  });

  it('rejects an empty explanation', () => {
    expect(validateExplanation('', true)).toBe(false);
  });

  it('rejects an explanation over 250 characters', () => {
    expect(validateExplanation('x'.repeat(251), true)).toBe(false);
  });

  it('rejects more than 2 sentences', () => {
    expect(validateExplanation('One. Two. Three.', true)).toBe(false);
  });

  it('rejects markdown', () => {
    expect(validateExplanation('The room is *free*.', true)).toBe(false);
  });

  it('rejects HTML', () => {
    expect(validateExplanation('The room is <b>free</b>.', true)).toBe(false);
  });

  it('rejects URLs', () => {
    expect(validateExplanation('See https://example.com for details.', true)).toBe(false);
  });

  it('rejects contradictions for an available room', () => {
    expect(validateExplanation('The room cannot be booked.', true)).toBe(false);
    expect(validateExplanation('The room is not available.', true)).toBe(false);
    expect(validateExplanation('The room is unavailable.', true)).toBe(false);
    expect(validateExplanation('The room is blocked.', true)).toBe(false);
    expect(validateExplanation('It overlaps another booking.', true)).toBe(false);
  });

  it('rejects contradictions for an unavailable room', () => {
    expect(validateExplanation('The room can be booked.', false)).toBe(false);
    expect(validateExplanation('The room is available.', false)).toBe(false);
  });
});

describe('buildFallback', () => {
  it('returns an agreeing fallback for an available room with formatMinutes output', () => {
    const text = buildFallback({ ...validInput, start: 700, end: 720 });
    expect(text).toBe('Room Room A can be booked from 11:40 AM to 12:00 PM.');
    expect(validateExplanation(text, true)).toBe(true);
  });

  it('never throws and returns a valid explanation for every reason code', () => {
    for (const code of ALL_CODES) {
      const text = buildFallback({ ...unavailableInput, reasonCodes: [code] });
      expect(validateExplanation(text, false)).toBe(true);
    }
  });

  it('produces a valid explanation for an available input', () => {
    const text = buildFallback(validInput);
    expect(validateExplanation(text, true)).toBe(true);
  });

  it('does not print times for INVALID_INTERVAL', () => {
    const text = buildFallback({
      roomLabel: 'Room A',
      start: 800,
      end: 700,
      isAvailable: false,
      reasonCodes: ['INVALID_INTERVAL'],
    });
    expect(text).not.toContain('AM');
    expect(text).not.toContain('PM');
    expect(validateExplanation(text, false)).toBe(true);
  });

  it('returns the generic text for an empty room label', () => {
    expect(buildFallback({ ...validInput, roomLabel: '' })).toBe(
      'Explanation unavailable for this request.'
    );
  });

  it('returns the generic text for non-integer times', () => {
    expect(buildFallback({ ...validInput, start: 600.5 })).toBe(
      'Explanation unavailable for this request.'
    );
  });

  it('uses the neutral text for UNKNOWN', () => {
    expect(buildFallback({ ...unavailableInput, reasonCodes: ['UNKNOWN'] })).toBe(
      'This time cannot be booked.'
    );
  });
});

describe('explainAvailability', () => {
  it('returns the adapter explanation for valid input', async () => {
    const result = await explainAvailability(validInput, mockAdapter);
    expect(result.usedFallback).toBe(false);
    expect(result.explanation).toBe('Room A is free for the requested time.');
  });

  it('never exposes booking labels in the mock output or the OVERLAP fallback', async () => {
    const labels = SAMPLE_ROOMS.flatMap((room) => room.bookings.map((booking) => booking.label));
    expect(labels.length).toBeGreaterThan(0);

    const adapterResult = await explainAvailability(
      { ...unavailableInput, reasonCodes: ['OVERLAP'] },
      mockAdapter
    );
    const fallback = buildFallback({ ...unavailableInput, reasonCodes: ['OVERLAP'] });

    for (const label of labels) {
      expect(adapterResult.explanation).not.toContain(label);
      expect(fallback).not.toContain(label);
    }
  });

  it('rejects malformed input before calling the adapter', async () => {
    const adapter = vi.fn(mockAdapter);
    await explainAvailability({ ...validInput, roomLabel: '' }, adapter);
    expect(adapter).not.toHaveBeenCalled();
  });

  it('rejects an over-long room label before calling the adapter', async () => {
    const adapter = vi.fn(mockAdapter);
    await explainAvailability({ ...validInput, roomLabel: 'R'.repeat(81) }, adapter);
    expect(adapter).not.toHaveBeenCalled();
  });

  it('accepts INVALID_INTERVAL with out-of-order times and calls the adapter', async () => {
    const adapter = vi.fn(mockAdapter);
    const result = await explainAvailability(
      {
        roomLabel: 'Room A',
        start: 800,
        end: 700,
        isAvailable: false,
        reasonCodes: ['INVALID_INTERVAL'],
      },
      adapter
    );
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(result.usedFallback).toBe(false);
  });

  it('rejects NaN start before calling the adapter', async () => {
    const adapter = vi.fn(mockAdapter);
    await explainAvailability({ ...validInput, start: NaN }, adapter);
    expect(adapter).not.toHaveBeenCalled();
  });

  it('rejects isAvailable=false with empty reasonCodes', async () => {
    const adapter = vi.fn(mockAdapter);
    await explainAvailability({ ...unavailableInput, reasonCodes: [] }, adapter);
    expect(adapter).not.toHaveBeenCalled();
  });

  it('falls back when the adapter hangs past the timeout', async () => {
    const hangingAdapter: ExplainAdapter = () => new Promise(() => undefined);
    const result = await explainAvailability(validInput, hangingAdapter, 20);
    expect(result.usedFallback).toBe(true);
    expect(validateExplanation(result.explanation, true)).toBe(true);
  });

  it('falls back when the adapter throws', async () => {
    const failingAdapter: ExplainAdapter = () => Promise.reject(new Error('network down'));
    const result = await explainAvailability(validInput, failingAdapter);
    expect(result.usedFallback).toBe(true);
    expect(validateExplanation(result.explanation, true)).toBe(true);
  });

  it('falls back on an over-long adapter explanation', async () => {
    const adapter: ExplainAdapter = () =>
      Promise.resolve({ explanation: 'x'.repeat(251) });
    const result = await explainAvailability(validInput, adapter);
    expect(result.usedFallback).toBe(true);
  });

  it('falls back on a contradicting adapter explanation', async () => {
    const adapter: ExplainAdapter = () =>
      Promise.resolve({ explanation: 'The room is blocked.' });
    const result = await explainAvailability(validInput, adapter);
    expect(result.usedFallback).toBe(true);
  });

  it('falls back on an adapter explanation with markdown', async () => {
    const adapter: ExplainAdapter = () =>
      Promise.resolve({ explanation: 'The room is *free*.' });
    const result = await explainAvailability(validInput, adapter);
    expect(result.usedFallback).toBe(true);
  });

  it('falls back on an adapter explanation with more than 2 sentences', async () => {
    const adapter: ExplainAdapter = () =>
      Promise.resolve({ explanation: 'One. Two. Three.' });
    const result = await explainAvailability(validInput, adapter);
    expect(result.usedFallback).toBe(true);
  });
});
