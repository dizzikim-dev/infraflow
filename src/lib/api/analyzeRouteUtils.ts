/**
 * Analyze Route Utilities
 *
 * Shared security checks (CSRF + rate limiting) for /api/analyze/* routes.
 * Extracts the common pre-request validation pattern used in /api/parse
 * and /api/modify into a reusable helper.
 *
 * @module lib/api/analyzeRouteUtils
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/middleware/rateLimiter';
import type { RateLimitConfig } from '@/lib/middleware/rateLimiter';

/**
 * Rate limit configuration for analyze endpoints.
 * More permissive than LLM routes since these are local computations.
 */
export const ANALYZE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: parseInt(process.env.ANALYZE_RATE_LIMIT_MAX || '30', 10),
  windowMs: parseInt(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS || '60000', 10),
  dailyLimit: parseInt(process.env.ANALYZE_RATE_LIMIT_DAILY || '500', 10),
};

export interface AnalyzeRouteCheckResult {
  /** Whether the request passed all checks */
  passed: boolean;
  /** Error response to return if checks failed */
  errorResponse?: NextResponse;
}

/**
 * Perform CSRF and rate-limit checks for analyze API routes.
 *
 * Usage:
 * ```ts
 * const check = validateAnalyzeRequest(request);
 * if (!check.passed) return check.errorResponse!;
 * // ... proceed with route logic
 * ```
 */
export function validateAnalyzeRequest(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig = ANALYZE_RATE_LIMIT
): AnalyzeRouteCheckResult {
  // CSRF protection — check Origin header (matches /api/parse pattern)
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.includes(host)) {
    return {
      passed: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden: origin mismatch' },
        { status: 403 }
      ),
    };
  }

  // Rate limiting
  const { allowed, response: rateLimitResponse } = checkRateLimit(
    request,
    rateLimitConfig
  );

  if (!allowed && rateLimitResponse) {
    return {
      passed: false,
      errorResponse: rateLimitResponse,
    };
  }

  return { passed: true };
}
