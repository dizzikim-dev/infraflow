/**
 * Rate Limiter
 *
 * Redis-backed rate limiting for API protection with in-memory fallback.
 * Provides IP-based and daily usage limits.
 *
 * Store strategy:
 *   - If UPSTASH_REDIS_REST_URL is set: use Redis (persists across cold starts)
 *   - Otherwise: use in-memory Map (resets on restart)
 *
 * Store initialization:
 *   - In production (VERCEL=true), if Redis is unavailable at startup,
 *     falls back to DegradedInMemoryStore (logs warnings, still serves requests).
 *   - At runtime, if a Redis operation fails, requests are REJECTED (fail-closed).
 *   - In development, falls back to in-memory silently.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/utils/logger';
import { getEnv } from '@/lib/config/env';

const log = createLogger('RateLimiter');

// ============================================================
// Types
// ============================================================

export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Maximum daily requests (0 = unlimited) */
  dailyLimit?: number;
  /** Custom key generator (defaults to IP) */
  keyGenerator?: (req: NextRequest) => string;
  /** Custom response handler */
  onRateLimited?: (req: NextRequest, info: RateLimitInfo) => NextResponse;
}

export interface RateLimitInfo {
  /** Current request count in window */
  current: number;
  /** Maximum allowed requests */
  limit: number;
  /** Remaining requests in window */
  remaining: number;
  /** Time until window resets (ms) */
  resetIn: number;
  /** Daily usage count */
  dailyUsage?: number;
  /** Daily limit */
  dailyLimit?: number;
}

export interface RateLimitEntry {
  count: number;
  windowStart: number;
  dailyCount: number;
  dayStart: number;
}

// ============================================================
// Store Interface
// ============================================================

export interface RateLimitStoreInterface {
  get(key: string): Promise<RateLimitEntry | undefined>;
  set(key: string, entry: RateLimitEntry, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<{ entries: number; keys: string[] }>;
}

// ============================================================
// In-Memory Store
// ============================================================

/**
 * In-memory store for rate limit data.
 * Used in development or as fallback when Redis is unavailable.
 */
export class InMemoryRateLimitStore implements RateLimitStoreInterface {
  private store: Map<string, RateLimitEntry> = new Map();
  private lastCleanup: number = Date.now();
  private readonly cleanupIntervalMs = 60000;

  async get(key: string): Promise<RateLimitEntry | undefined> {
    this.lazyCleanup();
    return this.store.get(key);
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * Lazy cleanup: check if enough time has passed and clean if needed.
   * This avoids setInterval which is incompatible with serverless environments.
   */
  private lazyCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup >= this.cleanupIntervalMs) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * Remove expired entries to prevent memory bloat
   */
  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    for (const [key, entry] of this.store.entries()) {
      // Remove entries that haven't been used in an hour
      if (entry.windowStart < oneHourAgo) {
        this.store.delete(key);
      }
    }
  }

  async getStats(): Promise<{ entries: number; keys: string[] }> {
    return {
      entries: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.store.clear();
  }
}

// ============================================================
// Redis Store
// ============================================================

/** Key prefix to namespace rate limit entries in Redis */
const REDIS_KEY_PREFIX = 'rl:';

/**
 * Minimal interface for the Redis client methods used by RedisRateLimitStore.
 * Compatible with @upstash/redis Redis class.
 */
export interface RedisClient {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, options?: { px?: number }): Promise<string>;
  del(...keys: string[]): Promise<number>;
  scan(cursor: number, options?: { match?: string; count?: number }): Promise<[number, string[]]>;
}

/**
 * Redis-backed store for rate limit data using Upstash REST client.
 * Persists across serverless cold starts.
 *
 * Accepts a RedisClient via constructor for testability.
 */
export class RedisRateLimitStore implements RateLimitStoreInterface {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async get(key: string): Promise<RateLimitEntry | undefined> {
    const data = await this.redis.get<RateLimitEntry>(REDIS_KEY_PREFIX + key);
    return data ?? undefined;
  }

  async set(key: string, entry: RateLimitEntry, ttlMs?: number): Promise<void> {
    const redisKey = REDIS_KEY_PREFIX + key;
    if (ttlMs && ttlMs > 0) {
      // psetex: set with TTL in milliseconds
      await this.redis.set(redisKey, entry, { px: ttlMs });
    } else {
      // Default TTL: 24 hours (covers daily limit window)
      await this.redis.set(redisKey, entry, { px: 86400000 });
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(REDIS_KEY_PREFIX + key);
    return result > 0;
  }

  async clear(): Promise<void> {
    // Scan for all rate limit keys and delete them
    let cursor = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, {
        match: `${REDIS_KEY_PREFIX}*`,
        count: 100,
      });
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== 0);
  }

  async getStats(): Promise<{ entries: number; keys: string[] }> {
    const allKeys: string[] = [];
    let cursor = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, {
        match: `${REDIS_KEY_PREFIX}*`,
        count: 100,
      });
      cursor = nextCursor;
      allKeys.push(...keys.map((k: string) => k.replace(REDIS_KEY_PREFIX, '')));
    } while (cursor !== 0);

    return {
      entries: allKeys.length,
      keys: allKeys,
    };
  }
}

// ============================================================
// Reject-All Store (fail-closed for production without Redis)
// ============================================================

/**
 * A store that always throws on every operation.
 * Used in production (VERCEL=true) when Redis cannot be initialized,
 * ensuring fail-closed behavior: every request hits the catch block
 * in checkRateLimit() and gets rejected with 503.
 */
export class RejectAllStore implements RateLimitStoreInterface {
  async get(_key: string): Promise<RateLimitEntry | undefined> {
    throw new Error('Rate limit store unavailable (Redis not initialized in production)');
  }

  async set(_key: string, _entry: RateLimitEntry, _ttlMs?: number): Promise<void> {
    throw new Error('Rate limit store unavailable (Redis not initialized in production)');
  }

  async delete(_key: string): Promise<boolean> {
    throw new Error('Rate limit store unavailable (Redis not initialized in production)');
  }

  async clear(): Promise<void> {
    // No-op: nothing to clear
  }

  async getStats(): Promise<{ entries: number; keys: string[] }> {
    return { entries: 0, keys: [] };
  }
}

// ============================================================
// Degraded In-Memory Store (production fallback without Redis)
// ============================================================

/**
 * Degraded in-memory store for when Redis is unavailable in production.
 * Provides basic rate limiting (less precise than Redis across instances)
 * but does NOT reject all requests. Logs warnings for visibility.
 */
export class DegradedInMemoryStore extends InMemoryRateLimitStore {
  private hasLoggedWarning = false;

  async get(key: string): Promise<RateLimitEntry | undefined> {
    this.logDegradedWarning();
    return super.get(key);
  }

  async set(key: string, entry: RateLimitEntry, _ttlMs?: number): Promise<void> {
    return super.set(key, entry);
  }

  private logDegradedWarning(): void {
    if (!this.hasLoggedWarning) {
      log.warn(
        'Rate limiter running in DEGRADED mode (in-memory). ' +
        'Configure UPSTASH_REDIS_REST_URL for production-grade rate limiting.'
      );
      this.hasLoggedWarning = true;
    }
  }
}

// ============================================================
// Store Factory
// ============================================================

/**
 * Create the appropriate rate limit store based on environment.
 *
 * - UPSTASH_REDIS_REST_URL set: Redis store
 * - VERCEL set but Redis unavailable: DegradedInMemoryStore (degraded mode)
 * - Otherwise (dev): In-memory store
 */
function createStore(): RateLimitStoreInterface {
  const env = getEnv();
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      // Dynamic require for @upstash/redis — only loaded when Redis is configured.
      // Variable indirection prevents Next.js bundler from resolving at compile time.
      const pkgName = '@upstash/redis';
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require(pkgName) as { Redis: new (opts: { url: string; token: string }) => RedisClient };
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const redisStore = new RedisRateLimitStore(redis);
      log.info('Using Redis-backed rate limit store (Upstash)');
      return redisStore;
    } catch (error) {
      log.error(
        'Failed to create Redis rate limit store',
        error instanceof Error ? error : new Error(String(error))
      );
      if (env.VERCEL) {
        log.warn(
          'WARNING: Redis initialization failed on VERCEL. ' +
          'Running in degraded mode (in-memory rate limiting).'
        );
        return new DegradedInMemoryStore();
      }
      return new InMemoryRateLimitStore();
    }
  }

  if (env.VERCEL) {
    log.warn(
      'WARNING: No Redis env vars on VERCEL (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). ' +
      'Running in degraded mode (in-memory rate limiting). ' +
      'Configure Redis for production.'
    );
    return new DegradedInMemoryStore();
  }

  return new InMemoryRateLimitStore();
}

// Global store instance
let store: RateLimitStoreInterface = createStore();

/** @internal Test-only: replace the global store */
export function _setStoreForTesting(newStore: RateLimitStoreInterface): void {
  store = newStore;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Extract client IP from request
 */
function getClientIP(req: NextRequest): string {
  // Try common headers first
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default for local development
  return '127.0.0.1';
}

/**
 * Get the start of the current day (midnight UTC)
 */
function getDayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/**
 * Create a 429 Too Many Requests response
 */
function createRateLimitResponse(info: RateLimitInfo): NextResponse {
  const retryAfter = Math.ceil(info.resetIn / 1000);

  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter,
      limit: info.limit,
      remaining: 0,
      dailyUsage: info.dailyUsage,
      dailyLimit: info.dailyLimit,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': info.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(
          (Date.now() + info.resetIn) / 1000
        ).toString(),
      },
    }
  );
}

/**
 * Create a fail-closed response for when the rate limit store is unavailable.
 * Used in production when Redis operations fail.
 */
function createStoreUnavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Service temporarily unavailable. Please try again later.',
    },
    {
      status: 503,
      headers: {
        'Retry-After': '30',
      },
    }
  );
}

// ============================================================
// Rate Limiter
// ============================================================

/**
 * Default configuration
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = (() => {
  const env = getEnv();
  return {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    dailyLimit: env.RATE_LIMIT_DAILY,
  };
})();

/**
 * LLM-specific configuration (more restrictive)
 */
export const LLM_RATE_LIMIT: RateLimitConfig = (() => {
  const env = getEnv();
  return {
    maxRequests: env.LLM_RATE_LIMIT_MAX,
    windowMs: env.LLM_RATE_LIMIT_WINDOW_MS,
    dailyLimit: env.LLM_RATE_LIMIT_DAILY,
  };
})();

/**
 * Check rate limit for a request (async — supports Redis store)
 * @returns RateLimitInfo if within limits, or NextResponse if rate limited
 *
 * Fail-closed: If the store operation throws in production (VERCEL=true),
 * the request is rejected with 503. In development, store errors are logged
 * and the request is allowed through.
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<{ allowed: boolean; info: RateLimitInfo; response?: NextResponse }> {
  const now = Date.now();
  const dayStart = getDayStart();

  // Get client identifier
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : `ip:${getClientIP(req)}`;

  try {
    // Get or create entry
    let entry = await store.get(key);

    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        dailyCount: 0,
        dayStart,
      };
    }

    // Reset window if expired
    if (now - entry.windowStart >= config.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    // Reset daily count if new day
    if (entry.dayStart !== dayStart) {
      entry.dailyCount = 0;
      entry.dayStart = dayStart;
    }

    // Calculate rate limit info
    const info: RateLimitInfo = {
      current: entry.count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count - 1),
      resetIn: config.windowMs - (now - entry.windowStart),
      dailyUsage: entry.dailyCount,
      dailyLimit: config.dailyLimit,
    };

    // Check window limit
    if (entry.count >= config.maxRequests) {
      const response = config.onRateLimited
        ? config.onRateLimited(req, info)
        : createRateLimitResponse(info);

      return { allowed: false, info, response };
    }

    // Check daily limit
    if (config.dailyLimit && entry.dailyCount >= config.dailyLimit) {
      info.resetIn = dayStart + 86400000 - now; // Time until midnight

      const response = config.onRateLimited
        ? config.onRateLimited(req, info)
        : createRateLimitResponse({
            ...info,
            remaining: 0,
          });

      return { allowed: false, info, response };
    }

    // Increment counters
    entry.count++;
    entry.dailyCount++;

    // Set with TTL matching the longer of window or remaining daily time
    const ttlMs = Math.max(config.windowMs, dayStart + 86400000 - now);
    await store.set(key, entry, ttlMs);

    // Update info with new values
    info.current = entry.count;
    info.remaining = Math.max(0, config.maxRequests - entry.count);
    info.dailyUsage = entry.dailyCount;

    return { allowed: true, info };
  } catch (error) {
    // Fail-closed in production: reject request when store is unavailable
    // NOTE: Reading process.env directly here because tests dynamically
    // toggle VERCEL between calls, and getEnv() caches.
    // eslint-disable-next-line no-restricted-syntax
    if (process.env.VERCEL) {
      log.error(
        'Rate limit store error in production — fail-closed',
        error instanceof Error ? error : new Error(String(error))
      );
      const failInfo: RateLimitInfo = {
        current: 0,
        limit: config.maxRequests,
        remaining: 0,
        resetIn: 30000,
        dailyUsage: 0,
        dailyLimit: config.dailyLimit,
      };
      return {
        allowed: false,
        info: failInfo,
        response: createStoreUnavailableResponse(),
      };
    }

    // In development: log and allow through
    log.warn('Rate limit store error — allowing request (dev mode)', {
      error: error instanceof Error ? error.message : String(error),
    });
    const fallbackInfo: RateLimitInfo = {
      current: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetIn: config.windowMs,
      dailyUsage: 0,
      dailyLimit: config.dailyLimit,
    };
    return { allowed: true, info: fallbackInfo };
  }
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): (req: NextRequest) => Promise<NextResponse<T>> {
  return async (req: NextRequest) => {
    const { allowed, info, response } = await checkRateLimit(req, config);

    if (!allowed && response) {
      return response as NextResponse<T>;
    }

    // Add rate limit headers to successful response
    const result = await handler(req);

    result.headers.set('X-RateLimit-Limit', info.limit.toString());
    result.headers.set('X-RateLimit-Remaining', info.remaining.toString());
    result.headers.set(
      'X-RateLimit-Reset',
      Math.ceil((Date.now() + info.resetIn) / 1000).toString()
    );

    if (info.dailyLimit) {
      result.headers.set('X-RateLimit-Daily-Limit', info.dailyLimit.toString());
      result.headers.set(
        'X-RateLimit-Daily-Remaining',
        Math.max(0, info.dailyLimit - (info.dailyUsage || 0)).toString()
      );
    }

    return result;
  };
}

/**
 * Create a key generator that uses userId when authenticated, IP otherwise.
 */
export function createUserAwareKeyGenerator(
  userId?: string
): (req: NextRequest) => string {
  return (req: NextRequest) => {
    if (userId) return `user:${userId}`;
    return `ip:${getClientIP(req)}`;
  };
}

/**
 * Get rate limit info for a key (for monitoring)
 */
export async function getRateLimitInfo(key: string): Promise<RateLimitEntry | undefined> {
  return store.get(key);
}

/**
 * Clear rate limit for a key (for testing/admin)
 */
export async function clearRateLimit(key: string): Promise<boolean> {
  return store.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export async function clearAllRateLimits(): Promise<void> {
  await store.clear();
}

/**
 * Get store stats (for monitoring)
 */
export async function getRateLimitStats(): Promise<{ entries: number; keys: string[] }> {
  return store.getStats();
}
