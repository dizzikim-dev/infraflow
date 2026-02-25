import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateProductionEnv,
  getEnv,
  getLLMApiKey,
  isLLMConfigured,
  resetEnvCache,
} from '../env';

describe('env', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  // ---------------------------------------------------------------------------
  // validateProductionEnv
  // ---------------------------------------------------------------------------
  describe('validateProductionEnv', () => {
    it('throws when NODE_ENV=production and NEXTAUTH_SECRET is missing', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '');

      // Ensure NEXTAUTH_SECRET is not set
      delete process.env.NEXTAUTH_SECRET;

      expect(() => validateProductionEnv()).toThrow(
        'FATAL: NEXTAUTH_SECRET is required in production',
      );

      vi.unstubAllEnvs();
    });

    it('does NOT throw when NODE_ENV=production and NEXTAUTH_SECRET IS set', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXTAUTH_SECRET', 'a-valid-secret-key-for-production');
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '');

      expect(() => validateProductionEnv()).not.toThrow();

      vi.unstubAllEnvs();
    });

    it('does NOT throw in development (NODE_ENV=development)', () => {
      vi.stubEnv('NODE_ENV', 'development');
      delete process.env.NEXTAUTH_SECRET;

      expect(() => validateProductionEnv()).not.toThrow();

      vi.unstubAllEnvs();
    });

    it('does NOT throw when NEXT_PUBLIC_DEMO_MODE=true even without secret', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
      delete process.env.NEXTAUTH_SECRET;

      expect(() => validateProductionEnv()).not.toThrow();

      vi.unstubAllEnvs();
    });
  });

  // ---------------------------------------------------------------------------
  // getEnv
  // ---------------------------------------------------------------------------
  describe('getEnv', () => {
    it('returns defaults for optional fields', () => {
      vi.stubEnv('NODE_ENV', 'test');

      const env = getEnv();

      expect(env.LLM_MAX_TOKENS).toBe(2048);
      expect(env.LLM_TIMEOUT_MS).toBe(30000);
      expect(env.LLM_MODEL).toBe('claude-sonnet-4-20250514');
      expect(env.OPENAI_MODEL).toBe('gpt-4o');
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(10);
      expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
      expect(env.RATE_LIMIT_DAILY).toBe(100);

      vi.unstubAllEnvs();
    });
  });

  // ---------------------------------------------------------------------------
  // getLLMApiKey
  // ---------------------------------------------------------------------------
  describe('getLLMApiKey', () => {
    it('prefers Anthropic key over OpenAI key', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');
      vi.stubEnv('OPENAI_API_KEY', 'sk-openai-test');

      expect(getLLMApiKey()).toBe('sk-ant-test');

      vi.unstubAllEnvs();
    });

    it('falls back to OpenAI key when Anthropic key is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      vi.stubEnv('OPENAI_API_KEY', 'sk-openai-test');

      expect(getLLMApiKey()).toBe('sk-openai-test');

      vi.unstubAllEnvs();
    });

    it('returns undefined when no API keys are set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(getLLMApiKey()).toBeUndefined();

      vi.unstubAllEnvs();
    });
  });

  // ---------------------------------------------------------------------------
  // isLLMConfigured
  // ---------------------------------------------------------------------------
  describe('isLLMConfigured', () => {
    it('returns true when an API key is available', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');

      expect(isLLMConfigured()).toBe(true);

      vi.unstubAllEnvs();
    });

    it('returns false when no API keys are set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(isLLMConfigured()).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ---------------------------------------------------------------------------
  // resetEnvCache
  // ---------------------------------------------------------------------------
  describe('resetEnvCache', () => {
    it('clears the singleton so next getEnv() re-parses', () => {
      vi.stubEnv('LLM_MAX_TOKENS', '4096');
      const env1 = getEnv();
      expect(env1.LLM_MAX_TOKENS).toBe(4096);

      // Reset and change the env var
      resetEnvCache();
      vi.stubEnv('LLM_MAX_TOKENS', '1024');

      const env2 = getEnv();
      expect(env2.LLM_MAX_TOKENS).toBe(1024);

      vi.unstubAllEnvs();
    });
  });
});
