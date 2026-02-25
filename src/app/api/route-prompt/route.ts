/**
 * Prompt Router API
 *
 * POST /api/route-prompt
 *
 * Lightweight Haiku-based router that decides whether a template match
 * is semantically appropriate for a given user prompt. Used when the
 * local parser's confidence is in the "uncertain" range (0.5–0.89).
 *
 * Security: CSRF + rate limit (shared LLM_RATE_LIMIT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, LLM_RATE_LIMIT } from '@/lib/middleware/rateLimiter';
import { detectLLMProvider } from '@/lib/llm/providers';
import { LLM_MODELS } from '@/lib/llm/models';
import { checkRequestSize } from '@/lib/api/analyzeRouteUtils';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('PromptRouter');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutePromptRequest {
  prompt: string;
  templateMatch: {
    templateId: string;
    nodeTypes: string[];
    confidence: number;
  };
}

export interface RoutePromptResponse {
  decision: 'use_template' | 'use_llm';
  reason: string;
}

// ---------------------------------------------------------------------------
// CSRF check (inline, same pattern as other routes)
// ---------------------------------------------------------------------------

function checkCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || '';
  const secFetchSite = request.headers.get('sec-fetch-site');
  const allowedOrigins = [`http://${host}`, `https://${host}`];

  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return NextResponse.json({ success: false, error: 'CSRF check failed' }, { status: 403 });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ success: false, error: 'CSRF check failed' }, { status: 403 });
  }

  return null;
}

// ---------------------------------------------------------------------------
// Router prompt template
// ---------------------------------------------------------------------------

function buildRouterPrompt(prompt: string, templateId: string, nodeTypes: string[]): string {
  return `당신은 인프라 아키텍처 분류기입니다.
사용자 프롬프트와 매칭된 템플릿을 비교하여, 템플릿이 적합한지 판단하세요.

사용자 프롬프트: "${prompt}"
매칭된 템플릿: "${templateId}"
템플릿 구성요소: ${nodeTypes.join(', ')}

JSON으로 응답:
{ "decision": "use_template" 또는 "use_llm", "reason": "간단한 이유" }

판단 기준:
- 프롬프트의 핵심 의도가 템플릿 아키텍처와 일치 → "use_template"
- 프롬프트가 다른 종류의 아키텍처를 설명 → "use_llm"
- 키워드는 겹치지만 의미가 다름 → "use_llm"`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<RoutePromptResponse | { success: false; error: string }>> {
  // 1. CSRF
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError as NextResponse<RoutePromptResponse | { success: false; error: string }>;

  // 2. Request size check
  const sizeError = checkRequestSize(request);
  if (sizeError) return sizeError as NextResponse<RoutePromptResponse | { success: false; error: string }>;

  // 3. Rate limit (shared with LLM)
  const { allowed, response: rateLimitResponse } = await checkRateLimit(request, LLM_RATE_LIMIT);
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse as NextResponse<RoutePromptResponse | { success: false; error: string }>;
  }

  try {
    const body: RoutePromptRequest = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false as const, error: '프롬프트가 필요합니다.' },
        { status: 400 },
      );
    }

    if (!body.templateMatch?.templateId || !Array.isArray(body.templateMatch.nodeTypes)) {
      return NextResponse.json(
        { success: false as const, error: '템플릿 매칭 정보가 필요합니다.' },
        { status: 400 },
      );
    }

    // 4. Check if LLM provider is available
    const provider = detectLLMProvider();
    if (!provider) {
      // Graceful degradation: no API key → always use template
      log.debug('No LLM provider available, defaulting to template');
      return NextResponse.json({
        decision: 'use_template' as const,
        reason: 'LLM 프로바이더를 사용할 수 없어 템플릿을 사용합니다.',
      });
    }

    // 5. Call Haiku for classification
    const routerPrompt = buildRouterPrompt(
      body.prompt,
      body.templateMatch.templateId,
      body.templateMatch.nodeTypes,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      let decision: RoutePromptResponse;

      if (provider.provider === 'anthropic') {
        decision = await callAnthropicRouter(routerPrompt, provider.apiKey, controller.signal);
      } else {
        decision = await callOpenAIRouter(routerPrompt, provider.apiKey, controller.signal);
      }

      clearTimeout(timeoutId);
      return NextResponse.json(decision);
    } catch (error) {
      clearTimeout(timeoutId);

      // Timeout or API error → fallback to template
      log.warn('Router call failed, defaulting to template', {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({
        decision: 'use_template' as const,
        reason: '라우터 호출 실패로 템플릿을 사용합니다.',
      });
    }
  } catch (error) {
    log.error('Router request error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false as const, error: 'Server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// LLM Callers
// ---------------------------------------------------------------------------

async function callAnthropicRouter(
  prompt: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<RoutePromptResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: LLM_MODELS.ANTHROPIC_DEFAULT,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return parseRouterResponse(text);
}

async function callOpenAIRouter(
  prompt: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<RoutePromptResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_MODELS.OPENAI_DEFAULT,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return parseRouterResponse(text);
}

// ---------------------------------------------------------------------------
// Response Parser
// ---------------------------------------------------------------------------

function parseRouterResponse(text: string): RoutePromptResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.decision === 'use_template' || parsed.decision === 'use_llm') {
        return {
          decision: parsed.decision,
          reason: parsed.reason || '',
        };
      }
    }
  } catch {
    // JSON parse failed
  }

  // Default fallback: use template
  return {
    decision: 'use_template',
    reason: '라우터 응답을 파싱할 수 없어 템플릿을 사용합니다.',
  };
}
