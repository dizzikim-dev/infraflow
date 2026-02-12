import { InfraSpec } from '@/types';
import { isInfraSpec } from '@/types/guards';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('LLMParser');

export interface LLMConfig {
  provider: 'claude' | 'openai';
  model?: string;
}

export interface LLMParseResult {
  success: boolean;
  spec?: InfraSpec;
  error?: string;
  rawResponse?: string;
}

/**
 * Parse prompt using server-side API route
 * API keys are stored securely on the server
 */
export async function parseWithLLM(
  prompt: string,
  config: LLMConfig
): Promise<LLMParseResult> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        provider: config.provider,
        model: config.model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    // Validate the spec on client-side as well
    if (result.success && result.spec) {
      if (!isInfraSpec(result.spec)) {
        return {
          success: false,
          error: 'Invalid spec format received from server',
          rawResponse: result.rawResponse,
        };
      }
    }

    return result;
  } catch (error) {
    logger.error('LLM parse request failed', error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
