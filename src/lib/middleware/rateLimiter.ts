/**
 * Rate Limiter
 *
 * In-memory rate limiting for API protection.
 * Provides IP-based and daily usage limits.
 */

import { NextRequest, NextResponse } from 'next/server';

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

interface RateLimitEntry {
  count: number;
  windowStart: number;
  dailyCount: number;
  dayStart: number;
}

// ============================================================
// Rate Limit Store
// ============================================================

/**
 * In-memory store for rate limit data.
 * Note: This resets on server restart. For production,
 * consider using Redis or similar.
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private lastCleanup: number = Date.now();
  private readonly cleanupIntervalMs = 60000;

  get(key: string): RateLimitEntry | undefined {
    this.lazyCleanup();
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): boolean {
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

  /**
   * Get store stats for monitoring
   */
  getStats(): { entries: number; keys: string[] } {
    return {
      entries: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.store.clear();
  }
}

// Global store instance
const store = new RateLimitStore();

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

// ============================================================
// Rate Limiter
// ============================================================

/**
 * Default configuration
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  dailyLimit: parseInt(process.env.RATE_LIMIT_DAILY || '100', 10),
};

/**
 * LLM-specific configuration (more restrictive)
 */
export const LLM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: parseInt(process.env.LLM_RATE_LIMIT_MAX || '10', 10),
  windowMs: parseInt(process.env.LLM_RATE_LIMIT_WINDOW_MS || '60000', 10),
  dailyLimit: parseInt(process.env.LLM_RATE_LIMIT_DAILY || '100', 10),
};

/**
 * Check rate limit for a request
 * @returns RateLimitInfo if within limits, or NextResponse if rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; info: RateLimitInfo; response?: NextResponse } {
  const now = Date.now();
  const dayStart = getDayStart();

  // Get client identifier
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : `ip:${getClientIP(req)}`;

  // Get or create entry
  let entry = store.get(key);

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
  store.set(key, entry);

  // Update info with new values
  info.current = entry.count;
  info.remaining = Math.max(0, config.maxRequests - entry.count);
  info.dailyUsage = entry.dailyCount;

  return { allowed: true, info };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): (req: NextRequest) => Promise<NextResponse<T>> {
  return async (req: NextRequest) => {
    const { allowed, info, response } = checkRateLimit(req, config);

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
export function getRateLimitInfo(key: string): RateLimitEntry | undefined {
  return store.get(key);
}

/**
 * Clear rate limit for a key (for testing/admin)
 */
export function clearRateLimit(key: string): boolean {
  return store.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}

/**
 * Get store stats (for monitoring)
 */
export function getRateLimitStats(): { entries: number; keys: string[] } {
  return store.getStats();
}
