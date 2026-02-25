/**
 * TraceStore Tests
 *
 * Tests for the reasoning trace persistence layer.
 * Uses mocked Prisma client since we can't run against a real DB in unit tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveTrace, listTraces, getTrace, deleteOldTraces } from '../traceStore';
import type { ReasoningTrace } from '../types';

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockCount = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    reasoningTrace: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      count: (...args: unknown[]) => mockCount(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSampleTrace(overrides?: Partial<ReasoningTrace>): ReasoningTrace {
  return {
    id: 'trace-abc12345',
    query: 'VPN with firewall',
    timestamp: Date.now(),
    durationMs: 350,
    extractedNodeTypes: ['vpn-gateway', 'firewall'],
    ragSearch: {
      method: 'vector',
      queryTimeMs: 100,
      totalResults: 2,
      documents: [
        { id: 'doc-1', collection: 'infraflow-ai-software', score: 0.85, title: 'Ollama', category: 'ai-inference' },
      ],
      maxScore: 0.85,
      threshold: 0.7,
    },
    liveAugment: { triggered: false, reason: 'score above threshold' },
    enrichment: {
      relationshipsMatched: [],
      relationshipsExcluded: 0,
      suggestionsCount: 0,
      violationsCount: 0,
      risksCount: 0,
      piDocumentsInjected: 0,
      cacheHit: false,
      promptSectionLength: 0,
    },
    llm: { provider: 'claude', model: 'claude-sonnet-4-5-20250929', attempts: 1, success: true },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TraceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
  });

  describe('saveTrace', () => {
    it('saves a trace to the database', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'cuid-1' });
      const trace = makeSampleTrace();

      await saveTrace(trace);

      expect(mockCreate).toHaveBeenCalledOnce();
      const callArg = mockCreate.mock.calls[0][0];
      expect(callArg.data.traceId).toBe('trace-abc12345');
      expect(callArg.data.query).toBe('VPN with firewall');
      expect(callArg.data.maxScore).toBe(0.85);
      expect(callArg.data.provider).toBe('claude');
      expect(callArg.data.success).toBe(true);
      expect(callArg.data.nodeTypes).toEqual(['vpn-gateway', 'firewall']);
    });

    it('no-ops in demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      await saveTrace(makeSampleTrace());
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('does not throw on DB error', async () => {
      mockCreate.mockRejectedValueOnce(new Error('connection refused'));
      await expect(saveTrace(makeSampleTrace())).resolves.toBeUndefined();
    });
  });

  describe('listTraces', () => {
    it('returns paginated results', async () => {
      const dbRows = [
        { id: 'cuid-1', traceId: 'trace-1', query: 'test', durationMs: 100, maxScore: 0.9, provider: 'claude', success: true, nodeTypes: ['firewall'], createdAt: new Date() },
      ];
      mockFindMany.mockResolvedValueOnce(dbRows);
      mockCount.mockResolvedValueOnce(1);

      const result = await listTraces({ limit: 10, offset: 0 });
      expect(result.traces).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('applies minScore filter', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockCount.mockResolvedValueOnce(0);

      await listTraces({ minScore: 0.5 });

      const findCall = mockFindMany.mock.calls[0][0];
      expect(findCall.where.maxScore).toEqual({ gte: 0.5 });
    });

    it('applies success filter', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockCount.mockResolvedValueOnce(0);

      await listTraces({ success: false });

      const findCall = mockFindMany.mock.calls[0][0];
      expect(findCall.where.success).toBe(false);
    });

    it('applies date range filter', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockCount.mockResolvedValueOnce(0);

      const dateFrom = new Date('2026-01-01');
      const dateTo = new Date('2026-02-01');
      await listTraces({ dateFrom, dateTo });

      const findCall = mockFindMany.mock.calls[0][0];
      expect(findCall.where.createdAt.gte).toEqual(dateFrom);
      expect(findCall.where.createdAt.lte).toEqual(dateTo);
    });

    it('returns empty in demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      const result = await listTraces();
      expect(result.traces).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('returns empty on DB error', async () => {
      mockFindMany.mockRejectedValueOnce(new Error('timeout'));
      const result = await listTraces();
      expect(result.traces).toEqual([]);
    });
  });

  describe('getTrace', () => {
    it('returns the full trace data', async () => {
      const trace = makeSampleTrace();
      mockFindUnique.mockResolvedValueOnce({ traceData: trace });

      const result = await getTrace('trace-abc12345');
      expect(result).toEqual(trace);
    });

    it('returns null when not found', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      const result = await getTrace('trace-nonexist');
      expect(result).toBeNull();
    });

    it('returns null in demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      const result = await getTrace('trace-abc12345');
      expect(result).toBeNull();
    });

    it('returns null on DB error', async () => {
      mockFindUnique.mockRejectedValueOnce(new Error('timeout'));
      const result = await getTrace('trace-abc12345');
      expect(result).toBeNull();
    });
  });

  describe('deleteOldTraces', () => {
    it('deletes traces older than specified days', async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 5 });

      const result = await deleteOldTraces(30);
      expect(result).toBe(5);
      expect(mockDeleteMany).toHaveBeenCalledOnce();

      const callArg = mockDeleteMany.mock.calls[0][0];
      expect(callArg.where.createdAt.lt).toBeInstanceOf(Date);
    });

    it('returns 0 in demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
      const result = await deleteOldTraces(30);
      expect(result).toBe(0);
    });

    it('returns 0 on DB error', async () => {
      mockDeleteMany.mockRejectedValueOnce(new Error('timeout'));
      const result = await deleteOldTraces(30);
      expect(result).toBe(0);
    });
  });
});
