import { addYearsIso, toIsoDate, todayIso } from './date.utils';

describe('date.utils', () => {
  describe('toIsoDate', () => {
    it('should format a local date as YYYY-MM-DD with padding', () => {
      expect(toIsoDate(new Date(2025, 0, 5))).toBe('2025-01-05');
      expect(toIsoDate(new Date(2025, 11, 31))).toBe('2025-12-31');
    });
  });

  describe('todayIso', () => {
    afterEach(() => jest.useRealTimers());

    it('should return the current local date', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 9, 11, 23, 59));
      expect(todayIso()).toBe('2026-10-11');
    });
  });

  describe('addYearsIso', () => {
    it.each([
      ['2025-02-01', 1, '2026-02-01'],
      ['2025-12-31', 1, '2026-12-31'],
      ['2024-02-29', 1, '2025-02-28'],
      ['2024-02-29', 4, '2028-02-29'],
    ])('%s + %i year(s) → %s', (iso, years, expected) => {
      expect(addYearsIso(iso, years)).toBe(expected);
    });
  });
});
