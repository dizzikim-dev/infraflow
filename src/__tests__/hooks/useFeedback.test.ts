import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedback } from '@/hooks/useFeedback';
import type { InfraSpec } from '@/types/infra';

// Mock the learning modules
vi.mock('@/lib/learning/feedbackStore', () => {
  const records = new Map();
  return {
    getFeedbackStore: vi.fn(() => ({
      save: vi.fn(async (record: { id: string }) => {
        records.set(record.id, record);
      }),
      getAll: vi.fn(async () => [...records.values()]),
      count: vi.fn(async () => records.size),
    })),
  };
});

vi.mock('@/lib/knowledge', () => ({
  detectPatterns: vi.fn(() => [{ id: 'PAT-001' }]),
  detectAntiPatterns: vi.fn(() => [{ id: 'AP-001' }]),
}));

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const testSpec: InfraSpec = {
  nodes: [
    { id: 'fw-1', type: 'firewall', label: 'Firewall' },
    { id: 'ws-1', type: 'web-server', label: 'Web Server' },
  ],
  connections: [{ source: 'fw-1', target: 'ws-1' }],
};

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct defaults', () => {
    const { result } = renderHook(() => useFeedback());
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.hasPendingFeedback).toBe(false);
    expect(result.current.ratingSubmitted).toBe(false);
    expect(result.current.currentRating).toBeNull();
  });

  it('should capture original spec and set pending feedback', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser', 'test prompt');
    });

    expect(result.current.hasPendingFeedback).toBe(true);
    expect(result.current.ratingSubmitted).toBe(false);
  });

  it('should submit rating and mark as submitted', async () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser', 'test');
    });

    await act(async () => {
      await result.current.submitRating(4);
    });

    expect(result.current.ratingSubmitted).toBe(true);
    expect(result.current.currentRating).toBe(4);
  });

  it('should clamp rating to 1-5 range', async () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser');
    });

    await act(async () => {
      await result.current.submitRating(10);
    });

    expect(result.current.currentRating).toBe(5);
  });

  it('should clamp rating minimum to 1', async () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser');
    });

    await act(async () => {
      await result.current.submitRating(0);
    });

    expect(result.current.currentRating).toBe(1);
  });

  it('should reset state on new capture', async () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser');
    });

    await act(async () => {
      await result.current.submitRating(5);
    });

    expect(result.current.ratingSubmitted).toBe(true);

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'llm-modify', 'new prompt');
    });

    expect(result.current.ratingSubmitted).toBe(false);
    expect(result.current.currentRating).toBeNull();
    expect(result.current.hasPendingFeedback).toBe(true);
  });

  it('should not save when no original spec is captured', async () => {
    const { result } = renderHook(() => useFeedback());

    await act(async () => {
      await result.current.submitRating(4);
    });

    expect(result.current.ratingSubmitted).toBe(false);
  });

  it('should capture user modifications', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser');
    });

    const modifiedSpec: InfraSpec = {
      ...testSpec,
      nodes: [...testSpec.nodes, { id: 'waf-1', type: 'waf', label: 'WAF' }],
    };

    act(() => {
      result.current.captureUserModification(modifiedSpec);
    });

    // No error thrown, modification captured silently
    expect(result.current.hasPendingFeedback).toBe(true);
  });

  it('should handle different diagram sources', async () => {
    const { result } = renderHook(() => useFeedback());

    // Test template source
    act(() => {
      result.current.captureOriginalSpec(testSpec, 'template');
    });
    expect(result.current.hasPendingFeedback).toBe(true);

    // Test llm-modify source
    act(() => {
      result.current.captureOriginalSpec(testSpec, 'llm-modify', 'add waf');
    });
    expect(result.current.hasPendingFeedback).toBe(true);
  });

  it('should not capture modifications without original spec', () => {
    const { result } = renderHook(() => useFeedback());

    // Try to capture modification without first capturing original
    act(() => {
      result.current.captureUserModification(testSpec);
    });

    // Should not crash, just silently ignore
    expect(result.current.hasPendingFeedback).toBe(false);
  });

  it('should round fractional ratings', async () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.captureOriginalSpec(testSpec, 'local-parser');
    });

    await act(async () => {
      await result.current.submitRating(3.7);
    });

    expect(result.current.currentRating).toBe(4);
  });

  it('should provide stable function references across re-renders', () => {
    const { result, rerender } = renderHook(() => useFeedback());

    const firstCapture = result.current.captureOriginalSpec;
    const firstSubmit = result.current.submitRating;
    const firstModify = result.current.captureUserModification;

    rerender();

    expect(result.current.captureOriginalSpec).toBe(firstCapture);
    expect(result.current.submitRating).toBe(firstSubmit);
    expect(result.current.captureUserModification).toBe(firstModify);
  });
});
