import { InfraSpec } from '@/types';
import { isInfraSpec } from '@/types/guards';

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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check if LLM is configured on server
 */
export async function isLLMConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/llm');
    if (!response.ok) return false;

    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}

/**
 * Get available LLM providers from server
 */
export async function getAvailableProviders(): Promise<{
  claude: boolean;
  openai: boolean;
}> {
  try {
    const response = await fetch('/api/llm');
    if (!response.ok) {
      return { claude: false, openai: false };
    }

    const data = await response.json();
    return data.providers || { claude: false, openai: false };
  } catch {
    return { claude: false, openai: false };
  }
}

/**
 * Get default LLM config based on available providers
 */
export async function getDefaultLLMConfig(): Promise<LLMConfig | null> {
  const providers = await getAvailableProviders();

  if (providers.claude) {
    return {
      provider: 'claude',
      model: 'claude-3-haiku-20240307',
    };
  }

  if (providers.openai) {
    return {
      provider: 'openai',
      model: 'gpt-4o-mini',
    };
  }

  return null;
}

// Re-export for backwards compatibility
export { parseWithLLM as parseWithClaude };
export { parseWithLLM as parseWithOpenAI };
