import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseWithLLM } from '../llmParser';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/types/guards', () => ({
  isInfraSpec: vi.fn().mockReturnValue(true),
}));

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseWithLLM — trace field capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('captures traceId from API response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        spec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
        traceId: 'trace-abc123',
        traceSummary: {
          ragDocumentsUsed: 3,
          maxScore: 0.85,
          relationshipsMatched: 5,
          gapsDetected: 1,
          liveAugmentTriggered: false,
          enrichmentCacheHit: true,
        },
      }),
    });

    const result = await parseWithLLM('test', { provider: 'claude' });

    expect(result.success).toBe(true);
    expect(result.traceId).toBe('trace-abc123');
    expect(result.traceSummary).toEqual(expect.objectContaining({
      ragDocumentsUsed: 3,
      maxScore: 0.85,
    }));
  });

  it('captures verification from API response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        spec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
        traceId: 'trace-xyz',
        verification: {
          score: 85,
          missingRequired: 1,
          missingRecommended: 2,
          conflicts: 0,
        },
      }),
    });

    const result = await parseWithLLM('test', { provider: 'claude' });

    expect(result.verification).toEqual({
      score: 85,
      missingRequired: 1,
      missingRecommended: 2,
      conflicts: 0,
    });
  });

  it('returns undefined trace fields when API does not include them', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        spec: { nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }], connections: [] },
      }),
    });

    const result = await parseWithLLM('test', { provider: 'openai' });

    expect(result.success).toBe(true);
    expect(result.traceId).toBeUndefined();
    expect(result.traceSummary).toBeUndefined();
    expect(result.verification).toBeUndefined();
  });

  it('does not include trace fields on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'API key invalid' }),
    });

    const result = await parseWithLLM('test', { provider: 'claude' });

    expect(result.success).toBe(false);
    expect(result.traceId).toBeUndefined();
  });

  it('handles network errors gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await parseWithLLM('test', { provider: 'claude' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.traceId).toBeUndefined();
  });
});
