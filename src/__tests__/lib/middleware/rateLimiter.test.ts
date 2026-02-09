import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  clearAllRateLimits,
  clearRateLimit,
  getRateLimitInfo,
  getRateLimitStats,
  DEFAULT_RATE_LIMIT,
  LLM_RATE_LIMIT,
  type RateLimitConfig,
} from '@/lib/middleware/rateLimiter';

function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    headers: {
      'x-forwarded-for': ip,
    },
  });
}

describe('rateLimiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 60000,
      };

      const { allowed, info } = checkRateLimit(req, config);
      expect(allowed).toBe(true);
      expect(info.current).toBe(1);
      expect(info.remaining).toBe(4);
      expect(info.limit).toBe(5);
    });

    it('should track request count correctly', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 3,
        windowMs: 60000,
      };

      checkRateLimit(req, config);
      checkRateLimit(req, config);
      const { allowed, info } = checkRateLimit(req, config);

      expect(allowed).toBe(true);
      expect(info.current).toBe(3);
      expect(info.remaining).toBe(0);
    });

    it('should block requests exceeding the limit', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 60000,
      };

      checkRateLimit(req, config);
      checkRateLimit(req, config);
      const { allowed, response } = checkRateLimit(req, config);

      expect(allowed).toBe(false);
      expect(response).toBeDefined();
    });

    it('should use different keys for different IPs', () => {
      const req1 = createMockRequest('1.1.1.1');
      const req2 = createMockRequest('2.2.2.2');
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
      };

      const { allowed: a1 } = checkRateLimit(req1, config);
      const { allowed: a2 } = checkRateLimit(req2, config);

      expect(a1).toBe(true);
      expect(a2).toBe(true);
    });

    it('should support daily limits', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        dailyLimit: 3,
      };

      checkRateLimit(req, config);
      checkRateLimit(req, config);
      checkRateLimit(req, config);
      const { allowed, info } = checkRateLimit(req, config);

      expect(allowed).toBe(false);
      expect(info.dailyUsage).toBe(3);
      expect(info.dailyLimit).toBe(3);
    });

    it('should support custom key generator', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
        keyGenerator: () => 'custom-key',
      };

      const { allowed: first } = checkRateLimit(req, config);
      const { allowed: second } = checkRateLimit(req, config);

      expect(first).toBe(true);
      expect(second).toBe(false);
    });

    it('should use default config when none provided', () => {
      const req = createMockRequest();
      const { info } = checkRateLimit(req);
      expect(info.limit).toBe(DEFAULT_RATE_LIMIT.maxRequests);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for a specific key', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
        keyGenerator: () => 'test-key',
      };

      checkRateLimit(req, config);
      const cleared = clearRateLimit('test-key');
      expect(cleared).toBe(true);

      const { allowed } = checkRateLimit(req, config);
      expect(allowed).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(clearRateLimit('nonexistent')).toBe(false);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all entries', () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        keyGenerator: () => 'key1',
      };

      checkRateLimit(createMockRequest(), config);
      clearAllRateLimits();

      const stats = getRateLimitStats();
      expect(stats.entries).toBe(0);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return current store stats', () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
      };

      checkRateLimit(createMockRequest('1.1.1.1'), config);
      checkRateLimit(createMockRequest('2.2.2.2'), config);

      const stats = getRateLimitStats();
      expect(stats.entries).toBe(2);
      expect(stats.keys).toHaveLength(2);
    });
  });

  describe('LLM_RATE_LIMIT', () => {
    it('should be more restrictive than default', () => {
      expect(LLM_RATE_LIMIT.maxRequests).toBeLessThanOrEqual(DEFAULT_RATE_LIMIT.maxRequests);
    });

    it('should have a daily limit', () => {
      expect(LLM_RATE_LIMIT.dailyLimit).toBeDefined();
      expect(LLM_RATE_LIMIT.dailyLimit).toBeGreaterThan(0);
    });
  });

  describe('resetIn timing', () => {
    it('should report time until window reset', () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
      };

      const { info } = checkRateLimit(req, config);
      expect(info.resetIn).toBeGreaterThan(0);
      expect(info.resetIn).toBeLessThanOrEqual(60000);
    });
  });
});
