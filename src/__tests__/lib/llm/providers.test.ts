import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectLLMProvider, getProviderStatus } from '@/lib/llm/providers';

describe('detectLLMProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return null when no providers are configured', () => {
    expect(detectLLMProvider()).toBeNull();
  });

  it('should return anthropic when only Anthropic key is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    const result = detectLLMProvider();
    expect(result).toEqual({
      provider: 'anthropic',
      apiKey: 'sk-ant-test',
    });
  });

  it('should return openai when only OpenAI key is set', () => {
    process.env.OPENAI_API_KEY = 'sk-openai-test';
    const result = detectLLMProvider();
    expect(result).toEqual({
      provider: 'openai',
      apiKey: 'sk-openai-test',
    });
  });

  it('should prefer OpenAI when both are available', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    process.env.OPENAI_API_KEY = 'sk-openai-test';
    const result = detectLLMProvider();
    expect(result?.provider).toBe('openai');
  });
});

describe('getProviderStatus', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return false for both when nothing is configured', () => {
    expect(getProviderStatus()).toEqual({
      claude: false,
      openai: false,
    });
  });

  it('should detect configured providers', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    expect(getProviderStatus()).toEqual({
      claude: true,
      openai: false,
    });
  });

  it('should detect both providers', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    process.env.OPENAI_API_KEY = 'sk-openai-test';
    expect(getProviderStatus()).toEqual({
      claude: true,
      openai: true,
    });
  });
});
