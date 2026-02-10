/**
 * LLM Diagram Modification API
 *
 * This endpoint uses Claude Sonnet to interpret natural language modifications
 * to existing infrastructure diagrams and returns structured operations.
 *
 * @module api/modify
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Node, Edge } from '@xyflow/react';
import type { InfraSpec, InfraNodeData } from '@/types/infra';
import { buildContext } from '@/lib/parser/contextBuilder';
import { buildSystemPrompt, formatUserMessage } from '@/lib/parser/prompts';
import { applyOperations, type Operation } from '@/lib/parser/diffApplier';
import {
  parseAndValidateLLMResponse,
  toOperations,
  LLMValidationError,
} from '@/lib/parser/responseValidator';
import { LLMModifyError, toLLMModifyError } from '@/lib/parser/modifyErrors';
import { checkRateLimit, LLM_RATE_LIMIT } from '@/lib/middleware/rateLimiter';
import { createLogger } from '@/lib/utils/logger';
import { addRateLimitHeaders } from '@/lib/llm/rateLimitHeaders';
import { detectLLMProvider, type LLMProviderType } from '@/lib/llm/providers';
import {
  enrichContext,
  buildKnowledgePromptSection,
  RELATIONSHIPS,
  ANTIPATTERNS,
  FAILURES,
} from '@/lib/knowledge';
import { assessChangeRisk, type ChangeRiskAssessment } from '@/lib/parser/changeRiskAssessor';

const log = createLogger('Modify API');

/**
 * Request body for the modify endpoint
 */
export interface ModifyRequestBody {
  prompt: string;
  currentSpec: InfraSpec;
  nodes: Node<InfraNodeData>[];
  edges: Edge[];
}

/**
 * Response from the modify endpoint
 */
export interface ModifyResponse {
  success: boolean;
  spec?: InfraSpec;
  reasoning?: string;
  operations?: Operation[];
  riskAssessment?: ChangeRiskAssessment;
  error?: {
    code: string;
    userMessage: string;
    retryAfter?: number;
  };
  rateLimit?: {
    limit: number;
    remaining: number;
  };
}

// LLM configuration (configurable via environment variables)
const LLM_CONFIG = {
  // Anthropic model
  anthropicModel: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
  // OpenAI model
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2048', 10),
  timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),
};


/**
 * Call Claude (Anthropic) API for diagram modification
 */
async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_CONFIG.timeoutMs);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: LLM_CONFIG.anthropicModel,
        max_tokens: LLM_CONFIG.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        throw LLMModifyError.rateLimit(retryAfter ? parseInt(retryAfter) : 60);
      }

      throw LLMModifyError.apiError(response.status, errorText);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw LLMModifyError.invalidResponse('Empty response from API');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call OpenAI API for diagram modification
 */
async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_CONFIG.timeoutMs);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LLM_CONFIG.openaiModel,
        max_tokens: LLM_CONFIG.maxTokens,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        throw LLMModifyError.rateLimit(retryAfter ? parseInt(retryAfter) : 60);
      }

      throw LLMModifyError.apiError(response.status, errorText);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw LLMModifyError.invalidResponse('Empty response from API');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call LLM API (auto-detect provider)
 */
async function callLLM(
  systemPrompt: string,
  userMessage: string,
  provider: LLMProviderType,
  apiKey: string
): Promise<string> {
  if (provider === 'openai') {
    return callOpenAI(systemPrompt, userMessage, apiKey);
  }
  return callAnthropic(systemPrompt, userMessage, apiKey);
}

/**
 * POST /api/modify - Modify diagram using LLM
 */
export async function POST(request: NextRequest): Promise<NextResponse<ModifyResponse>> {
  // Check rate limit
  const { allowed, info, response: rateLimitResponse } = checkRateLimit(
    request,
    LLM_RATE_LIMIT
  );

  if (!allowed && rateLimitResponse) {
    return rateLimitResponse as NextResponse<ModifyResponse>;
  }

  const rateLimitInfo = {
    limit: info.limit,
    remaining: info.remaining,
  };

  // Basic CSRF protection - check Origin header
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.includes(host)) {
    const response = NextResponse.json<ModifyResponse>(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          userMessage: '허용되지 않은 요청입니다.',
        },
      },
      { status: 403 }
    );
    return addRateLimitHeaders(response, info);
  }

  try {
    // Parse request body
    const body: ModifyRequestBody = await request.json();
    const { prompt, currentSpec, nodes, edges } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_PROMPT',
            userMessage: '프롬프트를 입력해주세요.',
          },
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Validate request body size limits
    if (prompt.length > 2000) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: {
            code: 'PROMPT_TOO_LONG',
            userMessage: '프롬프트는 최대 2000자까지 입력할 수 있습니다.',
          },
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    if (nodes && nodes.length > 100) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: {
            code: 'TOO_MANY_NODES',
            userMessage: '노드 수가 최대 허용 개수(100개)를 초과했습니다.',
          },
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    if (edges && edges.length > 200) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: {
            code: 'TOO_MANY_EDGES',
            userMessage: '연결(엣지) 수가 최대 허용 개수(200개)를 초과했습니다.',
          },
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Check for empty diagram
    if (!nodes || nodes.length === 0) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: LLMModifyError.emptyDiagram().toJSON(),
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Check API key (supports both Anthropic and OpenAI)
    const llmProvider = detectLLMProvider();
    if (!llmProvider) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: LLMModifyError.apiKeyMissing().toJSON(),
          rateLimit: rateLimitInfo,
        },
        { status: 401 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Build context from current canvas state
    const context = buildContext(nodes, edges);

    // Format user message
    const userMessage = formatUserMessage(context, prompt);

    // Enrich with knowledge graph
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      spec: currentSpec,
      antiPatterns: [...ANTIPATTERNS],
      failureScenarios: [...FAILURES],
    });
    const knowledgeSection = buildKnowledgePromptSection(enriched);
    const systemPrompt = buildSystemPrompt(knowledgeSection || undefined);

    const modelName = llmProvider.provider === 'openai'
      ? LLM_CONFIG.openaiModel
      : LLM_CONFIG.anthropicModel;
    log.info(`Calling ${llmProvider.provider} (${modelName})...`);
    log.debug('Context summary', { summary: context.summary });
    if (knowledgeSection) {
      log.debug('Knowledge section injected', { length: knowledgeSection.length });
    }

    // Call LLM (auto-detect provider)
    const llmResponse = await callLLM(
      systemPrompt,
      userMessage,
      llmProvider.provider,
      llmProvider.apiKey
    );

    log.info('LLM Response received');

    // Parse and validate response
    const validatedResponse = parseAndValidateLLMResponse(llmResponse);
    const operations = toOperations(validatedResponse);

    log.info('Operations parsed', { count: operations.length });

    // Apply operations to spec
    const result = applyOperations(currentSpec, operations);

    if (!result.success) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          reasoning: validatedResponse.reasoning,
          operations,
          error: {
            code: 'OPERATION_FAILED',
            userMessage: result.errors.join(', '),
          },
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Assess change risk
    const riskAssessment = assessChangeRisk(currentSpec, result.newSpec);
    log.info('Risk assessment', { level: riskAssessment.level, factors: riskAssessment.factors.length });

    // Success
    const response = NextResponse.json<ModifyResponse>({
      success: true,
      spec: result.newSpec,
      reasoning: validatedResponse.reasoning,
      operations,
      riskAssessment,
      rateLimit: rateLimitInfo,
    });
    return addRateLimitHeaders(response, info);
  } catch (error) {
    log.error('Request failed', error instanceof Error ? error : new Error(String(error)));

    // Handle known errors
    if (error instanceof LLMModifyError) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: error.toJSON(),
          rateLimit: rateLimitInfo,
        },
        { status: error.code === 'API_RATE_LIMIT' ? 429 : 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    if (error instanceof LLMValidationError) {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: LLMModifyError.invalidResponse(error.message).toJSON(),
          rateLimit: rateLimitInfo,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      const response = NextResponse.json<ModifyResponse>(
        {
          success: false,
          error: LLMModifyError.timeout().toJSON(),
          rateLimit: rateLimitInfo,
        },
        { status: 504 }
      );
      return addRateLimitHeaders(response, info);
    }

    // Unknown error
    const modifyError = toLLMModifyError(error);
    const response = NextResponse.json<ModifyResponse>(
      {
        success: false,
        error: modifyError.toJSON(),
        rateLimit: rateLimitInfo,
      },
      { status: 500 }
    );
    return addRateLimitHeaders(response, info);
  }
}

/**
 * GET /api/modify - Check if modify API is available
 */
export async function GET(): Promise<NextResponse> {
  const llmProvider = detectLLMProvider();

  if (!llmProvider) {
    return NextResponse.json({
      available: false,
      provider: null,
      model: null,
    });
  }

  const model = llmProvider.provider === 'openai'
    ? LLM_CONFIG.openaiModel
    : LLM_CONFIG.anthropicModel;

  return NextResponse.json({
    available: true,
    provider: llmProvider.provider,
    model,
  });
}
