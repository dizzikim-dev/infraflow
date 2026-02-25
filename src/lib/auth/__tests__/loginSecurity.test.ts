import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
  isAccountLocked,
  shouldLockAccount,
  getLockoutExpiry,
  getRemainingLockoutMinutes,
} from '../loginSecurity';

describe('loginSecurity', () => {
  // ============================================================
  // Constants
  // ============================================================

  describe('constants', () => {
    it('MAX_FAILED_ATTEMPTS should be 5', () => {
      expect(MAX_FAILED_ATTEMPTS).toBe(5);
    });

    it('LOCKOUT_DURATION_MINUTES should be 15', () => {
      expect(LOCKOUT_DURATION_MINUTES).toBe(15);
    });
  });

  // ============================================================
  // isAccountLocked
  // ============================================================

  describe('isAccountLocked', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return false when lockedUntil is null', () => {
      expect(isAccountLocked(null)).toBe(false);
    });

    it('should return true when lockedUntil is in the future', () => {
      const futureDate = new Date('2026-02-25T12:15:00Z');
      expect(isAccountLocked(futureDate)).toBe(true);
    });

    it('should return false when lockedUntil is in the past', () => {
      const pastDate = new Date('2026-02-25T11:00:00Z');
      expect(isAccountLocked(pastDate)).toBe(false);
    });

    it('should return false when lockedUntil equals current time exactly', () => {
      // lockedUntil.getTime() > Date.now() is false when equal
      const exactNow = new Date('2026-02-25T12:00:00Z');
      expect(isAccountLocked(exactNow)).toBe(false);
    });

    it('should return true when lockedUntil is 1ms in the future', () => {
      const oneMillisecondFuture = new Date('2026-02-25T12:00:00.001Z');
      expect(isAccountLocked(oneMillisecondFuture)).toBe(true);
    });

    it('should return false when lockedUntil is 1ms in the past', () => {
      const oneMillisecondPast = new Date('2026-02-25T11:59:59.999Z');
      expect(isAccountLocked(oneMillisecondPast)).toBe(false);
    });

    it('should return false after lockout period expires (time advances)', () => {
      const lockedUntil = new Date('2026-02-25T12:15:00Z');

      // Initially locked
      expect(isAccountLocked(lockedUntil)).toBe(true);

      // Advance time past the lockout
      vi.setSystemTime(new Date('2026-02-25T12:16:00Z'));
      expect(isAccountLocked(lockedUntil)).toBe(false);
    });

    it('should handle very far future dates', () => {
      const farFuture = new Date('2099-12-31T23:59:59Z');
      expect(isAccountLocked(farFuture)).toBe(true);
    });

    it('should handle very old past dates', () => {
      const ancientPast = new Date('2000-01-01T00:00:00Z');
      expect(isAccountLocked(ancientPast)).toBe(false);
    });

    it('should handle epoch date (1970-01-01)', () => {
      const epoch = new Date(0);
      expect(isAccountLocked(epoch)).toBe(false);
    });
  });

  // ============================================================
  // shouldLockAccount
  // ============================================================

  describe('shouldLockAccount', () => {
    it('should return false when failedAttempts is 0', () => {
      expect(shouldLockAccount(0)).toBe(false);
    });

    it('should return false when failedAttempts is 1', () => {
      expect(shouldLockAccount(1)).toBe(false);
    });

    it('should return false when failedAttempts is MAX_FAILED_ATTEMPTS - 1', () => {
      expect(shouldLockAccount(MAX_FAILED_ATTEMPTS - 1)).toBe(false);
    });

    it('should return true when failedAttempts equals MAX_FAILED_ATTEMPTS', () => {
      expect(shouldLockAccount(MAX_FAILED_ATTEMPTS)).toBe(true);
    });

    it('should return true when failedAttempts exceeds MAX_FAILED_ATTEMPTS', () => {
      expect(shouldLockAccount(MAX_FAILED_ATTEMPTS + 1)).toBe(true);
    });

    it('should return true for very large numbers', () => {
      expect(shouldLockAccount(1_000_000)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(shouldLockAccount(-1)).toBe(false);
      expect(shouldLockAccount(-100)).toBe(false);
    });

    it('should handle Number.MAX_SAFE_INTEGER', () => {
      expect(shouldLockAccount(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it('should return false for NaN (NaN >= 5 is false)', () => {
      expect(shouldLockAccount(NaN)).toBe(false);
    });

    it('should correctly handle fractional values just below threshold', () => {
      // 4.9 < 5 so should be false
      expect(shouldLockAccount(4.9)).toBe(false);
    });

    it('should correctly handle fractional values at threshold', () => {
      // 5.0 >= 5 so should be true
      expect(shouldLockAccount(5.0)).toBe(true);
    });

    it('should lock on each incremental attempt from 1 to MAX+1', () => {
      const results: boolean[] = [];
      for (let i = 0; i <= MAX_FAILED_ATTEMPTS + 1; i++) {
        results.push(shouldLockAccount(i));
      }
      // First MAX_FAILED_ATTEMPTS entries (0..4) are false
      expect(results.slice(0, MAX_FAILED_ATTEMPTS)).toEqual(
        Array(MAX_FAILED_ATTEMPTS).fill(false)
      );
      // Entries at and after MAX_FAILED_ATTEMPTS are true
      expect(results.slice(MAX_FAILED_ATTEMPTS)).toEqual([true, true]);
    });
  });

  // ============================================================
  // getLockoutExpiry
  // ============================================================

  describe('getLockoutExpiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a date LOCKOUT_DURATION_MINUTES in the future', () => {
      const now = new Date('2026-02-25T12:00:00Z');
      vi.setSystemTime(now);

      const expiry = getLockoutExpiry();

      const expectedMs = now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000;
      expect(expiry.getTime()).toBe(expectedMs);
    });

    it('should return exactly 15 minutes from now', () => {
      const now = new Date('2026-02-25T12:00:00Z');
      vi.setSystemTime(now);

      const expiry = getLockoutExpiry();

      expect(expiry).toEqual(new Date('2026-02-25T12:15:00Z'));
    });

    it('should return a Date object', () => {
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
      const expiry = getLockoutExpiry();
      expect(expiry).toBeInstanceOf(Date);
    });

    it('should return an always-locked date from the perspective of current time', () => {
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
      const expiry = getLockoutExpiry();
      // The returned date is in the future, so isAccountLocked should be true
      expect(isAccountLocked(expiry)).toBe(true);
    });

    it('should return different values when called at different times', () => {
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
      const expiry1 = getLockoutExpiry();

      vi.setSystemTime(new Date('2026-02-25T13:00:00Z'));
      const expiry2 = getLockoutExpiry();

      expect(expiry2.getTime()).toBeGreaterThan(expiry1.getTime());
      expect(expiry2.getTime() - expiry1.getTime()).toBe(60 * 60 * 1000); // 1 hour difference
    });

    it('should handle midnight boundary correctly', () => {
      vi.setSystemTime(new Date('2026-02-25T23:50:00Z'));
      const expiry = getLockoutExpiry();
      // 23:50 + 15 min = 00:05 next day
      expect(expiry).toEqual(new Date('2026-02-26T00:05:00Z'));
    });
  });

  // ============================================================
  // getRemainingLockoutMinutes
  // ============================================================

  describe('getRemainingLockoutMinutes', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return 0 when lockout has expired (lockedUntil is in the past)', () => {
      const pastDate = new Date('2026-02-25T11:00:00Z');
      expect(getRemainingLockoutMinutes(pastDate)).toBe(0);
    });

    it('should return 0 when lockedUntil equals current time exactly', () => {
      const exactNow = new Date('2026-02-25T12:00:00Z');
      expect(getRemainingLockoutMinutes(exactNow)).toBe(0);
    });

    it('should return LOCKOUT_DURATION_MINUTES when just locked', () => {
      const lockedUntil = new Date('2026-02-25T12:15:00Z');
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(15);
    });

    it('should return 1 when less than 1 minute remains (rounds up)', () => {
      // 30 seconds remaining -> ceil(0.5) = 1
      const lockedUntil = new Date('2026-02-25T12:00:30Z');
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(1);
    });

    it('should return 1 for exactly 1 second remaining', () => {
      const lockedUntil = new Date('2026-02-25T12:00:01Z');
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(1);
    });

    it('should return 1 for exactly 1 millisecond remaining', () => {
      const lockedUntil = new Date('2026-02-25T12:00:00.001Z');
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(1);
    });

    it('should return exact minutes for whole minute boundaries', () => {
      const lockedUntil5min = new Date('2026-02-25T12:05:00Z');
      expect(getRemainingLockoutMinutes(lockedUntil5min)).toBe(5);

      const lockedUntil10min = new Date('2026-02-25T12:10:00Z');
      expect(getRemainingLockoutMinutes(lockedUntil10min)).toBe(10);
    });

    it('should ceil fractional minutes (7 min 30 sec -> 8)', () => {
      const lockedUntil = new Date('2026-02-25T12:07:30Z');
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(8);
    });

    it('should handle very large remaining time', () => {
      const farFuture = new Date('2027-02-25T12:00:00Z');
      const expectedMinutes = Math.ceil(
        (farFuture.getTime() - new Date('2026-02-25T12:00:00Z').getTime()) /
          (60 * 1000)
      );
      expect(getRemainingLockoutMinutes(farFuture)).toBe(expectedMinutes);
    });

    it('should decrease as time passes', () => {
      const lockedUntil = new Date('2026-02-25T12:15:00Z');

      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(15);

      vi.setSystemTime(new Date('2026-02-25T12:05:00Z'));
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(10);

      vi.setSystemTime(new Date('2026-02-25T12:14:00Z'));
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(1);

      vi.setSystemTime(new Date('2026-02-25T12:15:00Z'));
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(0);

      vi.setSystemTime(new Date('2026-02-25T12:16:00Z'));
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(0);
    });

    it('should return 0 for epoch date', () => {
      const epoch = new Date(0);
      expect(getRemainingLockoutMinutes(epoch)).toBe(0);
    });
  });

  // ============================================================
  // Integration: Full lockout flow with pure functions
  // ============================================================

  describe('integration: lockout flow', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should simulate a complete lockout lifecycle', () => {
      // Simulate consecutive failed attempts
      let failedAttempts = 0;

      // First 4 attempts: not locked yet
      for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) {
        failedAttempts++;
        expect(shouldLockAccount(failedAttempts)).toBe(false);
      }

      // 5th attempt: lock threshold reached
      failedAttempts++;
      expect(shouldLockAccount(failedAttempts)).toBe(true);

      // Generate lockout expiry
      const lockedUntil = getLockoutExpiry();
      expect(isAccountLocked(lockedUntil)).toBe(true);

      // Check remaining minutes
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(LOCKOUT_DURATION_MINUTES);

      // Advance 10 minutes
      vi.setSystemTime(new Date('2026-02-25T12:10:00Z'));
      expect(isAccountLocked(lockedUntil)).toBe(true);
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(5);

      // Advance past lockout
      vi.setSystemTime(new Date('2026-02-25T12:15:01Z'));
      expect(isAccountLocked(lockedUntil)).toBe(false);
      expect(getRemainingLockoutMinutes(lockedUntil)).toBe(0);
    });

    it('should not lock before threshold is reached', () => {
      for (let i = 1; i < MAX_FAILED_ATTEMPTS; i++) {
        expect(shouldLockAccount(i)).toBe(false);
      }
    });

    it('should handle concurrent checks after lockout correctly', () => {
      // Simulate: account locked, multiple concurrent isAccountLocked checks
      const lockedUntil = getLockoutExpiry();

      // All concurrent checks at the same moment should return true
      const results = Array.from({ length: 10 }, () =>
        isAccountLocked(lockedUntil)
      );
      expect(results).toEqual(Array(10).fill(true));
    });

    it('should handle repeated lockouts (lock -> expire -> lock again)', () => {
      // First lockout
      const lockout1 = getLockoutExpiry();
      expect(isAccountLocked(lockout1)).toBe(true);

      // Expire
      vi.setSystemTime(new Date('2026-02-25T12:16:00Z'));
      expect(isAccountLocked(lockout1)).toBe(false);

      // Second lockout (new attempts after expiry)
      const lockout2 = getLockoutExpiry();
      expect(isAccountLocked(lockout2)).toBe(true);
      expect(lockout2.getTime()).toBeGreaterThan(lockout1.getTime());

      // Second lockout should expire 15 min after it was created
      vi.setSystemTime(new Date('2026-02-25T12:31:01Z'));
      expect(isAccountLocked(lockout2)).toBe(false);
    });
  });
});
