/**
 * Tests for environment variable validation (env.ts)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv, resetEnvCache, getLLMApiKey, isLLMConfigured } from '@/lib/config/env';

// Cast to a mutable record so TypeScript allows delete / reassign on
// read-only properties like NODE_ENV.
const mutableEnv = process.env as Record<string, string | undefined>;

describe('getEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Restore a clean snapshot before each test
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  afterEach(() => {
    // Restore originals
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  // ---------- Defaults ----------

  it('should return default values when env vars are not set', () => {
    delete mutableEnv.LLM_MODEL;
    delete mutableEnv.OPENAI_MODEL;
    delete mutableEnv.LLM_MAX_TOKENS;
    delete mutableEnv.LLM_TIMEOUT_MS;
    delete mutableEnv.NODE_ENV;

    const env = getEnv();

    expect(env.LLM_MODEL).toBe('claude-sonnet-4-20250514');
    expect(env.OPENAI_MODEL).toBe('gpt-4o');
    expect(env.LLM_MAX_TOKENS).toBe(2048);
    expect(env.LLM_TIMEOUT_MS).toBe(30000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('should return default rate limit values', () => {
    delete mutableEnv.RATE_LIMIT_MAX_REQUESTS;
    delete mutableEnv.RATE_LIMIT_WINDOW_MS;
    delete mutableEnv.RATE_LIMIT_DAILY;
    delete mutableEnv.LLM_RATE_LIMIT_MAX;
    delete mutableEnv.LLM_RATE_LIMIT_WINDOW_MS;
    delete mutableEnv.LLM_RATE_LIMIT_DAILY;
    delete mutableEnv.ANALYZE_RATE_LIMIT_MAX;
    delete mutableEnv.ANALYZE_RATE_LIMIT_WINDOW_MS;
    delete mutableEnv.ANALYZE_RATE_LIMIT_DAILY;

    const env = getEnv();

    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(10);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.RATE_LIMIT_DAILY).toBe(100);
    expect(env.LLM_RATE_LIMIT_MAX).toBe(10);
    expect(env.LLM_RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.LLM_RATE_LIMIT_DAILY).toBe(100);
    expect(env.ANALYZE_RATE_LIMIT_MAX).toBe(30);
    expect(env.ANALYZE_RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.ANALYZE_RATE_LIMIT_DAILY).toBe(500);
  });

  // ---------- Coercion ----------

  it('should coerce string numbers to numbers', () => {
    mutableEnv.LLM_MAX_TOKENS = '4096';
    mutableEnv.LLM_TIMEOUT_MS = '60000';
    mutableEnv.RATE_LIMIT_MAX_REQUESTS = '20';

    const env = getEnv();

    expect(env.LLM_MAX_TOKENS).toBe(4096);
    expect(typeof env.LLM_MAX_TOKENS).toBe('number');
    expect(env.LLM_TIMEOUT_MS).toBe(60000);
    expect(typeof env.LLM_TIMEOUT_MS).toBe('number');
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(20);
    expect(typeof env.RATE_LIMIT_MAX_REQUESTS).toBe('number');
  });

  // ---------- Optional fields ----------

  it('should return undefined for optional API keys when not set', () => {
    delete mutableEnv.ANTHROPIC_API_KEY;
    delete mutableEnv.OPENAI_API_KEY;
    delete mutableEnv.DATABASE_URL;
    delete mutableEnv.NEXTAUTH_SECRET;

    const env = getEnv();

    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(env.OPENAI_API_KEY).toBeUndefined();
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.NEXTAUTH_SECRET).toBeUndefined();
  });

  it('should return string values for API keys when set', () => {
    mutableEnv.ANTHROPIC_API_KEY = 'sk-ant-test-key-123';
    mutableEnv.OPENAI_API_KEY = 'sk-openai-test-key-456';

    const env = getEnv();

    expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-test-key-123');
    expect(env.OPENAI_API_KEY).toBe('sk-openai-test-key-456');
  });

  // ---------- NODE_ENV enum ----------

  it('should accept valid NODE_ENV values', () => {
    mutableEnv.NODE_ENV = 'production';
    resetEnvCache();
    expect(getEnv().NODE_ENV).toBe('production');

    mutableEnv.NODE_ENV = 'test';
    resetEnvCache();
    expect(getEnv().NODE_ENV).toBe('test');

    mutableEnv.NODE_ENV = 'development';
    resetEnvCache();
    expect(getEnv().NODE_ENV).toBe('development');
  });

  // ---------- Caching ----------

  it('should cache the parsed result across calls', () => {
    mutableEnv.LLM_MAX_TOKENS = '1024';

    const env1 = getEnv();
    expect(env1.LLM_MAX_TOKENS).toBe(1024);

    // Mutate env after cache -- should NOT pick up the change
    mutableEnv.LLM_MAX_TOKENS = '8192';
    const env2 = getEnv();
    expect(env2.LLM_MAX_TOKENS).toBe(1024);

    // After reset it should pick up the new value
    resetEnvCache();
    const env3 = getEnv();
    expect(env3.LLM_MAX_TOKENS).toBe(8192);
  });

  // ---------- LLM Model overrides ----------

  it('should allow overriding LLM_MODEL and OPENAI_MODEL', () => {
    mutableEnv.LLM_MODEL = 'claude-3-opus-20240229';
    mutableEnv.OPENAI_MODEL = 'gpt-4-turbo';

    const env = getEnv();

    expect(env.LLM_MODEL).toBe('claude-3-opus-20240229');
    expect(env.OPENAI_MODEL).toBe('gpt-4-turbo');
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe('getLLMApiKey', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  it('should return Anthropic key when only Anthropic is set', () => {
    mutableEnv.ANTHROPIC_API_KEY = 'sk-ant-key';
    delete mutableEnv.OPENAI_API_KEY;

    expect(getLLMApiKey()).toBe('sk-ant-key');
  });

  it('should return OpenAI key when only OpenAI is set', () => {
    delete mutableEnv.ANTHROPIC_API_KEY;
    mutableEnv.OPENAI_API_KEY = 'sk-openai-key';

    expect(getLLMApiKey()).toBe('sk-openai-key');
  });

  it('should prefer Anthropic when both are set', () => {
    mutableEnv.ANTHROPIC_API_KEY = 'sk-ant-key';
    mutableEnv.OPENAI_API_KEY = 'sk-openai-key';

    expect(getLLMApiKey()).toBe('sk-ant-key');
  });

  it('should return undefined when neither is set', () => {
    delete mutableEnv.ANTHROPIC_API_KEY;
    delete mutableEnv.OPENAI_API_KEY;

    expect(getLLMApiKey()).toBeUndefined();
  });
});

describe('isLLMConfigured', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete mutableEnv[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      mutableEnv[key] = value;
    }
    resetEnvCache();
  });

  it('should return true when an API key is present', () => {
    mutableEnv.ANTHROPIC_API_KEY = 'sk-ant-key';
    expect(isLLMConfigured()).toBe(true);
  });

  it('should return false when no API key is present', () => {
    delete mutableEnv.ANTHROPIC_API_KEY;
    delete mutableEnv.OPENAI_API_KEY;
    expect(isLLMConfigured()).toBe(false);
  });
});
