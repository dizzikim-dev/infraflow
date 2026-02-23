/**
 * Tests for loginSecurity.ts — pure account lockout logic
 *
 * All functions are side-effect-free; no mocking needed.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isAccountLocked,
  shouldLockAccount,
  getLockoutExpiry,
  getRemainingLockoutMinutes,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
} from '@/lib/auth/loginSecurity';

describe('loginSecurity', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Constants ───────────────────────────────────────────────────────
  describe('constants', () => {
    it('MAX_FAILED_ATTEMPTS should be 5', () => {
      expect(MAX_FAILED_ATTEMPTS).toBe(5);
    });

    it('LOCKOUT_DURATION_MINUTES should be 15', () => {
      expect(LOCKOUT_DURATION_MINUTES).toBe(15);
    });
  });

  // ── isAccountLocked ─────────────────────────────────────────────────
  describe('isAccountLocked', () => {
    it('should return false when lockedUntil is null', () => {
      expect(isAccountLocked(null)).toBe(false);
    });

    it('should return false when lockedUntil is in the past', () => {
      const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
      expect(isAccountLocked(pastDate)).toBe(false);
    });

    it('should return true when lockedUntil is in the future', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      expect(isAccountLocked(futureDate)).toBe(true);
    });

    it('should return false when lockedUntil is exactly now', () => {
      vi.useFakeTimers();
      const now = new Date();
      // lockedUntil === Date.now() means not in the future
      expect(isAccountLocked(now)).toBe(false);
    });
  });

  // ── shouldLockAccount ───────────────────────────────────────────────
  describe('shouldLockAccount', () => {
    it('should return false for 0 attempts', () => {
      expect(shouldLockAccount(0)).toBe(false);
    });

    it('should return false for 1 attempt', () => {
      expect(shouldLockAccount(1)).toBe(false);
    });

    it('should return false for 4 attempts', () => {
      expect(shouldLockAccount(4)).toBe(false);
    });

    it('should return true for 5 attempts (threshold)', () => {
      expect(shouldLockAccount(5)).toBe(true);
    });

    it('should return true for 6+ attempts', () => {
      expect(shouldLockAccount(6)).toBe(true);
      expect(shouldLockAccount(100)).toBe(true);
    });
  });

  // ── getLockoutExpiry ────────────────────────────────────────────────
  describe('getLockoutExpiry', () => {
    it('should return a date approximately 15 minutes in the future', () => {
      const before = Date.now();
      const expiry = getLockoutExpiry();
      const after = Date.now();

      const expectedMin = before + LOCKOUT_DURATION_MINUTES * 60 * 1000;
      const expectedMax = after + LOCKOUT_DURATION_MINUTES * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it('should return a Date instance', () => {
      expect(getLockoutExpiry()).toBeInstanceOf(Date);
    });
  });

  // ── getRemainingLockoutMinutes ──────────────────────────────────────
  describe('getRemainingLockoutMinutes', () => {
    it('should return correct minutes remaining', () => {
      const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
      const remaining = getRemainingLockoutMinutes(tenMinutesFromNow);
      expect(remaining).toBe(10);
    });

    it('should return 0 when lockout has expired', () => {
      const pastDate = new Date(Date.now() - 5 * 60 * 1000);
      expect(getRemainingLockoutMinutes(pastDate)).toBe(0);
    });

    it('should round up partial minutes', () => {
      // 10 minutes and 30 seconds from now → should be 11 minutes
      const partialMinute = new Date(Date.now() + 10.5 * 60 * 1000);
      expect(getRemainingLockoutMinutes(partialMinute)).toBe(11);
    });

    it('should return 15 for full lockout duration', () => {
      const fullLockout = new Date(Date.now() + 15 * 60 * 1000);
      expect(getRemainingLockoutMinutes(fullLockout)).toBe(15);
    });

    it('should return 1 for less than 1 minute remaining', () => {
      const almostExpired = new Date(Date.now() + 30 * 1000); // 30 seconds
      expect(getRemainingLockoutMinutes(almostExpired)).toBe(1);
    });
  });
});
