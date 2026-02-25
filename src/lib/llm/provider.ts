/**
 * LLM Provider Abstraction
 *
 * Unified interface that normalizes differences between Claude (Anthropic)
 * and OpenAI API calls. Each provider implements the same interface,
 * allowing the route handler to be provider-agnostic.
 *
 * Differences handled:
 * - Endpoint URLs
 * - Auth header format (x-api-key vs Bearer)
 * - Request body shape (system field vs messages array)
 * - Response parsing (content[0].text vs choices[0].message.content)
 *
 * NOTE: This module reads process.env directly (not via getEnv()) because:
 * 1. Tests dynamically manipulate process.env between calls
 * 2. getEnv() caches on first call, which breaks dynamic env changes in tests
 *
 * @module lib/llm/provider
 */

import type { LLMProviderType } from './providers';
import { LLM_MODELS } from './models';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMCallOptions {
  apiKey: string;
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

export interface LLMRequestConfig {
  url: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Unified LLM provider interface.
 *
 * Each provider normalizes:
 * - `buildRequest()`: API-specific request construction
 * - `extractContent()`: Response text extraction
 * - `isConfigured()` / `getApiKey()`: Environment-based configuration
 */
export interface LLMProviderAdapter {
  readonly name: LLMProviderType;
  readonly defaultModel: string;

  /** Check if provider has an API key configured */
  isConfigured(): boolean;

  /** Get the provider's API key from environment */
  getApiKey(): string | undefined;

  /** Build the fetch request config (url, headers, body) */
  buildRequest(options: LLMCallOptions): LLMRequestConfig;

  /** Extract content text from API response data */
  extractContent(data: unknown): string | null;
}

// ---------------------------------------------------------------------------
// Claude Provider
// ---------------------------------------------------------------------------

export class ClaudeProvider implements LLMProviderAdapter {
  readonly name: LLMProviderType = 'anthropic';
  readonly defaultModel = LLM_MODELS.ANTHROPIC_DEFAULT;

  isConfigured(): boolean {
    // eslint-disable-next-line no-restricted-syntax
    return !!process.env.ANTHROPIC_API_KEY;
  }

  getApiKey(): string | undefined {
    // eslint-disable-next-line no-restricted-syntax
    return process.env.ANTHROPIC_API_KEY;
  }

  buildRequest(options: LLMCallOptions): LLMRequestConfig {
    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens ?? 2048;

    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: options.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Convert this infrastructure description to JSON:\n\n${options.prompt}`,
          },
        ],
      }),
    };
  }

  extractContent(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    const content = d.content;
    if (!Array.isArray(content) || content.length === 0) return null;
    return (content[0] as Record<string, unknown>)?.text as string ?? null;
  }
}

// ---------------------------------------------------------------------------
// OpenAI Provider
// ---------------------------------------------------------------------------

export class OpenAIProvider implements LLMProviderAdapter {
  readonly name: LLMProviderType = 'openai';
  readonly defaultModel = LLM_MODELS.OPENAI_DEFAULT;

  isConfigured(): boolean {
    // eslint-disable-next-line no-restricted-syntax
    return !!process.env.OPENAI_API_KEY;
  }

  getApiKey(): string | undefined {
    // eslint-disable-next-line no-restricted-syntax
    return process.env.OPENAI_API_KEY;
  }

  buildRequest(options: LLMCallOptions): LLMRequestConfig {
    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens ?? 2048;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({
      role: 'user',
      content: `Convert this infrastructure description to JSON:\n\n${options.prompt}`,
    });

    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    };
  }

  extractContent(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    const choices = d.choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const message = (choices[0] as Record<string, unknown>)?.message;
    if (!message || typeof message !== 'object') return null;
    return (message as Record<string, unknown>)?.content as string ?? null;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an LLM provider adapter by type.
 *
 * @param type - 'claude' | 'openai'
 * @returns The corresponding provider adapter
 * @throws Error if the provider type is unknown
 */
export function createLLMProvider(type: 'claude' | 'openai'): LLMProviderAdapter {
  switch (type) {
    case 'claude':
      return new ClaudeProvider();
    case 'openai':
      return new OpenAIProvider();
    default:
      throw new Error(`Unknown LLM provider: ${type}`);
  }
}
