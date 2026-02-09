/**
 * Rate limit header utilities for LLM API responses.
 *
 * Shared by all API routes that use rate limiting.
 *
 * @module lib/llm/rateLimitHeaders
 */

import { NextResponse } from 'next/server';
import type { RateLimitInfo } from '@/lib/middleware/rateLimiter';

/**
 * Adds rate limit headers to the response.
 *
 * Sets standard X-RateLimit-* headers to inform clients about
 * their current rate limit status.
 *
 * @param response - The response to add headers to
 * @param info - Rate limit information
 * @returns The response with rate limit headers added
 */
export function addRateLimitHeaders<T>(
  response: NextResponse<T>,
  info: RateLimitInfo
): NextResponse<T> {
  response.headers.set('X-RateLimit-Limit', info.limit.toString());
  response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    Math.ceil((Date.now() + info.resetIn) / 1000).toString()
  );

  if (info.dailyLimit) {
    response.headers.set('X-RateLimit-Daily-Limit', info.dailyLimit.toString());
    response.headers.set(
      'X-RateLimit-Daily-Remaining',
      Math.max(0, info.dailyLimit - (info.dailyUsage || 0)).toString()
    );
  }

  return response;
}
