import { DAY_END_MINUTES } from './rules';

export function isValidInterval(start: number, end: number): boolean {
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return 0 <= start && start < end && end <= DAY_END_MINUTES;
}
