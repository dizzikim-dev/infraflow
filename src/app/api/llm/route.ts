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
import { isInfraSpec } from '@/types/guards';
import type { InfraSpec } from '@/types';
import { withRetry, isRetryableError } from '@/lib/utils/retry';
import { checkRateLimit, LLM_RATE_LIMIT, type RateLimitInfo } from '@/lib/middleware/rateLimiter';

/**
 * Request body for the LLM generation endpoint.
 *
 * @interface LLMRequestBody
 * @property {string} prompt - Natural language description of the infrastructure
 * @property {'claude' | 'openai'} provider - LLM provider to use
 * @property {string} [model] - Specific model ID (e.g., 'claude-3-haiku-20240307', 'gpt-4o-mini')
 * @property {boolean} [useFallback=true] - Whether to use fallback templates on LLM failure
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
 *
 * @interface LLMResponse
 * @property {boolean} success - Whether the generation was successful
 * @property {InfraSpec} [spec] - The generated infrastructure specification
 * @property {string} [error] - Error message if generation failed
 * @property {string} [rawResponse] - Raw LLM response for debugging
 * @property {boolean} [fromFallback] - True if result came from fallback template
 * @property {number} [attempts] - Number of retry attempts made
 * @property {object} [rateLimit] - Rate limit information
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
 * Parses JSON from LLM response, handling various formats.
 *
 * LLM responses may contain JSON in different formats:
 * - Direct JSON object
 * - JSON wrapped in markdown code blocks (```json ... ```)
 * - JSON embedded within other text
 *
 * @param {string} content - Raw LLM response content
 * @returns {InfraSpec | null} Parsed infrastructure spec or null if parsing fails
 *
 * @example
 * const spec = parseJSONResponse('```json\n{"nodes": [...], "connections": [...]}\n```');
 */
function parseJSONResponse(content: string): InfraSpec | null {
  const tryParse = (jsonStr: string): unknown => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  // Try direct parse first
  let parsed = tryParse(content);
  if (parsed && isInfraSpec(parsed)) {
    return parsed;
  }

  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    parsed = tryParse(jsonMatch[1].trim());
    if (parsed && isInfraSpec(parsed)) {
      return parsed;
    }
  }

  // Try to find JSON object in response
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    parsed = tryParse(objectMatch[0]);
    if (parsed && isInfraSpec(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Makes a single API call to Claude for infrastructure generation.
 *
 * @param {string} prompt - The infrastructure description prompt
 * @param {string} apiKey - Anthropic API key
 * @param {string} [model='claude-3-haiku-20240307'] - Claude model to use
 * @returns {Promise<LLMResponse>} Response with generated spec or error
 * @throws {Error} When API call fails
 */
async function callClaudeOnce(
  prompt: string,
  apiKey: string,
  model: string = 'claude-3-haiku-20240307'
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

  const spec = parseJSONResponse(content);

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
 *
 * Implements exponential backoff retry for transient failures.
 * Retries on network errors, rate limits, and parse failures.
 *
 * @param {string} prompt - The infrastructure description prompt
 * @param {string} apiKey - Anthropic API key
 * @param {string} [model='claude-3-haiku-20240307'] - Claude model to use
 * @returns {Promise<LLMResponse>} Response with generated spec, retry count, or error
 */
async function callClaude(
  prompt: string,
  apiKey: string,
  model: string = 'claude-3-haiku-20240307'
): Promise<LLMResponse> {
  const result = await withRetry(
    () => callClaudeOnce(prompt, apiKey, model),
    {
      maxAttempts: LLM_CONFIG.maxRetries,
      timeoutMs: LLM_CONFIG.timeoutMs,
      initialDelayMs: LLM_CONFIG.initialDelayMs,
      isRetryable: (error) => {
        // Also retry on parse failures that might be transient
        if (error instanceof Error && error.message.includes('parse')) {
          return true;
        }
        return isRetryableError(error);
      },
      onRetry: (attempt, error) => {
        console.log(`[LLM] Claude retry attempt ${attempt}:`, error);
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
 *
 * @param {string} prompt - The infrastructure description prompt
 * @param {string} apiKey - OpenAI API key
 * @param {string} [model='gpt-4o-mini'] - OpenAI model to use
 * @returns {Promise<LLMResponse>} Response with generated spec or error
 * @throws {Error} When API call fails
 */
async function callOpenAIOnce(
  prompt: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
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

  const spec = parseJSONResponse(content);

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
 *
 * Implements exponential backoff retry for transient failures.
 * Retries on network errors, rate limits, and parse failures.
 *
 * @param {string} prompt - The infrastructure description prompt
 * @param {string} apiKey - OpenAI API key
 * @param {string} [model='gpt-4o-mini'] - OpenAI model to use
 * @returns {Promise<LLMResponse>} Response with generated spec, retry count, or error
 */
async function callOpenAI(
  prompt: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
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
        console.log(`[LLM] OpenAI retry attempt ${attempt}:`, error);
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
 * Fallback templates for common architecture patterns.
 *
 * These templates are used when LLM is unavailable or fails.
 * Each template provides a complete infrastructure specification
 * for commonly requested architecture patterns.
 *
 * @constant
 * @type {Record<string, InfraSpec>}
 *
 * Available templates:
 * - `3tier`: Standard 3-tier web architecture with LB, web, app, and DB layers
 * - `web-secure`: Secure web architecture with firewall and WAF
 * - `vdi`: Virtual Desktop Infrastructure with VPN and AD
 * - `default`: Basic firewall-protected server setup
 */
const FALLBACK_TEMPLATES: Record<string, InfraSpec> = {
  '3tier': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web', type: 'web-server', label: 'Web Server', zone: 'internal' },
      { id: 'app', type: 'app-server', label: 'App Server', zone: 'internal' },
      { id: 'db', type: 'db-server', label: 'DB Server', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'lb' },
      { source: 'lb', target: 'web' },
      { source: 'web', target: 'app' },
      { source: 'app', target: 'db' },
    ],
  },
  'web-secure': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'dmz' },
      { id: 'waf', type: 'waf', label: 'WAF', zone: 'dmz' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web', type: 'web-server', label: 'Web Server', zone: 'internal' },
      { id: 'db', type: 'db-server', label: 'DB Server', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'fw' },
      { source: 'fw', target: 'waf' },
      { source: 'waf', target: 'lb' },
      { source: 'lb', target: 'web' },
      { source: 'web', target: 'db' },
    ],
  },
  'vdi': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'vpn', type: 'vpn-gateway', label: 'VPN Gateway', zone: 'dmz' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'internal' },
      { id: 'vdi', type: 'vm', label: 'VDI Server', zone: 'internal' },
      { id: 'ad', type: 'ldap-ad', label: 'Active Directory', zone: 'internal' },
      { id: 'storage', type: 'storage', label: 'Storage', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'vpn' },
      { source: 'vpn', target: 'fw' },
      { source: 'fw', target: 'vdi' },
      { source: 'vdi', target: 'ad' },
      { source: 'vdi', target: 'storage' },
    ],
  },
  'default': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'dmz' },
      { id: 'server', type: 'web-server', label: 'Server', zone: 'internal' },
    ],
    connections: [
      { source: 'user', target: 'fw' },
      { source: 'fw', target: 'server' },
    ],
  },
};

/**
 * Matches a prompt to the most appropriate fallback template.
 *
 * Uses keyword matching to determine which template best fits
 * the user's request when LLM is unavailable.
 *
 * @param {string} prompt - The user's infrastructure description
 * @returns {InfraSpec} The matching template specification
 *
 * @example
 * const spec = matchFallbackTemplate('VDI with VPN');
 * // Returns the 'vdi' template
 *
 * @example
 * const spec = matchFallbackTemplate('3-tier web application');
 * // Returns the '3tier' template
 */
function matchFallbackTemplate(prompt: string): InfraSpec {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('vdi') || lowerPrompt.includes('가상데스크톱')) {
    return FALLBACK_TEMPLATES['vdi'];
  }

  if (
    lowerPrompt.includes('3티어') ||
    lowerPrompt.includes('3-tier') ||
    lowerPrompt.includes('three tier')
  ) {
    return FALLBACK_TEMPLATES['3tier'];
  }

  if (
    lowerPrompt.includes('waf') ||
    lowerPrompt.includes('보안') ||
    lowerPrompt.includes('secure')
  ) {
    return FALLBACK_TEMPLATES['web-secure'];
  }

  return FALLBACK_TEMPLATES['default'];
}

/**
 * Adds rate limit headers to the response.
 *
 * Sets standard X-RateLimit-* headers to inform clients about
 * their current rate limit status.
 *
 * @template T
 * @param {NextResponse<T>} response - The response to add headers to
 * @param {RateLimitInfo} info - Rate limit information
 * @returns {NextResponse<T>} The response with rate limit headers added
 *
 * Headers added:
 * - X-RateLimit-Limit: Maximum requests per window
 * - X-RateLimit-Remaining: Requests remaining in current window
 * - X-RateLimit-Reset: Unix timestamp when the window resets
 * - X-RateLimit-Daily-Limit: Maximum daily requests (if applicable)
 * - X-RateLimit-Daily-Remaining: Daily requests remaining (if applicable)
 */
function addRateLimitHeaders<T>(
  response: NextResponse<T>,
  info: RateLimitInfo
): NextResponse<T> {
  response.headers.set('X-RateLimit-Limit', info.limit.toString());
  response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    Math.ceil((Date.now() + info.resetIn) / 1000).toString()
  );

  if (info.dailyLimit) {
    response.headers.set('X-RateLimit-Daily-Limit', info.dailyLimit.toString());
    response.headers.set(
      'X-RateLimit-Daily-Remaining',
      Math.max(0, info.dailyLimit - (info.dailyUsage || 0)).toString()
    );
  }

  return response;
}

/**
 * POST /api/llm - LLM Infrastructure Generation Endpoint
 *
 * Generates infrastructure specifications from natural language prompts
 * using LLM (Claude or OpenAI) with retry logic, fallback templates,
 * and rate limiting.
 *
 * @route POST /api/llm
 * @param {NextRequest} request - The incoming request containing LLMRequestBody
 * @returns {Promise<NextResponse<LLMResponse>>} JSON response with generated spec
 *
 * @throws {400} Invalid prompt - When prompt is missing or not a string
 * @throws {400} Unknown provider - When provider is invalid
 * @throws {429} Rate limit exceeded - When too many requests
 * @throws {500} Server error - When an unexpected error occurs
 *
 * @example
 * // Request
 * POST /api/llm
 * {
 *   "prompt": "3-tier web architecture with WAF and CDN",
 *   "provider": "claude",
 *   "useFallback": true
 * }
 *
 * // Success Response
 * {
 *   "success": true,
 *   "spec": { "nodes": [...], "connections": [...] },
 *   "attempts": 1,
 *   "rateLimit": { "limit": 10, "remaining": 9 }
 * }
 *
 * // Fallback Response (when LLM unavailable)
 * {
 *   "success": true,
 *   "spec": { "nodes": [...], "connections": [...] },
 *   "fromFallback": true
 * }
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
    const body: LLMRequestBody = await request.json();
    const { prompt, provider, model, useFallback = true } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // Get API key from server-side environment variables (not NEXT_PUBLIC_)
    let apiKey: string | undefined;
    let result: LLMResponse;

    if (provider === 'claude') {
      apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        // Try fallback if no API key
        if (useFallback) {
          console.log('[LLM] No Claude API key, using fallback template');
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
        // Try fallback if no API key
        if (useFallback) {
          console.log('[LLM] No OpenAI API key, using fallback template');
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

    // Rate limit info to include in response
    const rateLimitInfo = {
      limit: info.limit,
      remaining: info.remaining,
      dailyUsage: info.dailyUsage,
      dailyLimit: info.dailyLimit,
    };

    // If LLM call failed and fallback is enabled, use template
    if (!result.success && useFallback) {
      console.log('[LLM] LLM call failed, using fallback template:', result.error);
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
 *
 * Returns information about which LLM providers are configured
 * and available for use.
 *
 * @route GET /api/llm
 * @returns {Promise<NextResponse>} JSON response with configuration status
 *
 * @example
 * // Response when Claude is configured
 * {
 *   "configured": true,
 *   "providers": {
 *     "claude": true,
 *     "openai": false
 *   }
 * }
 */
export async function GET(): Promise<NextResponse> {
  const claudeConfigured = !!process.env.ANTHROPIC_API_KEY;
  const openaiConfigured = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    configured: claudeConfigured || openaiConfigured,
    providers: {
      claude: claudeConfigured,
      openai: openaiConfigured,
    },
  });
}
