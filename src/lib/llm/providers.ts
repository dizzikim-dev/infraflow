/**
 * LLM Provider detection and configuration.
 *
 * Provides utility functions to detect available LLM providers
 * and their configuration status.
 *
 * NOTE: This module reads process.env directly (not via getEnv()) because:
 * 1. Tests dynamically manipulate process.env between calls
 * 2. getEnv() caches on first call, which breaks dynamic env changes in tests
 * 3. API keys must reflect the current runtime state
 *
 * @module lib/llm/providers
 */

export type LLMProviderType = 'anthropic' | 'openai';

export interface LLMProviderInfo {
  provider: LLMProviderType;
  apiKey: string;
}

/**
 * Detect which LLM provider is available based on environment variables.
 *
 * Prefers OpenAI if both are available (matching modify/route.ts behavior).
 *
 * @returns Provider info or null if no provider is configured
 */
export function detectLLMProvider(): LLMProviderInfo | null {
  // eslint-disable-next-line no-restricted-syntax
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  // eslint-disable-next-line no-restricted-syntax
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    return { provider: 'openai', apiKey: openaiKey };
  }
  if (anthropicKey) {
    return { provider: 'anthropic', apiKey: anthropicKey };
  }
  return null;
}

/**
 * Get the configuration status of all LLM providers.
 *
 * @returns Object indicating which providers are configured
 */
export function getProviderStatus(): { claude: boolean; openai: boolean } {
  return {
    // eslint-disable-next-line no-restricted-syntax
    claude: !!process.env.ANTHROPIC_API_KEY,
    // eslint-disable-next-line no-restricted-syntax
    openai: !!process.env.OPENAI_API_KEY,
  };
}
