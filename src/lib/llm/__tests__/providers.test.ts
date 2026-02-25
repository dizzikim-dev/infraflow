import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectLLMProvider, getProviderStatus } from '../providers';

describe('providers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear relevant env vars before each test
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  // ---------------------------------------------------------------------------
  // getProviderStatus
  // ---------------------------------------------------------------------------
  describe('getProviderStatus', () => {
    it('returns both false when no API keys are set', () => {
      const status = getProviderStatus();
      expect(status).toEqual({ claude: false, openai: false });
    });

    it('returns claude=true when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const status = getProviderStatus();
      expect(status.claude).toBe(true);
      expect(status.openai).toBe(false);
    });

    it('returns openai=true when OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'sk-openai-test-key';
      const status = getProviderStatus();
      expect(status.claude).toBe(false);
      expect(status.openai).toBe(true);
    });

    it('returns both true when both API keys are set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      process.env.OPENAI_API_KEY = 'sk-openai-test-key';
      const status = getProviderStatus();
      expect(status).toEqual({ claude: true, openai: true });
    });

    it('treats empty string as not configured', () => {
      process.env.ANTHROPIC_API_KEY = '';
      process.env.OPENAI_API_KEY = '';
      const status = getProviderStatus();
      expect(status).toEqual({ claude: false, openai: false });
    });
  });

  // ---------------------------------------------------------------------------
  // detectLLMProvider
  // ---------------------------------------------------------------------------
  describe('detectLLMProvider', () => {
    it('returns null when no API keys are set', () => {
      const provider = detectLLMProvider();
      expect(provider).toBeNull();
    });

    it('returns anthropic when only ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      const provider = detectLLMProvider();
      expect(provider).toEqual({
        provider: 'anthropic',
        apiKey: 'sk-ant-test-key',
      });
    });

    it('returns openai when only OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'sk-openai-test-key';
      const provider = detectLLMProvider();
      expect(provider).toEqual({
        provider: 'openai',
        apiKey: 'sk-openai-test-key',
      });
    });

    it('prefers openai when both keys are set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
      process.env.OPENAI_API_KEY = 'sk-openai-test-key';
      const provider = detectLLMProvider();
      expect(provider).not.toBeNull();
      expect(provider!.provider).toBe('openai');
      expect(provider!.apiKey).toBe('sk-openai-test-key');
    });

    it('returns null when keys are empty strings', () => {
      process.env.ANTHROPIC_API_KEY = '';
      process.env.OPENAI_API_KEY = '';
      const provider = detectLLMProvider();
      expect(provider).toBeNull();
    });

    it('returns correct provider info structure', () => {
      process.env.OPENAI_API_KEY = 'sk-test-12345';
      const provider = detectLLMProvider();
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('apiKey');
      expect(typeof provider!.provider).toBe('string');
      expect(typeof provider!.apiKey).toBe('string');
    });

    it('reflects dynamic env changes between calls', () => {
      // First call: no keys
      expect(detectLLMProvider()).toBeNull();

      // Set anthropic key
      process.env.ANTHROPIC_API_KEY = 'sk-ant-dynamic';
      expect(detectLLMProvider()!.provider).toBe('anthropic');

      // Add openai key — should switch to openai
      process.env.OPENAI_API_KEY = 'sk-openai-dynamic';
      expect(detectLLMProvider()!.provider).toBe('openai');

      // Remove openai key — should fall back to anthropic
      delete process.env.OPENAI_API_KEY;
      expect(detectLLMProvider()!.provider).toBe('anthropic');
    });
  });
});
