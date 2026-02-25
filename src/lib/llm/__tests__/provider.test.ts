/**
 * LLM Provider Abstraction Tests
 *
 * Tests for the unified LLM provider interface that normalizes
 * differences between Claude (Anthropic) and OpenAI API calls.
 *
 * @module lib/llm/__tests__/provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLLMProvider,
  ClaudeProvider,
  OpenAIProvider,
  type LLMProviderAdapter,
  type LLMCallOptions,
} from '../provider';
import { LLM_MODELS } from '../models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(content: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => content,
    text: async () => content,
  });
}

function mockFetchError(status: number, errorText: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => errorText,
  });
}

const VALID_SPEC_JSON = JSON.stringify({
  nodes: [{ id: 'fw-1', type: 'firewall', label: 'Firewall' }],
  connections: [],
  zones: [],
});

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

describe('createLLMProvider', () => {
  it('creates a ClaudeProvider for "claude" type', () => {
    const provider = createLLMProvider('claude');
    expect(provider).toBeInstanceOf(ClaudeProvider);
    expect(provider.name).toBe('anthropic');
  });

  it('creates an OpenAIProvider for "openai" type', () => {
    const provider = createLLMProvider('openai');
    expect(provider).toBeInstanceOf(OpenAIProvider);
    expect(provider.name).toBe('openai');
  });

  it('throws for unknown provider type', () => {
    expect(() => createLLMProvider('unknown' as 'claude')).toThrow('Unknown LLM provider');
  });
});

// ---------------------------------------------------------------------------
// ClaudeProvider
// ---------------------------------------------------------------------------

describe('ClaudeProvider', () => {
  let provider: LLMProviderAdapter;

  beforeEach(() => {
    provider = new ClaudeProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct name and default model', () => {
    expect(provider.name).toBe('anthropic');
    expect(provider.defaultModel).toBe(LLM_MODELS.ANTHROPIC_DEFAULT);
  });

  describe('isConfigured', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns true when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when ANTHROPIC_API_KEY is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('getApiKey', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns the API key when set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
      expect(provider.getApiKey()).toBe('sk-ant-test');
    });

    it('returns undefined when not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(provider.getApiKey()).toBeUndefined();
    });
  });

  describe('buildRequest', () => {
    it('builds correct request structure for Claude API', () => {
      const options: LLMCallOptions = {
        apiKey: 'test-key',
        prompt: 'Build a web server',
        systemPrompt: 'You are an expert',
        model: 'claude-3-haiku-20240307',
        maxTokens: 2048,
      };

      const req = provider.buildRequest(options);

      expect(req.url).toBe('https://api.anthropic.com/v1/messages');
      expect(req.headers).toEqual({
        'Content-Type': 'application/json',
        'x-api-key': 'test-key',
        'anthropic-version': '2023-06-01',
      });

      const body = JSON.parse(req.body);
      expect(body.model).toBe('claude-3-haiku-20240307');
      expect(body.max_tokens).toBe(2048);
      expect(body.system).toBe('You are an expert');
      expect(body.messages).toEqual([
        { role: 'user', content: 'Convert this infrastructure description to JSON:\n\nBuild a web server' },
      ]);
    });

    it('uses default model when not specified', () => {
      const req = provider.buildRequest({
        apiKey: 'key',
        prompt: 'test',
      });

      const body = JSON.parse(req.body);
      expect(body.model).toBe(LLM_MODELS.ANTHROPIC_DEFAULT);
    });

    it('uses default maxTokens of 2048', () => {
      const req = provider.buildRequest({
        apiKey: 'key',
        prompt: 'test',
      });

      const body = JSON.parse(req.body);
      expect(body.max_tokens).toBe(2048);
    });
  });

  describe('extractContent', () => {
    it('extracts text from Claude response format', () => {
      const data = {
        content: [{ type: 'text', text: 'Hello world' }],
      };
      expect(provider.extractContent(data)).toBe('Hello world');
    });

    it('returns null for empty content array', () => {
      expect(provider.extractContent({ content: [] })).toBeNull();
    });

    it('returns null for missing content', () => {
      expect(provider.extractContent({})).toBeNull();
    });

    it('returns null for null data', () => {
      expect(provider.extractContent(null)).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// OpenAIProvider
// ---------------------------------------------------------------------------

describe('OpenAIProvider', () => {
  let provider: LLMProviderAdapter;

  beforeEach(() => {
    provider = new OpenAIProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct name and default model', () => {
    expect(provider.name).toBe('openai');
    expect(provider.defaultModel).toBe(LLM_MODELS.OPENAI_DEFAULT);
  });

  describe('isConfigured', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns true when OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('getApiKey', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns the API key when set', () => {
      process.env.OPENAI_API_KEY = 'sk-openai-test';
      expect(provider.getApiKey()).toBe('sk-openai-test');
    });

    it('returns undefined when not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(provider.getApiKey()).toBeUndefined();
    });
  });

  describe('buildRequest', () => {
    it('builds correct request structure for OpenAI API', () => {
      const options: LLMCallOptions = {
        apiKey: 'test-key',
        prompt: 'Build a web server',
        systemPrompt: 'You are an expert',
        model: 'gpt-4o-mini',
        maxTokens: 2048,
      };

      const req = provider.buildRequest(options);

      expect(req.url).toBe('https://api.openai.com/v1/chat/completions');
      expect(req.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key',
      });

      const body = JSON.parse(req.body);
      expect(body.model).toBe('gpt-4o-mini');
      expect(body.max_tokens).toBe(2048);
      expect(body.temperature).toBe(0.3);
      expect(body.messages).toEqual([
        { role: 'system', content: 'You are an expert' },
        { role: 'user', content: 'Convert this infrastructure description to JSON:\n\nBuild a web server' },
      ]);
    });

    it('uses default model when not specified', () => {
      const req = provider.buildRequest({
        apiKey: 'key',
        prompt: 'test',
      });

      const body = JSON.parse(req.body);
      expect(body.model).toBe(LLM_MODELS.OPENAI_DEFAULT);
    });

    it('includes system message in messages array (not separate field)', () => {
      const req = provider.buildRequest({
        apiKey: 'key',
        prompt: 'test',
        systemPrompt: 'Be helpful',
      });

      const body = JSON.parse(req.body);
      // OpenAI puts system in messages array
      expect(body.messages[0]).toEqual({ role: 'system', content: 'Be helpful' });
      // Should NOT have a separate system field
      expect(body.system).toBeUndefined();
    });

    it('omits system message when systemPrompt is empty', () => {
      const req = provider.buildRequest({
        apiKey: 'key',
        prompt: 'test',
      });

      const body = JSON.parse(req.body);
      // Only user message when no system prompt
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });
  });

  describe('extractContent', () => {
    it('extracts text from OpenAI response format', () => {
      const data = {
        choices: [{ message: { content: 'Hello world' } }],
      };
      expect(provider.extractContent(data)).toBe('Hello world');
    });

    it('returns null for empty choices array', () => {
      expect(provider.extractContent({ choices: [] })).toBeNull();
    });

    it('returns null for missing choices', () => {
      expect(provider.extractContent({})).toBeNull();
    });

    it('returns null for null data', () => {
      expect(provider.extractContent(null)).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Provider contract tests (shared behavior)
// ---------------------------------------------------------------------------

describe.each([
  ['ClaudeProvider', () => new ClaudeProvider()],
  ['OpenAIProvider', () => new OpenAIProvider()],
] as const)('%s contract', (_name, factory) => {
  let provider: LLMProviderAdapter;

  beforeEach(() => {
    provider = factory();
  });

  it('implements LLMProviderAdapter interface', () => {
    expect(provider.name).toBeDefined();
    expect(typeof provider.defaultModel).toBe('string');
    expect(typeof provider.isConfigured).toBe('function');
    expect(typeof provider.getApiKey).toBe('function');
    expect(typeof provider.buildRequest).toBe('function');
    expect(typeof provider.extractContent).toBe('function');
  });

  it('buildRequest returns url, headers, and body', () => {
    const req = provider.buildRequest({
      apiKey: 'key',
      prompt: 'test prompt',
    });

    expect(req.url).toMatch(/^https:\/\//);
    expect(req.headers).toBeDefined();
    expect(req.headers['Content-Type']).toBe('application/json');
    expect(typeof req.body).toBe('string');
    // Body should be valid JSON
    expect(() => JSON.parse(req.body)).not.toThrow();
  });

  it('extractContent returns null for undefined', () => {
    expect(provider.extractContent(undefined)).toBeNull();
  });
});
