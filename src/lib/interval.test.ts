import { describe, it, expect } from 'vitest';
import { isValidInterval } from './interval';

describe('isValidInterval', () => {
  it('accepts a normal interval inside the day', () => {
    expect(isValidInterval(700, 750)).toBe(true);
  });

  it('rejects an empty interval where start equals end', () => {
    expect(isValidInterval(700, 700)).toBe(false);
  });

  it('rejects an interval where start is after end', () => {
    expect(isValidInterval(750, 700)).toBe(false);
  });

  it('rejects a negative start', () => {
    expect(isValidInterval(-1, 60)).toBe(false);
  });

  it('accepts the full day from 0 to the day end', () => {
    expect(isValidInterval(0, 1440)).toBe(true);
  });

  it('rejects an end beyond the day end', () => {
    expect(isValidInterval(0, 1441)).toBe(false);
  });

  it('rejects a NaN start', () => {
    expect(isValidInterval(NaN, 60)).toBe(false);
  });
});
