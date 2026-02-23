/**
 * Environment Variable Validation with Zod
 *
 * Centralised schema for all environment variables used across the application.
 * Parsed lazily on first access so build-time compilation never fails
 * (every field is optional or has a default).
 *
 * @module lib/config/env
 *
 * @example
 * import { getEnv, getLLMApiKey } from '@/lib/config/env';
 *
 * const env = getEnv();
 * console.log(env.LLM_MAX_TOKENS);  // 2048 (number, coerced from string)
 *
 * const key = getLLMApiKey();        // ANTHROPIC_API_KEY || OPENAI_API_KEY
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const envSchema = z.object({
  // ---- LLM API Keys ----
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),

  // ---- LLM Configuration ----
  LLM_MODEL: z.string().default('claude-sonnet-4-20250514'),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  LLM_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // ---- Database ----
  DATABASE_URL: z.string().min(1).optional(),

  // ---- Auth (NextAuth.js) ----
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // ---- Rate Limiting (default) ----
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_DAILY: z.coerce.number().int().positive().default(100),

  // ---- Rate Limiting (LLM-specific) ----
  LLM_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  LLM_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  LLM_RATE_LIMIT_DAILY: z.coerce.number().int().positive().default(100),

  // ---- Rate Limiting (analyze endpoints) ----
  ANALYZE_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  ANALYZE_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  ANALYZE_RATE_LIMIT_DAILY: z.coerce.number().int().positive().default(500),

  // ---- Logging ----
  LOG_LEVEL: z.string().optional(),
  NEXT_PUBLIC_LOG_LEVEL: z.string().optional(),

  // ---- Deployment ----
  VERCEL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ---- Demo Mode ----
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),

  // ---- Environment ----
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _env: Env | null = null;

/**
 * Parse and cache environment variables.
 *
 * Uses a lazy singleton so the schema is only validated once per process
 * lifetime. All values are optional or carry defaults, ensuring the call
 * never throws during build.
 */
export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}

/**
 * Reset the cached env (useful for testing).
 *
 * @internal
 */
export function resetEnvCache(): void {
  _env = null;
}

// ---------------------------------------------------------------------------
// Production validation
// ---------------------------------------------------------------------------

/**
 * Validate that required environment variables are present in production.
 * Throws an error if critical variables (e.g. NEXTAUTH_SECRET) are missing.
 *
 * Should be called at application startup.
 */
export function validateProductionEnv(): void {
  const env = getEnv();
  if (env.NODE_ENV === 'production' && env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    if (!env.NEXTAUTH_SECRET) {
      throw new Error('FATAL: NEXTAUTH_SECRET is required in production');
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/**
 * Return whichever LLM API key is available.
 * Prefers Anthropic; falls back to OpenAI.
 */
export function getLLMApiKey(): string | undefined {
  const env = getEnv();
  return env.ANTHROPIC_API_KEY ?? env.OPENAI_API_KEY;
}

/**
 * Quick boolean check: is at least one LLM provider configured?
 */
export function isLLMConfigured(): boolean {
  return !!getLLMApiKey();
}
