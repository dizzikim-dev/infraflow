import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

import {
  checkRateLimit,
  clearAllRateLimits,
  clearRateLimit,
  getRateLimitInfo,
  getRateLimitStats,
  DEFAULT_RATE_LIMIT,
  LLM_RATE_LIMIT,
  InMemoryRateLimitStore,
  RedisRateLimitStore,
  RejectAllStore,
  _setStoreForTesting,
  type RateLimitConfig,
  type RateLimitStoreInterface,
  type RedisClient,
} from '@/lib/middleware/rateLimiter';

/**
 * Create a mock Redis client for testing RedisRateLimitStore.
 */
function createMockRedisClient(): RedisClient & {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  scan: ReturnType<typeof vi.fn>;
} {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(0),
    scan: vi.fn().mockResolvedValue([0, []]),
  };
}

function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    headers: {
      'x-forwarded-for': ip,
    },
  });
}

describe('rateLimiter', () => {
  beforeEach(async () => {
    await clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 60000,
      };

      const { allowed, info } = await checkRateLimit(req, config);
      expect(allowed).toBe(true);
      expect(info.current).toBe(1);
      expect(info.remaining).toBe(4);
      expect(info.limit).toBe(5);
    });

    it('should track request count correctly', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 3,
        windowMs: 60000,
      };

      await checkRateLimit(req, config);
      await checkRateLimit(req, config);
      const { allowed, info } = await checkRateLimit(req, config);

      expect(allowed).toBe(true);
      expect(info.current).toBe(3);
      expect(info.remaining).toBe(0);
    });

    it('should block requests exceeding the limit', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 60000,
      };

      await checkRateLimit(req, config);
      await checkRateLimit(req, config);
      const { allowed, response } = await checkRateLimit(req, config);

      expect(allowed).toBe(false);
      expect(response).toBeDefined();
    });

    it('should use different keys for different IPs', async () => {
      const req1 = createMockRequest('1.1.1.1');
      const req2 = createMockRequest('2.2.2.2');
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
      };

      const { allowed: a1 } = await checkRateLimit(req1, config);
      const { allowed: a2 } = await checkRateLimit(req2, config);

      expect(a1).toBe(true);
      expect(a2).toBe(true);
    });

    it('should support daily limits', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        dailyLimit: 3,
      };

      await checkRateLimit(req, config);
      await checkRateLimit(req, config);
      await checkRateLimit(req, config);
      const { allowed, info } = await checkRateLimit(req, config);

      expect(allowed).toBe(false);
      expect(info.dailyUsage).toBe(3);
      expect(info.dailyLimit).toBe(3);
    });

    it('should support custom key generator', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
        keyGenerator: () => 'custom-key',
      };

      const { allowed: first } = await checkRateLimit(req, config);
      const { allowed: second } = await checkRateLimit(req, config);

      expect(first).toBe(true);
      expect(second).toBe(false);
    });

    it('should use default config when none provided', async () => {
      const req = createMockRequest();
      const { info } = await checkRateLimit(req);
      expect(info.limit).toBe(DEFAULT_RATE_LIMIT.maxRequests);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for a specific key', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 60000,
        keyGenerator: () => 'test-key',
      };

      await checkRateLimit(req, config);
      const cleared = await clearRateLimit('test-key');
      expect(cleared).toBe(true);

      const { allowed } = await checkRateLimit(req, config);
      expect(allowed).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      expect(await clearRateLimit('nonexistent')).toBe(false);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all entries', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        keyGenerator: () => 'key1',
      };

      await checkRateLimit(createMockRequest(), config);
      await clearAllRateLimits();

      const stats = await getRateLimitStats();
      expect(stats.entries).toBe(0);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return current store stats', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
      };

      await checkRateLimit(createMockRequest('1.1.1.1'), config);
      await checkRateLimit(createMockRequest('2.2.2.2'), config);

      const stats = await getRateLimitStats();
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
    it('should report time until window reset', async () => {
      const req = createMockRequest();
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
      };

      const { info } = await checkRateLimit(req, config);
      expect(info.resetIn).toBeGreaterThan(0);
      expect(info.resetIn).toBeLessThanOrEqual(60000);
    });
  });
});

// ============================================================
// InMemoryRateLimitStore unit tests
// ============================================================

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  it('should return undefined for missing key', async () => {
    const result = await store.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should store and retrieve entries', async () => {
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('key1', entry);
    const result = await store.get('key1');
    expect(result).toEqual(entry);
  });

  it('should delete entries', async () => {
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('key1', entry);
    const deleted = await store.delete('key1');
    expect(deleted).toBe(true);
    expect(await store.get('key1')).toBeUndefined();
  });

  it('should return false when deleting non-existent key', async () => {
    const deleted = await store.delete('nonexistent');
    expect(deleted).toBe(false);
  });

  it('should clear all entries', async () => {
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('key1', entry);
    await store.set('key2', entry);
    await store.clear();
    const stats = await store.getStats();
    expect(stats.entries).toBe(0);
  });

  it('should return correct stats', async () => {
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('a', entry);
    await store.set('b', entry);
    const stats = await store.getStats();
    expect(stats.entries).toBe(2);
    expect(stats.keys).toContain('a');
    expect(stats.keys).toContain('b');
  });
});

// ============================================================
// RedisRateLimitStore unit tests (mocked)
// ============================================================

describe('RedisRateLimitStore', () => {
  let mockRedis: ReturnType<typeof createMockRedisClient>;

  beforeEach(() => {
    mockRedis = createMockRedisClient();
  });

  it('should create a Redis store instance', () => {
    const store = new RedisRateLimitStore(mockRedis);
    expect(store).toBeInstanceOf(RedisRateLimitStore);
  });

  it('should get an entry from Redis', async () => {
    const entry = { count: 3, windowStart: 1000, dailyCount: 5, dayStart: 2000 };
    mockRedis.get.mockResolvedValue(entry);

    const store = new RedisRateLimitStore(mockRedis);
    const result = await store.get('test-key');

    expect(mockRedis.get).toHaveBeenCalledWith('rl:test-key');
    expect(result).toEqual(entry);
  });

  it('should return undefined for missing Redis key', async () => {
    mockRedis.get.mockResolvedValue(null);

    const store = new RedisRateLimitStore(mockRedis);
    const result = await store.get('missing');

    expect(result).toBeUndefined();
  });

  it('should set an entry in Redis with TTL', async () => {
    const store = new RedisRateLimitStore(mockRedis);
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('key1', entry, 60000);

    expect(mockRedis.set).toHaveBeenCalledWith('rl:key1', entry, { px: 60000 });
  });

  it('should set an entry in Redis with default TTL when no ttlMs provided', async () => {
    const store = new RedisRateLimitStore(mockRedis);
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await store.set('key1', entry);

    expect(mockRedis.set).toHaveBeenCalledWith('rl:key1', entry, { px: 86400000 });
  });

  it('should delete an entry from Redis', async () => {
    mockRedis.del.mockResolvedValue(1);

    const store = new RedisRateLimitStore(mockRedis);
    const result = await store.delete('key1');

    expect(mockRedis.del).toHaveBeenCalledWith('rl:key1');
    expect(result).toBe(true);
  });

  it('should return false when deleting non-existent Redis key', async () => {
    mockRedis.del.mockResolvedValue(0);

    const store = new RedisRateLimitStore(mockRedis);
    const result = await store.delete('missing');

    expect(result).toBe(false);
  });

  it('should clear all rate limit keys from Redis', async () => {
    mockRedis.scan
      .mockResolvedValueOnce([42, ['rl:key1', 'rl:key2']])
      .mockResolvedValueOnce([0, ['rl:key3']]);
    mockRedis.del.mockResolvedValue(1);

    const store = new RedisRateLimitStore(mockRedis);
    await store.clear();

    expect(mockRedis.scan).toHaveBeenCalledTimes(2);
    expect(mockRedis.del).toHaveBeenCalledWith('rl:key1', 'rl:key2');
    expect(mockRedis.del).toHaveBeenCalledWith('rl:key3');
  });

  it('should get stats from Redis via scan', async () => {
    mockRedis.scan
      .mockResolvedValueOnce([42, ['rl:ip:1.1.1.1', 'rl:ip:2.2.2.2']])
      .mockResolvedValueOnce([0, []]);

    const store = new RedisRateLimitStore(mockRedis);
    const stats = await store.getStats();

    expect(stats.entries).toBe(2);
    expect(stats.keys).toContain('ip:1.1.1.1');
    expect(stats.keys).toContain('ip:2.2.2.2');
  });
});

// ============================================================
// Fail-closed behavior tests
// ============================================================

describe('fail-closed behavior', () => {
  afterEach(() => {
    // Always restore to a working in-memory store
    _setStoreForTesting(new InMemoryRateLimitStore());
  });

  it('should reject with 503 when store fails in production (VERCEL=true)', async () => {
    const failingStore: RateLimitStoreInterface = {
      get: vi.fn().mockRejectedValue(new Error('Redis down')),
      set: vi.fn().mockRejectedValue(new Error('Redis down')),
      delete: vi.fn().mockResolvedValue(false),
      clear: vi.fn().mockResolvedValue(undefined),
      getStats: vi.fn().mockResolvedValue({ entries: 0, keys: [] }),
    };

    const originalVercel = process.env.VERCEL;
    process.env.VERCEL = '1';
    _setStoreForTesting(failingStore);

    try {
      const req = createMockRequest();
      const { allowed, response } = await checkRateLimit(req, {
        maxRequests: 10,
        windowMs: 60000,
      });

      expect(allowed).toBe(false);
      expect(response).toBeDefined();
      expect(response!.status).toBe(503);

      const body = await response!.json();
      expect(body.error).toContain('temporarily unavailable');
    } finally {
      if (originalVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = originalVercel;
      }
    }
  });

  it('should allow through with fallback info when store fails in dev mode', async () => {
    const failingStore: RateLimitStoreInterface = {
      get: vi.fn().mockRejectedValue(new Error('Redis down')),
      set: vi.fn().mockRejectedValue(new Error('Redis down')),
      delete: vi.fn().mockResolvedValue(false),
      clear: vi.fn().mockResolvedValue(undefined),
      getStats: vi.fn().mockResolvedValue({ entries: 0, keys: [] }),
    };

    const originalVercel = process.env.VERCEL;
    delete process.env.VERCEL;
    _setStoreForTesting(failingStore);

    try {
      const req = createMockRequest();
      const { allowed, info, response } = await checkRateLimit(req, {
        maxRequests: 10,
        windowMs: 60000,
      });

      expect(allowed).toBe(true);
      expect(response).toBeUndefined();
      expect(info.remaining).toBe(10); // Full remaining since fallback
    } finally {
      if (originalVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = originalVercel;
      }
    }
  });

  it('should reject every request with RejectAllStore in production', async () => {
    const originalVercel = process.env.VERCEL;
    process.env.VERCEL = '1';
    _setStoreForTesting(new RejectAllStore());

    try {
      const req = createMockRequest();
      const config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 };

      // Every request should be rejected, not just after a limit
      for (let i = 0; i < 3; i++) {
        const { allowed, response } = await checkRateLimit(req, config);
        expect(allowed).toBe(false);
        expect(response!.status).toBe(503);
      }
    } finally {
      if (originalVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = originalVercel;
      }
    }
  });
});

// ============================================================
// RejectAllStore unit tests
// ============================================================

describe('RejectAllStore', () => {
  let store: RejectAllStore;

  beforeEach(() => {
    store = new RejectAllStore();
  });

  it('should throw on get()', async () => {
    await expect(store.get('any-key')).rejects.toThrow('Rate limit store unavailable');
  });

  it('should throw on set()', async () => {
    const entry = { count: 1, windowStart: Date.now(), dailyCount: 1, dayStart: Date.now() };
    await expect(store.set('any-key', entry)).rejects.toThrow('Rate limit store unavailable');
  });

  it('should throw on delete()', async () => {
    await expect(store.delete('any-key')).rejects.toThrow('Rate limit store unavailable');
  });

  it('should not throw on clear()', async () => {
    await expect(store.clear()).resolves.toBeUndefined();
  });

  it('should return empty stats', async () => {
    const stats = await store.getStats();
    expect(stats.entries).toBe(0);
    expect(stats.keys).toHaveLength(0);
  });
});

// ============================================================
// Store interface conformance tests
// ============================================================

describe('RateLimitStoreInterface conformance', () => {
  const stores: { name: string; create: () => RateLimitStoreInterface; rejectsOps?: boolean }[] = [
    { name: 'InMemoryRateLimitStore', create: () => new InMemoryRateLimitStore() },
    { name: 'RejectAllStore', create: () => new RejectAllStore(), rejectsOps: true },
  ];

  for (const { name, create, rejectsOps } of stores) {
    describe(name, () => {
      let store: RateLimitStoreInterface;

      beforeEach(() => {
        store = create();
      });

      it('should implement get/set/delete/clear/getStats', async () => {
        expect(typeof store.get).toBe('function');
        expect(typeof store.set).toBe('function');
        expect(typeof store.delete).toBe('function');
        expect(typeof store.clear).toBe('function');
        expect(typeof store.getStats).toBe('function');
      });

      if (!rejectsOps) {
        it('should round-trip an entry', async () => {
          const entry = { count: 5, windowStart: 1000, dailyCount: 10, dayStart: 2000 };
          await store.set('roundtrip', entry);
          const result = await store.get('roundtrip');
          expect(result).toEqual(entry);
        });
      }

      it('should return empty stats after clear', async () => {
        if (!rejectsOps) {
          const entry = { count: 1, windowStart: 1000, dailyCount: 1, dayStart: 2000 };
          await store.set('x', entry);
        }
        await store.clear();
        const stats = await store.getStats();
        expect(stats.entries).toBe(0);
        expect(stats.keys).toHaveLength(0);
      });
    });
  }
});
