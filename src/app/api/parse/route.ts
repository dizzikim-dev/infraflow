import { NextRequest, NextResponse } from 'next/server';
import { isInfraSpec } from '@/types/guards';
import type { InfraSpec } from '@/types';
import {
  INTENT_ANALYSIS_PROMPT,
  parseIntentResponse,
  applyIntentToSpec,
  IntentAnalysis,
} from '@/lib/parser/intelligentParser';
import { ConversationContext, SmartParseResult } from '@/lib/parser/smartParser';

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

export interface SmartParseResponse {
  success: boolean;
  result?: SmartParseResult;
  intent?: IntentAnalysis;
  error?: string;
  rawResponse?: string;
}

/**
 * Call Claude API for intent analysis
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
 * Call OpenAI API for intent analysis
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
 * POST /api/parse
 * Smart parsing endpoint with LLM intent analysis
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SmartParseResponse>> {
  try {
    const body: SmartParseRequestBody = await request.json();
    const { prompt, context, provider = 'claude', model, useLLM = true } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt' },
        { status: 400 }
      );
    }

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
    const { intent, rawResponse, error } = await analyzeFunction(
      prompt,
      conversationContext.currentSpec,
      apiKey,
      model
    );

    if (!intent) {
      return NextResponse.json({
        success: false,
        error: error || 'Failed to analyze intent',
        rawResponse,
      });
    }

    // Apply intent to generate result
    const result = applyIntentToSpec(intent, conversationContext);

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
 * GET /api/parse
 * Check if smart parsing is available
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
