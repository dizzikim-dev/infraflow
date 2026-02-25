/**
 * Rate Limiter Tests
 *
 * Tests for the DegradedInMemoryStore, checkRateLimit, and key generators.
 * Uses _setStoreForTesting() to inject test stores.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  DegradedInMemoryStore,
  InMemoryRateLimitStore,
  checkRateLimit,
  _setStoreForTesting,
  createUserAwareKeyGenerator,
  type RateLimitEntry,
  type RateLimitConfig,
} from '../rateLimiter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(url = 'http://localhost/api/test', ip = '1.2.3.4'): NextRequest {
  const req = new NextRequest(url);
  // x-forwarded-for is used by getClientIP()
  req.headers.set('x-forwarded-for', ip);
  return req;
}

function makeConfig(overrides?: Partial<RateLimitConfig>): RateLimitConfig {
  return {
    maxRequests: 3,
    windowMs: 60_000,
    dailyLimit: 10,
    ...overrides,
  };
}

function makeEntry(overrides?: Partial<RateLimitEntry>): RateLimitEntry {
  return {
    count: 0,
    windowStart: Date.now(),
    dailyCount: 0,
    dayStart: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DegradedInMemoryStore
// ---------------------------------------------------------------------------

describe('DegradedInMemoryStore', () => {
  let store: DegradedInMemoryStore;

  beforeEach(() => {
    store = new DegradedInMemoryStore();
  });

  it('stores and retrieves entries correctly', async () => {
    const entry = makeEntry({ count: 5, dailyCount: 12 });

    await store.set('key-1', entry);
    const retrieved = await store.get('key-1');

    expect(retrieved).toBeDefined();
    expect(retrieved!.count).toBe(5);
    expect(retrieved!.dailyCount).toBe(12);
  });

  it('returns undefined for missing keys', async () => {
    const result = await store.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('logs degraded warning only once', async () => {
    const entry = makeEntry();
    await store.set('key-1', entry);

    // Access get() multiple times — warning should only fire once
    // We spy on console to verify the warning behavior indirectly.
    // The DegradedInMemoryStore uses createLogger('RateLimiter') which calls console.warn.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await store.get('key-1');
    await store.get('key-1');
    await store.get('key-1');

    // The log.warn call uses console.warn internally — at most 1 degraded warning
    const degradedCalls = warnSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('DEGRADED')
    );
    expect(degradedCalls.length).toBeLessThanOrEqual(1);

    warnSpy.mockRestore();
  });

  it('deletes entries correctly', async () => {
    await store.set('key-del', makeEntry());
    expect(await store.get('key-del')).toBeDefined();

    const deleted = await store.delete('key-del');
    expect(deleted).toBe(true);
    expect(await store.get('key-del')).toBeUndefined();
  });

  it('clears all entries', async () => {
    await store.set('a', makeEntry());
    await store.set('b', makeEntry());

    await store.clear();
    const stats = await store.getStats();
    expect(stats.entries).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit — with DegradedInMemoryStore
// ---------------------------------------------------------------------------

describe('checkRateLimit with DegradedInMemoryStore', () => {
  let degradedStore: DegradedInMemoryStore;

  beforeEach(() => {
    degradedStore = new DegradedInMemoryStore();
    _setStoreForTesting(degradedStore);
  });

  afterEach(() => {
    // Restore a clean in-memory store after each test
    _setStoreForTesting(new InMemoryRateLimitStore());
  });

  it('allows requests within limits', async () => {
    const config = makeConfig({ maxRequests: 5 });
    const req = makeRequest();

    const result = await checkRateLimit(req, config);

    expect(result.allowed).toBe(true);
    expect(result.info.current).toBe(1);
    expect(result.info.remaining).toBe(4);
    expect(result.response).toBeUndefined();
  });

  it('enforces window limit and rejects with 429', async () => {
    const config = makeConfig({ maxRequests: 2 });

    // First two requests should pass
    const r1 = await checkRateLimit(makeRequest(), config);
    expect(r1.allowed).toBe(true);

    const r2 = await checkRateLimit(makeRequest(), config);
    expect(r2.allowed).toBe(true);

    // Third request should be rejected
    const r3 = await checkRateLimit(makeRequest(), config);
    expect(r3.allowed).toBe(false);
    expect(r3.response).toBeDefined();
    expect(r3.response!.status).toBe(429);
  });

  it('enforces daily limit', async () => {
    const config = makeConfig({ maxRequests: 100, dailyLimit: 2 });

    const r1 = await checkRateLimit(makeRequest(), config);
    expect(r1.allowed).toBe(true);

    const r2 = await checkRateLimit(makeRequest(), config);
    expect(r2.allowed).toBe(true);

    // Third request hits daily limit
    const r3 = await checkRateLimit(makeRequest(), config);
    expect(r3.allowed).toBe(false);
    expect(r3.response!.status).toBe(429);
  });

  it('resets window after expiry', async () => {
    const config = makeConfig({ maxRequests: 1, windowMs: 100 });

    // First request: allowed
    const r1 = await checkRateLimit(makeRequest(), config);
    expect(r1.allowed).toBe(true);

    // Second request: rejected (window limit hit)
    const r2 = await checkRateLimit(makeRequest(), config);
    expect(r2.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // After window reset: allowed again
    const r3 = await checkRateLimit(makeRequest(), config);
    expect(r3.allowed).toBe(true);
  });

  it('tracks different IPs separately', async () => {
    const config = makeConfig({ maxRequests: 1 });

    const r1 = await checkRateLimit(makeRequest('http://localhost/api/test', '10.0.0.1'), config);
    expect(r1.allowed).toBe(true);

    const r2 = await checkRateLimit(makeRequest('http://localhost/api/test', '10.0.0.2'), config);
    expect(r2.allowed).toBe(true);

    // Same IP again — should be rejected
    const r3 = await checkRateLimit(makeRequest('http://localhost/api/test', '10.0.0.1'), config);
    expect(r3.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createUserAwareKeyGenerator
// ---------------------------------------------------------------------------

describe('createUserAwareKeyGenerator', () => {
  it('returns user key when userId is provided', () => {
    const generator = createUserAwareKeyGenerator('user-123');
    const req = makeRequest();

    const key = generator(req);
    expect(key).toBe('user:user-123');
  });

  it('returns IP key when no userId is provided', () => {
    const generator = createUserAwareKeyGenerator();
    const req = makeRequest('http://localhost/api/test', '192.168.1.1');

    const key = generator(req);
    expect(key).toBe('ip:192.168.1.1');
  });

  it('returns IP key when userId is undefined', () => {
    const generator = createUserAwareKeyGenerator(undefined);
    const req = makeRequest('http://localhost/api/test', '10.0.0.5');

    const key = generator(req);
    expect(key).toBe('ip:10.0.0.5');
  });
});
