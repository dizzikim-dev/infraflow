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
import type { InfraSpec, InfraNodeType } from '@/types';
import { withRetry, isRetryableError } from '@/lib/utils/retry';
import { checkRateLimit, LLM_RATE_LIMIT, DEFAULT_RATE_LIMIT } from '@/lib/middleware/rateLimiter';
import { createLogger } from '@/lib/utils/logger';
import { addRateLimitHeaders } from '@/lib/llm/rateLimitHeaders';
import { getProviderStatus } from '@/lib/llm/providers';
import { parseJSONFromLLMResponse, parseEnhancedLLMResponse } from '@/lib/llm/jsonParser';
import type { StructuredResponseMeta } from '@/types/structuredResponse';
import { matchFallbackTemplate } from '@/lib/llm/fallbackTemplates';
import { LLM_MODELS } from '@/lib/llm/models';
import { createLLMProvider } from '@/lib/llm/provider';
import { LLMRequestSchema } from '@/lib/validations/api';
import { checkRequestSize } from '@/lib/api/analyzeRouteUtils';
import {
  enrichContext,
  buildKnowledgePromptSection,
  RELATIONSHIPS,
  ANTI_PATTERNS,
  FAILURES,
} from '@/lib/knowledge';
import { AVAILABLE_COMPONENTS } from '@/lib/parser/prompts';
import type { DiagramContext } from '@/lib/parser/prompts';
import { redactSensitiveData, sanitizeUserInput, validateOutputSafety } from '@/lib/security/llmSecurityControls';
import type { PIDocument } from '@/lib/knowledge/types';
import { getEnv } from '@/lib/config/env';

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
  meta?: StructuredResponseMeta | null;
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

// LLM configuration — reads from env with sensible defaults
const LLM_CONFIG = (() => {
  const env = getEnv();
  return {
    maxRetries: env.LLM_MAX_RETRIES,
    timeoutMs: env.LLM_TIMEOUT_MS,
    initialDelayMs: 1000,
  };
})();

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
- AI Compute: gpu-server, ai-accelerator, edge-device, mobile-device, ai-cluster, model-registry
- AI Service: inference-engine, vector-db, ai-gateway, ai-orchestrator, embedding-service, training-platform, prompt-manager, ai-monitor

Guidelines:
1. Always start with a "user" node for client-facing architectures
2. Use logical flow from left to right (user -> security -> compute -> database)
3. Include appropriate security layers (firewall, WAF) for web architectures
4. Use descriptive labels in Korean when the input is in Korean
5. Create realistic connection flows based on the architecture type

Output a JSON object. Two supported formats:

Format A (enhanced — preferred):
{
  "spec": { "nodes": [...], "connections": [...], "zones": [...] },
  "meta": {
    "summary": "3-5 line conclusion in the user's language",
    "assumptions": ["assumption 1", "assumption 2"],
    "options": [
      { "name": "Option A", "pros": ["..."], "cons": ["..."], "estimatedCostRange": "$X-$Y/mo" },
      { "name": "Option B", "pros": ["..."], "cons": ["..."] }
    ],
    "tradeoffs": ["tradeoff description"],
    "artifacts": ["terraform", "kubernetes", "checklist"]
  }
}

Format B (legacy — acceptable):
{ "nodes": [...], "connections": [...], "zones": [...] }

Always include at least 2 options in meta.options. The spec is REQUIRED. Meta is RECOMMENDED but optional.
Only output valid JSON. No additional text.`;

/**
 * Keyword aliases mapping common terms to InfraNodeType values.
 * Used for extracting node types from natural language prompts.
 */
const KEYWORD_ALIASES: Record<string, InfraNodeType> = {
  vpn: 'vpn-gateway',
  'load balancer': 'load-balancer',
  lb: 'load-balancer',
  k8s: 'kubernetes',
  ad: 'ldap-ad',
  'active directory': 'ldap-ad',
  ldap: 'ldap-ad',
  database: 'db-server',
  db: 'db-server',
  web: 'web-server',
  app: 'app-server',
  aws: 'aws-vpc',
  azure: 'azure-vnet',
  gcp: 'gcp-network',
  nas: 'san-nas',
  san: 'san-nas',
  s3: 'object-storage',
  blob: 'object-storage',
  redis: 'cache',
  memcached: 'cache',
  nginx: 'web-server',
  apache: 'web-server',
  docker: 'container',
  vdi: 'vm',
  'ids/ips': 'ids-ips',
  ids: 'ids-ips',
  ips: 'ids-ips',
  siem: 'siem',
  soar: 'soar',
  casb: 'casb',
  sase: 'sase-gateway',
  ztna: 'ztna-broker',
  ollama: 'inference-engine',
  vllm: 'inference-engine',
  'llama.cpp': 'inference-engine',
  gpu: 'gpu-server',
  chromadb: 'vector-db',
  pinecone: 'vector-db',
  langchain: 'ai-orchestrator',
  llamaindex: 'ai-orchestrator',
  mlflow: 'ai-monitor',
  slack: 'api-gateway',
  discord: 'api-gateway',
  termux: 'mobile-device',
};

/** All known InfraNodeType values, derived from AVAILABLE_COMPONENTS */
const ALL_INFRA_NODE_TYPES: InfraNodeType[] = Object.values(AVAILABLE_COMPONENTS).flat();

/**
 * Extract potential InfraNodeType values from a user prompt using keyword matching.
 *
 * Checks for:
 * 1. Exact InfraNodeType matches (e.g., "firewall", "load-balancer")
 * 2. Keyword aliases (e.g., "VPN" -> "vpn-gateway", "k8s" -> "kubernetes")
 *
 * @param prompt - The user's natural language prompt
 * @returns Array of unique InfraNodeType values found in the prompt
 */
export function extractNodeTypesFromPrompt(prompt: string): InfraNodeType[] {
  const lowerPrompt = prompt.toLowerCase();
  const foundTypes = new Set<InfraNodeType>();

  // Check exact InfraNodeType matches
  for (const nodeType of ALL_INFRA_NODE_TYPES) {
    if (lowerPrompt.includes(nodeType)) {
      foundTypes.add(nodeType);
    }
  }

  // Check keyword aliases
  for (const [keyword, nodeType] of Object.entries(KEYWORD_ALIASES)) {
    if (lowerPrompt.includes(keyword)) {
      foundTypes.add(nodeType);
    }
  }

  return [...foundTypes];
}

/**
 * Build an enriched system prompt by appending knowledge graph context.
 *
 * Extracts potential node types from the user's prompt, performs a RAG search
 * for Product Intelligence data, builds a minimal DiagramContext, runs
 * enrichContext() + buildKnowledgePromptSection(), and appends the result
 * to the base SYSTEM_PROMPT.
 *
 * The RAG search runs regardless of keyword extraction results — users may
 * mention product names (e.g., "OpenClaw") that aren't in the keyword aliases
 * but ARE present in the PI data.
 *
 * Falls back to the static SYSTEM_PROMPT if enrichment fails or produces
 * no additional knowledge.
 *
 * @param prompt - The user's natural language prompt
 * @returns The enriched system prompt string
 */
export async function buildEnrichedSystemPrompt(prompt: string): Promise<string> {
  try {
    const nodeTypes = extractNodeTypesFromPrompt(prompt);

    // RAG search for Product Intelligence (runs regardless of keyword extraction)
    let piDocuments: PIDocument[] = [];
    try {
      const { searchProductIntelligence } = await import('@/lib/rag');
      const ragResult = await searchProductIntelligence(prompt, { topK: 10 });
      piDocuments = ragResult.documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata,
        score: doc.score,
        collection: doc.collection,
      }));
      if (piDocuments.length > 0) {
        log.debug('RAG search returned PI documents', { count: piDocuments.length });
      }
    } catch {
      // RAG unavailable — continue without PI data
    }

    if (nodeTypes.length === 0 && piDocuments.length === 0) {
      log.debug('No node types or PI data found, using base system prompt');
      return SYSTEM_PROMPT;
    }

    // Build a minimal DiagramContext from extracted node types
    // (even if nodeTypes is empty, enrichContext handles it gracefully)
    const context: DiagramContext = {
      nodes: nodeTypes.map((type, index) => ({
        id: `extracted-${index}`,
        type,
        label: type,
        category: '',
        zone: '',
        connectedTo: [],
        connectedFrom: [],
      })),
      connections: [],
      summary: `Extracted from prompt: ${nodeTypes.join(', ')}`,
    };

    // Enrich with knowledge graph
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      antiPatterns: [...ANTI_PATTERNS],
      failureScenarios: [...FAILURES],
    });

    // Inject PI documents into enriched context
    if (piDocuments.length > 0) {
      enriched.productIntelligence = piDocuments;
    }

    const knowledgeSection = buildKnowledgePromptSection(enriched);

    if (!knowledgeSection) {
      log.debug('Knowledge enrichment produced no additional content');
      return SYSTEM_PROMPT;
    }

    log.debug('Knowledge section injected into system prompt', {
      nodeTypes: nodeTypes.length,
      piDocuments: piDocuments.length,
      sectionLength: knowledgeSection.length,
    });

    return `${SYSTEM_PROMPT}\n\n${knowledgeSection}`;
  } catch (error) {
    log.warn('Knowledge enrichment failed, using base system prompt', {
      error: error instanceof Error ? error.message : String(error),
    });
    return SYSTEM_PROMPT;
  }
}

/**
 * Makes a single API call to any LLM provider using the provider abstraction.
 */
async function callProviderOnce(
  prompt: string,
  apiKey: string,
  providerType: 'claude' | 'openai',
  model?: string,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<LLMResponse> {
  const provider = createLLMProvider(providerType);
  const req = provider.buildRequest({
    apiKey,
    prompt,
    systemPrompt,
    model: model || provider.defaultModel,
    maxTokens: 2048,
  });

  const response = await fetch(req.url, {
    method: 'POST',
    headers: req.headers,
    body: req.body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = provider.extractContent(data);

  if (!content) {
    throw new Error('No response from API');
  }

  const enhanced = parseEnhancedLLMResponse(content);

  if (!enhanced.spec) {
    return {
      success: false,
      error: 'Failed to parse JSON response or invalid spec format',
      rawResponse: content,
    };
  }

  return {
    success: true,
    spec: enhanced.spec,
    meta: enhanced.meta,
    rawResponse: content,
  };
}

/**
 * Calls any LLM provider with automatic retry logic.
 */
async function callProvider(
  prompt: string,
  apiKey: string,
  providerType: 'claude' | 'openai',
  model?: string,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<LLMResponse> {
  const providerLabel = providerType === 'claude' ? 'Claude' : 'OpenAI';

  const result = await withRetry(
    () => callProviderOnce(prompt, apiKey, providerType, model, systemPrompt),
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
        log.warn(`${providerLabel} retry attempt ${attempt}`, { error: String(error) });
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
  // Check request size
  const sizeError = checkRequestSize(request);
  if (sizeError) return sizeError as NextResponse<LLMResponse>;

  // Check rate limit first
  const { allowed, info, response: rateLimitResponse } = await checkRateLimit(
    request,
    LLM_RATE_LIMIT
  );

  if (!allowed && rateLimitResponse) {
    return rateLimitResponse as NextResponse<LLMResponse>;
  }

  // Extract request ID from middleware for audit trail
  const requestId = request.headers.get('x-request-id') || 'unknown';

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
    const modelId = model || (provider === 'claude' ? LLM_MODELS.ANTHROPIC_DEFAULT : LLM_MODELS.OPENAI_DEFAULT);
    log.info('LLM request received', { requestId, provider, model: modelId });

    // Sanitize user prompt before LLM processing
    const sanitizedPrompt = sanitizeUserInput(prompt);

    // Detect API keys in user input
    const inputSafetyCheck = validateOutputSafety(sanitizedPrompt);
    if (!inputSafetyCheck.safe) {
      return NextResponse.json({
        success: false,
        error: '프롬프트에 민감한 정보(API 키 등)가 포함되어 있습니다. 제거 후 다시 시도하세요. / Sensitive information (API keys) detected in prompt. Please remove and try again.',
      }, { status: 400 });
    }

    // Build enriched system prompt ONCE per request (not per retry)
    const enrichedPrompt = await buildEnrichedSystemPrompt(sanitizedPrompt);

    // Get API key from server-side environment variables via provider abstraction
    // NOTE: Provider reads process.env directly (not via getEnv()) because tests
    // dynamically manipulate API keys between calls and getEnv() caches.
    const llmProvider = createLLMProvider(provider as 'claude' | 'openai');
    const apiKey = llmProvider.getApiKey();

    if (!apiKey) {
      if (useFallback) {
        log.info(`No ${provider} API key, using fallback template`);
        return NextResponse.json({
          success: true,
          spec: matchFallbackTemplate(sanitizedPrompt),
          fromFallback: true,
        });
      }
      return NextResponse.json(
        { success: false, error: `${provider === 'claude' ? 'Claude' : 'OpenAI'} API key not configured` },
        { status: 500 }
      );
    }

    const result = await callProvider(sanitizedPrompt, apiKey, provider as 'claude' | 'openai', model, enrichedPrompt);

    // Pick only client-relevant rate limit fields
    const { limit, remaining, dailyUsage, dailyLimit } = info;
    const rateLimitInfo = { limit, remaining, dailyUsage, dailyLimit };

    // If LLM call failed and fallback is enabled, use template
    if (!result.success && useFallback) {
      log.warn('LLM call failed, using fallback template', { error: result.error });
      const response = NextResponse.json({
        success: true,
        spec: matchFallbackTemplate(sanitizedPrompt),
        fromFallback: true,
        error: result.error,
        attempts: result.attempts,
        rateLimit: rateLimitInfo,
      });
      return addRateLimitHeaders(response, info);
    }

    // Redact any sensitive data (API keys, tokens) from raw LLM output
    const sanitizedResult = {
      ...result,
      rawResponse: result.rawResponse ? redactSensitiveData(result.rawResponse) : result.rawResponse,
      rateLimit: rateLimitInfo,
    };

    log.info('LLM request completed', { requestId, provider, success: result.success, attempts: result.attempts });

    const response = NextResponse.json(sanitizedResult);
    return addRateLimitHeaders(response, info);
  } catch (error) {
    log.error('LLM request failed', error instanceof Error ? error : undefined, { requestId });
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
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { allowed, response: rateLimitResponse } = await checkRateLimit(request, DEFAULT_RATE_LIMIT);
  if (!allowed && rateLimitResponse) return rateLimitResponse;

  const providers = getProviderStatus();

  return NextResponse.json({
    configured: providers.claude || providers.openai,
    providers,
  });
}
