/**
 * LLM Model Name Constants
 *
 * Single source of truth for model identifiers used across
 * the LLM API routes and client-side configuration.
 */
export const LLM_MODELS = {
  ANTHROPIC_DEFAULT: 'claude-3-haiku-20240307',
  ANTHROPIC_ADVANCED: 'claude-sonnet-4-20250514',
  OPENAI_DEFAULT: 'gpt-4o-mini',
  OPENAI_ADVANCED: 'gpt-4o',
} as const;

export type LLMModelId = (typeof LLM_MODELS)[keyof typeof LLM_MODELS];
