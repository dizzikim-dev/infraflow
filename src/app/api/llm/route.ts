/**
 * LLM API Route
 *
 * This module provides direct LLM-based infrastructure diagram generation.
 * It converts natural language prompts directly into infrastructure specifications
 * with built-in retry logic, fallback templates, and rate limiting.
 *
 * @module api/llm
 *
 * @example
 * // POST request to generate infrastructure spec
 * const response = await fetch('/api/llm', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     prompt: 'VDI architecture with VPN and AD',
 *     provider: 'claude',
 *     useFallback: true
 *   })
 * });
 *
 * @example
 * // GET request to check LLM configuration
 * const status = await fetch('/api/llm');
 * // Returns: { configured: true, providers: { claude: true, openai: false } }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { InfraSpec } from '@/types';
import { withRetry, isRetryableError } from '@/lib/utils/retry';
import { checkRateLimit, LLM_RATE_LIMIT } from '@/lib/middleware/rateLimiter';
import { createLogger } from '@/lib/utils/logger';
import { addRateLimitHeaders } from '@/lib/llm/rateLimitHeaders';
import { getProviderStatus } from '@/lib/llm/providers';
import { parseJSONFromLLMResponse } from '@/lib/llm/jsonParser';
import { matchFallbackTemplate } from '@/lib/llm/fallbackTemplates';
import { LLM_MODELS } from '@/lib/llm/models';
import { LLMRequestSchema } from '@/lib/validations/api';

const log = createLogger('LLM');

/**
 * Request body for the LLM generation endpoint.
 */
export interface LLMRequestBody {
  prompt: string;
  provider: 'claude' | 'openai';
  model?: string;
  /** Use fallback templates if LLM fails */
  useFallback?: boolean;
}

/**
 * Response from the LLM generation endpoint.
 */
export interface LLMResponse {
  success: boolean;
  spec?: InfraSpec;
  error?: string;
  rawResponse?: string;
  /** Indicates response came from fallback */
  fromFallback?: boolean;
  /** Number of retry attempts made */
  attempts?: number;
  /** Rate limit info */
  rateLimit?: {
    limit: number;
    remaining: number;
    dailyUsage?: number;
    dailyLimit?: number;
  };
}

// LLM configuration
const LLM_CONFIG = {
  maxRetries: 3,
  timeoutMs: 30000,
  initialDelayMs: 1000,
};

const SYSTEM_PROMPT = `You are an infrastructure architecture expert. Parse the user's natural language description and convert it into a structured JSON specification.

Output Format:
{
  "nodes": [
    { "id": "unique-id", "type": "node-type", "label": "Display Name", "zone": "optional-zone" }
  ],
  "connections": [
    { "source": "node-id", "target": "node-id", "flowType": "request|response|sync|blocked|encrypted", "label": "optional" }
  ],
  "zones": [
    { "id": "zone-id", "label": "Zone Name", "type": "dmz|internal|external|db|custom" }
  ]
}

Available node types:
- Security: firewall, waf, ids-ips, vpn-gateway, nac, dlp
- Network: router, switch-l2, switch-l3, load-balancer, sd-wan, dns, cdn
- Compute: web-server, app-server, db-server, container, vm, kubernetes
- Cloud: aws-vpc, azure-vnet, gcp-network, private-cloud
- Storage: san-nas, object-storage, backup, cache, storage
- Auth: ldap-ad, sso, mfa, iam
- External: user, internet

Guidelines:
1. Always start with a "user" node for client-facing architectures
2. Use logical flow from left to right (user -> security -> compute -> database)
3. Include appropriate security layers (firewall, WAF) for web architectures
4. Use descriptive labels in Korean when the input is in Korean
5. Create realistic connection flows based on the architecture type

Only output valid JSON. No explanations.`;

/**
 * Makes a single API call to Claude for infrastructure generation.
 */
async function callClaudeOnce(
  prompt: string,
  apiKey: string,
  model: string = LLM_MODELS.ANTHROPIC_DEFAULT
): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Convert this infrastructure description to JSON:\n\n${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No response from API');
  }

  const spec = parseJSONFromLLMResponse(content);

  if (!spec) {
    return {
      success: false,
      error: 'Failed to parse JSON response or invalid spec format',
      rawResponse: content,
    };
  }

  return {
    success: true,
    spec,
    rawResponse: content,
  };
}

/**
 * Calls Claude API with automatic retry logic.
 */
async function callClaude(
  prompt: string,
  apiKey: string,
  model: string = LLM_MODELS.ANTHROPIC_DEFAULT
): Promise<LLMResponse> {
  const result = await withRetry(
    () => callClaudeOnce(prompt, apiKey, model),
    {
      maxAttempts: LLM_CONFIG.maxRetries,
      timeoutMs: LLM_CONFIG.timeoutMs,
      initialDelayMs: LLM_CONFIG.initialDelayMs,
      isRetryable: (error) => {
        if (error instanceof Error && error.message.includes('parse')) {
          return true;
        }
        return isRetryableError(error);
      },
      onRetry: (attempt, error) => {
        log.warn(`Claude retry attempt ${attempt}`, { error: String(error) });
      },
    }
  );

  if (result.success && result.data) {
    return { ...result.data, attempts: result.attempts };
  }

  return {
    success: false,
    error: result.error?.message || 'Unknown error after retries',
    attempts: result.attempts,
  };
}

/**
 * Makes a single API call to OpenAI for infrastructure generation.
 */
async function callOpenAIOnce(
  prompt: string,
  apiKey: string,
  model: string = LLM_MODELS.OPENAI_DEFAULT
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Convert this infrastructure description to JSON:\n\n${prompt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from API');
  }

  const spec = parseJSONFromLLMResponse(content);

  if (!spec) {
    return {
      success: false,
      error: 'Failed to parse JSON response or invalid spec format',
      rawResponse: content,
    };
  }

  return {
    success: true,
    spec,
    rawResponse: content,
  };
}

/**
 * Calls OpenAI API with automatic retry logic.
 */
async function callOpenAI(
  prompt: string,
  apiKey: string,
  model: string = LLM_MODELS.OPENAI_DEFAULT
): Promise<LLMResponse> {
  const result = await withRetry(
    () => callOpenAIOnce(prompt, apiKey, model),
    {
      maxAttempts: LLM_CONFIG.maxRetries,
      timeoutMs: LLM_CONFIG.timeoutMs,
      initialDelayMs: LLM_CONFIG.initialDelayMs,
      isRetryable: (error) => {
        if (error instanceof Error && error.message.includes('parse')) {
          return true;
        }
        return isRetryableError(error);
      },
      onRetry: (attempt, error) => {
        log.warn(`OpenAI retry attempt ${attempt}`, { error: String(error) });
      },
    }
  );

  if (result.success && result.data) {
    return { ...result.data, attempts: result.attempts };
  }

  return {
    success: false,
    error: result.error?.message || 'Unknown error after retries',
    attempts: result.attempts,
  };
}

/**
 * POST /api/llm - LLM Infrastructure Generation Endpoint
 */
export async function POST(request: NextRequest): Promise<NextResponse<LLMResponse>> {
  // Check rate limit first
  const { allowed, info, response: rateLimitResponse } = checkRateLimit(
    request,
    LLM_RATE_LIMIT
  );

  if (!allowed && rateLimitResponse) {
    return rateLimitResponse as NextResponse<LLMResponse>;
  }

  try {
    const rawBody = await request.json();
    const parsed = LLMRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { prompt, provider, model, useFallback } = parsed.data;

    // Get API key from server-side environment variables (not NEXT_PUBLIC_)
    let apiKey: string | undefined;
    let result: LLMResponse;

    if (provider === 'claude') {
      apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        if (useFallback) {
          log.info('No Claude API key, using fallback template');
          return NextResponse.json({
            success: true,
            spec: matchFallbackTemplate(prompt),
            fromFallback: true,
          });
        }
        return NextResponse.json(
          { success: false, error: 'Claude API key not configured' },
          { status: 500 }
        );
      }
      result = await callClaude(prompt, apiKey, model);
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        if (useFallback) {
          log.info('No OpenAI API key, using fallback template');
          return NextResponse.json({
            success: true,
            spec: matchFallbackTemplate(prompt),
            fromFallback: true,
          });
        }
        return NextResponse.json(
          { success: false, error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
      result = await callOpenAI(prompt, apiKey, model);
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    // Pick only client-relevant rate limit fields
    const { limit, remaining, dailyUsage, dailyLimit } = info;
    const rateLimitInfo = { limit, remaining, dailyUsage, dailyLimit };

    // If LLM call failed and fallback is enabled, use template
    if (!result.success && useFallback) {
      log.warn('LLM call failed, using fallback template', { error: result.error });
      const response = NextResponse.json({
        success: true,
        spec: matchFallbackTemplate(prompt),
        fromFallback: true,
        error: result.error,
        attempts: result.attempts,
        rateLimit: rateLimitInfo,
      });
      return addRateLimitHeaders(response, info);
    }

    const response = NextResponse.json({
      ...result,
      rateLimit: rateLimitInfo,
    });
    return addRateLimitHeaders(response, info);
  } catch (error) {
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    );
    return addRateLimitHeaders(response, info);
  }
}

/**
 * GET /api/llm - Check LLM Configuration Status
 */
export async function GET(): Promise<NextResponse> {
  const providers = getProviderStatus();

  return NextResponse.json({
    configured: providers.claude || providers.openai,
    providers,
  });
}
