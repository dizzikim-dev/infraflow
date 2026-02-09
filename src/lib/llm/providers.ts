/**
 * LLM Provider detection and configuration.
 *
 * Provides utility functions to detect available LLM providers
 * and their configuration status.
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
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
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
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
}
