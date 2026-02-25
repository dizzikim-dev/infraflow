import { InfraSpec } from '@/types';
import { isInfraSpec } from '@/types/guards';
import { createLogger } from '@/lib/utils/logger';
import type { TraceSummary } from '@/lib/rag/types';
import type { AnswerEvidence } from '@/lib/rag/sourceAggregator';

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
  /** Reasoning trace ID for detailed inspection */
  traceId?: string;
  /** Lightweight trace summary */
  traceSummary?: TraceSummary;
  /** Post-verification result */
  verification?: {
    score: number;
    missingRequired: number;
    missingRecommended: number;
    conflicts: number;
  };
  /** Answer-level evidence for ReferenceBox */
  answerEvidence?: AnswerEvidence | null;
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

    return {
      success: result.success,
      spec: result.spec,
      error: result.error,
      rawResponse: result.rawResponse,
      traceId: result.traceId,
      traceSummary: result.traceSummary,
      verification: result.verification,
      answerEvidence: result.answerEvidence ?? null,
    };
  } catch (error) {
    logger.error('LLM parse request failed', error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
