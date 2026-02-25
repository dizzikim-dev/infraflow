import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock NextResponse before importing module under test
// ---------------------------------------------------------------------------

const mockHeaders = new Map<string, string>();

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const headers = new Map<string, string>();
      return {
        body,
        status: init?.status ?? 200,
        headers: {
          set: (key: string, value: string) => headers.set(key, value),
          get: (key: string) => headers.get(key),
          has: (key: string) => headers.has(key),
        },
      };
    },
  },
}));

import { addRateLimitHeaders } from '../rateLimitHeaders';
import { NextResponse } from 'next/server';
import type { RateLimitInfo } from '@/lib/middleware/rateLimiter';

describe('rateLimitHeaders — addRateLimitHeaders', () => {
  function createMockResponse() {
    const headers = new Map<string, string>();
    return {
      headers: {
        set: (key: string, value: string) => headers.set(key, value),
        get: (key: string) => headers.get(key),
        has: (key: string) => headers.has(key),
      },
      _headers: headers,
    } as unknown as NextResponse<unknown> & { _headers: Map<string, string> };
  }

  it('sets X-RateLimit-Limit header', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 5,
      limit: 60,
      remaining: 55,
      resetIn: 30000,
    };

    addRateLimitHeaders(response, info);

    expect(response._headers.get('X-RateLimit-Limit')).toBe('60');
  });

  it('sets X-RateLimit-Remaining header', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 10,
      limit: 60,
      remaining: 50,
      resetIn: 25000,
    };

    addRateLimitHeaders(response, info);

    expect(response._headers.get('X-RateLimit-Remaining')).toBe('50');
  });

  it('sets X-RateLimit-Reset header as unix timestamp', () => {
    const response = createMockResponse();
    const now = Date.now();
    const resetIn = 60000; // 60 seconds
    const info: RateLimitInfo = {
      current: 1,
      limit: 100,
      remaining: 99,
      resetIn,
    };

    addRateLimitHeaders(response, info);

    const resetValue = parseInt(response._headers.get('X-RateLimit-Reset')!, 10);
    // Reset should be roughly (now + resetIn) / 1000, ceiling-ed
    const expected = Math.ceil((now + resetIn) / 1000);
    // Allow 1-second tolerance for test execution time
    expect(resetValue).toBeGreaterThanOrEqual(expected - 1);
    expect(resetValue).toBeLessThanOrEqual(expected + 1);
  });

  it('sets daily limit headers when dailyLimit is present', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 5,
      limit: 60,
      remaining: 55,
      resetIn: 30000,
      dailyLimit: 1000,
      dailyUsage: 150,
    };

    addRateLimitHeaders(response, info);

    expect(response._headers.get('X-RateLimit-Daily-Limit')).toBe('1000');
    expect(response._headers.get('X-RateLimit-Daily-Remaining')).toBe('850');
  });

  it('does not set daily headers when dailyLimit is absent', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 5,
      limit: 60,
      remaining: 55,
      resetIn: 30000,
    };

    addRateLimitHeaders(response, info);

    expect(response._headers.has('X-RateLimit-Daily-Limit')).toBe(false);
    expect(response._headers.has('X-RateLimit-Daily-Remaining')).toBe(false);
  });

  it('calculates daily remaining as 0 when usage exceeds limit', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 5,
      limit: 60,
      remaining: 55,
      resetIn: 30000,
      dailyLimit: 100,
      dailyUsage: 120, // exceeds limit
    };

    addRateLimitHeaders(response, info);

    // Math.max(0, 100 - 120) = 0
    expect(response._headers.get('X-RateLimit-Daily-Remaining')).toBe('0');
  });

  it('handles dailyLimit with undefined dailyUsage (defaults to 0)', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 1,
      limit: 60,
      remaining: 59,
      resetIn: 30000,
      dailyLimit: 500,
      // dailyUsage is undefined
    };

    addRateLimitHeaders(response, info);

    // Math.max(0, 500 - (undefined || 0)) = 500
    expect(response._headers.get('X-RateLimit-Daily-Remaining')).toBe('500');
  });

  it('returns the same response object (pass-through)', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 1,
      limit: 10,
      remaining: 9,
      resetIn: 5000,
    };

    const returned = addRateLimitHeaders(response, info);

    expect(returned).toBe(response);
  });

  it('sets all basic headers at once', () => {
    const response = createMockResponse();
    const info: RateLimitInfo = {
      current: 3,
      limit: 30,
      remaining: 27,
      resetIn: 45000,
    };

    addRateLimitHeaders(response, info);

    expect(response._headers.has('X-RateLimit-Limit')).toBe(true);
    expect(response._headers.has('X-RateLimit-Remaining')).toBe(true);
    expect(response._headers.has('X-RateLimit-Reset')).toBe(true);
  });
});
