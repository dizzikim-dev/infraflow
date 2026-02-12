/**
 * Smart Parse API Route
 *
 * This module provides intelligent infrastructure prompt parsing using LLM (Claude/OpenAI).
 * It analyzes user prompts in natural language and converts them into structured infrastructure specifications.
 *
 * @module api/parse
 *
 * @example
 * // POST request to parse a prompt
 * const response = await fetch('/api/parse', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     prompt: '3-tier web architecture with WAF',
 *     provider: 'claude',
 *     useLLM: true
 *   })
 * });
 *
 * @example
 * // GET request to check availability
 * const status = await fetch('/api/parse');
 * // Returns: { available: true, providers: { claude: true, openai: false }, features: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isInfraSpec } from '@/types/guards';
import type { InfraSpec } from '@/types';
import {
  INTENT_ANALYSIS_PROMPT,
  parseIntentResponse,
  applyIntentToSpec,
  IntentAnalysis,
} from '@/lib/parser/intelligentParser';
import { ConversationContext, SmartParseResult } from '@/lib/parser/UnifiedParser';
import { ParseRequestSchema } from '@/lib/validations/api';
import { sanitizeUserInput, validateOutputSafety } from '@/lib/security/llmSecurityControls';
import { recordLLMCall } from '@/lib/utils/llmMetrics';

/**
 * Request body for the smart parse endpoint.
 *
 * @interface SmartParseRequestBody
 * @property {string} prompt - The natural language prompt describing the infrastructure
 * @property {object} [context] - Optional context for contextual parsing
 * @property {InfraSpec | null} [context.currentSpec] - Current infrastructure specification
 * @property {Array<{prompt: string, timestamp: number}>} [context.history] - Prompt history
 * @property {'claude' | 'openai'} [provider='claude'] - LLM provider to use
 * @property {string} [model] - Specific model to use (e.g., 'claude-3-haiku-20240307')
 * @property {boolean} [useLLM=true] - Whether to use LLM for parsing (false uses rule-based)
 */
export interface SmartParseRequestBody {
  prompt: string;
  context?: {
    currentSpec?: InfraSpec | null;
    history?: Array<{ prompt: string; timestamp: number }>;
  };
  provider?: 'claude' | 'openai';
  model?: string;
  useLLM?: boolean;
}

/**
 * Response from the smart parse endpoint.
 *
 * @interface SmartParseResponse
 * @property {boolean} success - Whether the parsing was successful
 * @property {SmartParseResult} [result] - The parsed result with infrastructure spec
 * @property {IntentAnalysis} [intent] - The analyzed intent from the prompt
 * @property {string} [error] - Error message if parsing failed
 * @property {string} [rawResponse] - Raw LLM response for debugging
 */
export interface SmartParseResponse {
  success: boolean;
  result?: SmartParseResult;
  intent?: IntentAnalysis;
  error?: string;
  rawResponse?: string;
}

/**
 * Analyzes user intent using Claude API.
 *
 * Sends the prompt to Claude's API with context about the current architecture
 * and parses the response to extract intent analysis.
 *
 * @param {string} prompt - The user's natural language prompt
 * @param {InfraSpec | null} contextSpec - Current infrastructure spec for context
 * @param {string} apiKey - Anthropic API key
 * @param {string} [model='claude-3-haiku-20240307'] - Claude model to use
 * @returns {Promise<{intent: IntentAnalysis | null, rawResponse: string, error?: string}>}
 *          Returns the parsed intent, raw response, and optional error message
 *
 * @example
 * const result = await analyzeIntentWithClaude(
 *   'Add a WAF before the load balancer',
 *   currentSpec,
 *   process.env.ANTHROPIC_API_KEY
 * );
 * if (result.intent) {
 *   console.log(result.intent.components);
 * }
 */
async function analyzeIntentWithClaude(
  prompt: string,
  contextSpec: InfraSpec | null,
  apiKey: string,
  model: string = 'claude-3-haiku-20240307'
): Promise<{ intent: IntentAnalysis | null; rawResponse: string; error?: string }> {
  try {
    const contextDescription = contextSpec
      ? `\n\n현재 아키텍처:\n- 노드: ${contextSpec.nodes.map((n) => `${n.label}(${n.type})`).join(', ')}\n- 연결: ${contextSpec.connections.map((c) => `${c.source} -> ${c.target}`).join(', ')}`
      : '\n\n현재 아키텍처: 없음 (새로 생성 필요)';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: INTENT_ANALYSIS_PROMPT,
        messages: [
          {
            role: 'user',
            content: `사용자 프롬프트: "${prompt}"${contextDescription}\n\n위 프롬프트의 의도와 컴포넌트를 분석해주세요.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        intent: null,
        rawResponse: '',
        error: `Claude API Error: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    const intent = parseIntentResponse(content);

    return {
      intent,
      rawResponse: content,
      error: intent ? undefined : 'Failed to parse intent from LLM response',
    };
  } catch (error) {
    return {
      intent: null,
      rawResponse: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyzes user intent using OpenAI API.
 *
 * Sends the prompt to OpenAI's API with context about the current architecture
 * and parses the response to extract intent analysis.
 *
 * @param {string} prompt - The user's natural language prompt
 * @param {InfraSpec | null} contextSpec - Current infrastructure spec for context
 * @param {string} apiKey - OpenAI API key
 * @param {string} [model='gpt-4o-mini'] - OpenAI model to use
 * @returns {Promise<{intent: IntentAnalysis | null, rawResponse: string, error?: string}>}
 *          Returns the parsed intent, raw response, and optional error message
 *
 * @example
 * const result = await analyzeIntentWithOpenAI(
 *   'Create a VDI architecture with VPN',
 *   null,
 *   process.env.OPENAI_API_KEY
 * );
 */
async function analyzeIntentWithOpenAI(
  prompt: string,
  contextSpec: InfraSpec | null,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<{ intent: IntentAnalysis | null; rawResponse: string; error?: string }> {
  try {
    const contextDescription = contextSpec
      ? `\n\n현재 아키텍처:\n- 노드: ${contextSpec.nodes.map((n) => `${n.label}(${n.type})`).join(', ')}\n- 연결: ${contextSpec.connections.map((c) => `${c.source} -> ${c.target}`).join(', ')}`
      : '\n\n현재 아키텍처: 없음 (새로 생성 필요)';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: INTENT_ANALYSIS_PROMPT },
          {
            role: 'user',
            content: `사용자 프롬프트: "${prompt}"${contextDescription}\n\n위 프롬프트의 의도와 컴포넌트를 분석해주세요.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        intent: null,
        rawResponse: '',
        error: `OpenAI API Error: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const intent = parseIntentResponse(content);

    return {
      intent,
      rawResponse: content,
      error: intent ? undefined : 'Failed to parse intent from LLM response',
    };
  } catch (error) {
    return {
      intent: null,
      rawResponse: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST /api/parse - Smart Parsing Endpoint
 *
 * Parses a natural language prompt describing infrastructure architecture
 * using LLM-based intent analysis (Claude or OpenAI).
 *
 * @route POST /api/parse
 * @param {NextRequest} request - The incoming request containing SmartParseRequestBody
 * @returns {Promise<NextResponse<SmartParseResponse>>} JSON response with parsed result
 *
 * @throws {400} Invalid prompt - When prompt is missing or not a string
 * @throws {400} Unknown provider - When provider is neither 'claude' nor 'openai'
 * @throws {500} Server error - When an unexpected error occurs
 *
 * @example
 * // Request
 * POST /api/parse
 * {
 *   "prompt": "VDI with internal LLM integration",
 *   "provider": "claude",
 *   "useLLM": true,
 *   "context": {
 *     "currentSpec": null
 *   }
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "result": {
 *     "spec": { "nodes": [...], "connections": [...] },
 *     "commandType": "create"
 *   },
 *   "intent": {
 *     "intent": "create",
 *     "confidence": 0.95,
 *     "components": [...]
 *   }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SmartParseResponse>> {
  try {
    // CSRF protection — check Origin header
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: '허용되지 않은 요청입니다.' },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parsed = ParseRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { prompt: rawPrompt, context, provider, model, useLLM } = parsed.data;

    // Sanitize prompt (OWASP LLM01: Prompt Injection prevention)
    const prompt = sanitizeUserInput(rawPrompt);

    // Build conversation context
    const conversationContext: ConversationContext = {
      history: [],
      currentSpec: context?.currentSpec || null,
    };

    // If LLM is disabled, return with empty intent (fallback to rule-based)
    if (!useLLM) {
      return NextResponse.json({
        success: true,
        result: undefined,
        intent: undefined,
      });
    }

    // Get API key
    let apiKey: string | undefined;
    let analyzeFunction: typeof analyzeIntentWithClaude;

    if (provider === 'claude') {
      apiKey = process.env.ANTHROPIC_API_KEY;
      analyzeFunction = analyzeIntentWithClaude;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
      analyzeFunction = analyzeIntentWithOpenAI;
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    if (!apiKey) {
      // Return success but indicate LLM is not available
      return NextResponse.json({
        success: true,
        result: undefined,
        intent: undefined,
        error: `${provider} API key not configured`,
      });
    }

    // Analyze intent with LLM
    const parseStartTime = Date.now();
    const { intent, rawResponse, error } = await analyzeFunction(
      prompt,
      conversationContext.currentSpec,
      apiKey,
      model
    );
    const parseLatencyMs = Date.now() - parseStartTime;
    const parseModel = model || (provider === 'claude' ? 'claude-3-haiku-20240307' : 'gpt-4o-mini');

    if (!intent) {
      recordLLMCall({
        timestamp: new Date().toISOString(),
        provider: provider === 'openai' ? 'openai' : 'claude',
        model: parseModel,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: parseLatencyMs,
        success: false,
        errorType: error?.includes('API Error') ? 'api_error' : 'parse_failed',
        validationPassed: false,
      });
      return NextResponse.json({
        success: false,
        error: error || 'Failed to analyze intent',
        rawResponse,
      });
    }

    // Validate output safety (OWASP LLM02: Insecure Output Handling prevention)
    if (rawResponse) {
      const outputCheck = validateOutputSafety(rawResponse);
      if (!outputCheck.safe) {
        recordLLMCall({
          timestamp: new Date().toISOString(),
          provider: provider === 'openai' ? 'openai' : 'claude',
          model: parseModel,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs: parseLatencyMs,
          success: false,
          errorType: 'unsafe_output',
          validationPassed: false,
        });
        return NextResponse.json(
          {
            success: false,
            error: 'LLM 응답에서 안전하지 않은 패턴이 감지되었습니다.',
          },
          { status: 400 }
        );
      }
    }

    // Apply intent to generate result
    const result = applyIntentToSpec(intent, conversationContext);

    // Record successful LLM call
    recordLLMCall({
      timestamp: new Date().toISOString(),
      provider: provider === 'openai' ? 'openai' : 'claude',
      model: parseModel,
      promptTokens: 0,
      completionTokens: 0,
      latencyMs: parseLatencyMs,
      success: true,
      validationPassed: true,
      operationCount: result.spec?.nodes.length,
    });

    // Validate the spec if it exists
    if (result.spec && !isInfraSpec(result.spec)) {
      return NextResponse.json({
        success: false,
        error: 'Generated spec is invalid',
        intent,
        rawResponse,
      });
    }

    return NextResponse.json({
      success: true,
      result,
      intent,
      rawResponse,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parse - Check Smart Parsing Availability
 *
 * Returns the availability status of smart parsing features and
 * which LLM providers are configured.
 *
 * @route GET /api/parse
 * @returns {Promise<NextResponse>} JSON response with availability status
 *
 * @example
 * // Response
 * {
 *   "available": true,
 *   "providers": {
 *     "claude": true,
 *     "openai": false
 *   },
 *   "features": {
 *     "intentAnalysis": true,
 *     "positionParsing": true,
 *     "contextAwareness": true
 *   }
 * }
 */
export async function GET(): Promise<NextResponse> {
  const claudeConfigured = !!process.env.ANTHROPIC_API_KEY;
  const openaiConfigured = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    available: claudeConfigured || openaiConfigured,
    providers: {
      claude: claudeConfigured,
      openai: openaiConfigured,
    },
    features: {
      intentAnalysis: true,
      positionParsing: true,
      contextAwareness: true,
    },
  });
}
