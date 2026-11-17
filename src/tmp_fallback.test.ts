import { describe, it, expect } from 'vitest';
import { buildFallback } from './lib/llm/explain';

describe('tmp finding 4', () => {
  it('fallback for available with start -5', () => {
    const t = buildFallback({ roomLabel: 'Room A', start: -5, end: 700, isAvailable: true, reasonCodes: [] });
    console.log('FALLBACK:', t);
    expect(typeof t).toBe('string');
  });
});