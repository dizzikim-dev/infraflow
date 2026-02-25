import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalParser } from '../useLocalParser';
import type { SmartParseResult } from '@/lib/parser';
import type { InfraSpec } from '@/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSmartParse = vi.fn();
vi.mock('@/lib/parser', () => ({
  smartParse: (...args: unknown[]) => mockSmartParse(...args),
}));

const mockSpecToFlow = vi.fn().mockReturnValue({
  nodes: [{ id: 'n1', type: 'custom', position: { x: 0, y: 0 }, data: {} }],
  edges: [],
});
vi.mock('@/lib/layout', () => ({
  specToFlow: (...args: unknown[]) => mockSpecToFlow(...args),
}));

vi.mock('@/lib/constants', () => ({
  LOADING_DELAY_MS: 0,
}));

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/lib/activity/trackActivity', () => ({
  trackActivity: vi.fn(),
}));

const mockParseWithLLM = vi.fn();
vi.mock('@/lib/llm/llmParser', () => ({
  parseWithLLM: (...args: unknown[]) => mockParseWithLLM(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'ws-1', type: 'web-server', label: 'Web Server' },
  ],
  connections: [],
};

function makeParseResult(overrides: Partial<SmartParseResult> = {}): SmartParseResult {
  return {
    success: true,
    spec: baseSpec,
    confidence: 0.8,
    commandType: 'create',
    templateUsed: 'hybrid',
    ...overrides,
  };
}

function makeConfig(overrides: Partial<Parameters<typeof useLocalParser>[0]> = {}) {
  return {
    currentSpec: null,
    context: { history: [], currentSpec: null },
    onNodesUpdate: vi.fn(),
    onEdgesUpdate: vi.fn(),
    onSpecUpdate: vi.fn(),
    onAnimationReset: vi.fn(),
    onPolicyReset: vi.fn(),
    onResultUpdate: vi.fn(),
    onContextUpdate: vi.fn(),
    onLoadingChange: vi.fn(),
    requestIdRef: { current: 0 },
    abortControllerRef: { current: null },
    onDiagramGenerated: vi.fn(),
    llmAvailable: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useLocalParser — Smart Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ configured: true, providers: { claude: true } }),
    }) as Mock;
  });

  // ── Tier 1: High confidence (≥0.9) → template-direct ──

  it('routes to template-direct when confidence >= 0.9', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.95 }));

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('kubernetes 클러스터');
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'template-direct',
        confidence: 0.95,
      }),
    );
    // Should NOT call router API or LLM
    expect(mockParseWithLLM).not.toHaveBeenCalled();
  });

  it('routes to template-direct when LLM is not available (regardless of confidence)', async () => {
    const config = makeConfig({ llmAvailable: false });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.6 }));

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('hybrid architecture');
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'template-direct',
      }),
    );
    expect(mockParseWithLLM).not.toHaveBeenCalled();
  });

  // ── Tier 3: Low confidence (<0.5) → llm-direct ──

  it('routes to llm-direct when confidence < 0.5 and LLM available', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.4 }));
    mockParseWithLLM.mockResolvedValue({
      success: true,
      spec: baseSpec,
      traceId: 'trace-123',
      traceSummary: { ragDocumentsUsed: 2, maxScore: 0.8, relationshipsMatched: 3, gapsDetected: 1, liveAugmentTriggered: false, enrichmentCacheHit: false },
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('완전히 새로운 아키텍처');
    });

    expect(mockParseWithLLM).toHaveBeenCalled();
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'llm-direct',
        traceId: 'trace-123',
      }),
    );
  });

  it('falls back to template when LLM fails on low confidence', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.4 }));
    mockParseWithLLM.mockResolvedValue({
      success: false,
      error: 'API key invalid',
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('test prompt');
    });

    // Should fallback to local parse result
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'template-direct',
      }),
    );
  });

  // ── Tier 2: Medium confidence (0.5–0.89) → router decides ──

  it('routes to router-template when router says use_template', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.7 }));

    (globalThis.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        decision: 'use_template',
        reason: '아키텍처가 일치합니다.',
      }),
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('k8s 클러스터');
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'router-template',
        routingReason: '아키텍처가 일치합니다.',
      }),
    );
    expect(mockParseWithLLM).not.toHaveBeenCalled();
  });

  it('routes to router-llm when router says use_llm', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.75 }));

    // First call: router API
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        decision: 'use_llm',
        reason: '프롬프트가 AI 비서를 설명하므로 personal-ai가 더 적합합니다.',
      }),
    })
    // Second call: /api/llm GET (provider check)
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ configured: true, providers: { claude: true } }),
    });

    mockParseWithLLM.mockResolvedValue({
      success: true,
      spec: baseSpec,
      traceId: 'trace-456',
      traceSummary: { ragDocumentsUsed: 1, maxScore: 0.7, relationshipsMatched: 2, gapsDetected: 0, liveAugmentTriggered: false, enrichmentCacheHit: false },
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('맥미니에서 AI비서 + 클라우드 백업');
    });

    expect(mockParseWithLLM).toHaveBeenCalled();
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'router-llm',
        routingReason: expect.stringContaining('personal-ai'),
        traceId: 'trace-456',
      }),
    );
  });

  it('falls back to template when router API fails', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.7 }));

    (globalThis.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('test prompt');
    });

    // Should fallback to template (router failure = use_template)
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'router-template',
      }),
    );
    expect(mockParseWithLLM).not.toHaveBeenCalled();
  });

  it('falls back to template when LLM fails after router says use_llm', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue(makeParseResult({ confidence: 0.7 }));

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ decision: 'use_llm', reason: 'different arch' }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ configured: true, providers: { claude: true } }),
    });

    mockParseWithLLM.mockResolvedValue({
      success: false,
      error: 'LLM timeout',
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('test prompt');
    });

    // Should fallback to template
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'router-template',
        routingReason: expect.stringContaining('LLM 실패'),
      }),
    );
  });

  // ── Fallback path with LLM available ──

  it('routes fallback to LLM when LLM is available', async () => {
    const config = makeConfig({ llmAvailable: true });
    mockSmartParse.mockReturnValue({
      success: false,
      confidence: 0.2,
      commandType: 'create',
      isFallback: true,
      spec: baseSpec,
      error: '인식 실패',
    });

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ configured: true, providers: { claude: true } }),
    });

    mockParseWithLLM.mockResolvedValue({
      success: true,
      spec: baseSpec,
      traceId: 'trace-789',
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('completely new architecture');
    });

    expect(mockParseWithLLM).toHaveBeenCalled();
    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'llm-direct',
        traceId: 'trace-789',
      }),
    );
  });

  it('shows fallback warning when LLM is not available', async () => {
    const config = makeConfig({ llmAvailable: false });
    mockSmartParse.mockReturnValue({
      success: false,
      confidence: 0.2,
      commandType: 'create',
      isFallback: true,
      spec: baseSpec,
      error: '인식 실패',
    });

    const { result } = renderHook(() => useLocalParser(config));
    await act(async () => {
      await result.current.handlePromptSubmit('unknown architecture');
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        isFallback: true,
        error: '인식 실패',
      }),
    );
    expect(mockParseWithLLM).not.toHaveBeenCalled();
  });

  // ── Template select always uses template-direct ──

  it('handleTemplateSelect always sets routingDecision to template-direct', () => {
    const config = makeConfig();
    const { result } = renderHook(() => useLocalParser(config));

    act(() => {
      result.current.handleTemplateSelect({
        id: 'k8s',
        name: 'Kubernetes',
        description: 'K8s cluster',
        category: 'web',
        icon: 'server',
        spec: baseSpec,
        tags: ['k8s'],
        isBuiltIn: true,
      });
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        routingDecision: 'template-direct',
        confidence: 1,
      }),
    );
  });

  // ── Edge cases ──

  it('rejects empty prompts', async () => {
    const config = makeConfig();
    const { result } = renderHook(() => useLocalParser(config));

    await act(async () => {
      await result.current.handlePromptSubmit('   ');
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('비어있습니다'),
      }),
    );
  });

  it('rejects invalid prompts', async () => {
    const config = makeConfig();
    const { result } = renderHook(() => useLocalParser(config));

    await act(async () => {
      await result.current.handlePromptSubmit(null as unknown as string);
    });

    expect(config.onResultUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('유효한'),
      }),
    );
  });
});
