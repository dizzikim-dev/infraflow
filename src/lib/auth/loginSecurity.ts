/**
 * Login Security — Account Lockout Logic
 *
 * Pure functions for account lockout after repeated failed login attempts.
 * No side effects, no DB access — fully testable in isolation.
 */

/** Maximum number of consecutive failed login attempts before lockout */
export const MAX_FAILED_ATTEMPTS = 5;

/** Duration in minutes for which an account stays locked */
export const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Check if an account is currently locked.
 * Returns true if lockedUntil is a future date.
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > Date.now();
}

/**
 * Determine if an account should be locked based on failed attempt count.
 * Returns true if failedAttempts >= MAX_FAILED_ATTEMPTS.
 */
export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= MAX_FAILED_ATTEMPTS;
}

/**
 * Calculate the lockout expiry timestamp.
 * Returns current time + LOCKOUT_DURATION_MINUTES.
 */
export function getLockoutExpiry(): Date {
  return new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
}

/**
 * Calculate remaining lockout minutes from a lockedUntil date.
 * Returns 0 if the lockout has already expired.
 */
export function getRemainingLockoutMinutes(lockedUntil: Date): number {
  const remaining = lockedUntil.getTime() - Date.now();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (60 * 1000));
}
