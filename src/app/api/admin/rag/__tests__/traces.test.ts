/**
 * Admin RAG Traces API Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { ReasoningTrace } from '@/lib/rag/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockListTraces = vi.fn();
const mockGetTrace = vi.fn();

vi.mock('@/lib/rag/traceStore', () => ({
  listTraces: (...args: unknown[]) => mockListTraces(...args),
  getTrace: (...args: unknown[]) => mockGetTrace(...args),
}));

vi.mock('@/lib/auth/authHelpers', () => ({
  requireAdmin: vi.fn().mockResolvedValue({
    user: { id: 'admin-1', role: 'ADMIN' },
  }),
  AuthError: class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 401) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

function makeSampleTrace(): ReasoningTrace {
  return {
    id: 'trace-12345678',
    query: 'VPN with firewall',
    timestamp: Date.now(),
    durationMs: 350,
    extractedNodeTypes: ['vpn-gateway', 'firewall'],
    ragSearch: {
      method: 'vector',
      queryTimeMs: 100,
      totalResults: 2,
      documents: [],
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
    llm: { provider: 'claude', attempts: 1, success: true },
  };
}

// ---------------------------------------------------------------------------
// Tests: GET /api/admin/rag/traces
// ---------------------------------------------------------------------------

describe('GET /api/admin/rag/traces', () => {
  let GET: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../traces/route');
    GET = mod.GET;
  });

  it('returns paginated trace list', async () => {
    mockListTraces.mockResolvedValueOnce({
      traces: [
        { id: 'cuid-1', traceId: 'trace-1', query: 'test', durationMs: 100, maxScore: 0.9, provider: 'claude', success: true, nodeTypes: ['firewall'], createdAt: new Date() },
      ],
      total: 1,
    });

    const res = await GET(makeRequest('/api/admin/rag/traces?limit=10&offset=0'));
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.traces).toHaveLength(1);
    expect(json.data.total).toBe(1);
  });

  it('passes filters to listTraces', async () => {
    mockListTraces.mockResolvedValueOnce({ traces: [], total: 0 });

    await GET(makeRequest('/api/admin/rag/traces?minScore=0.5&success=true'));

    expect(mockListTraces).toHaveBeenCalledWith(
      expect.objectContaining({
        minScore: 0.5,
        success: true,
      }),
    );
  });

  it('caps limit at 100', async () => {
    mockListTraces.mockResolvedValueOnce({ traces: [], total: 0 });

    await GET(makeRequest('/api/admin/rag/traces?limit=500'));

    expect(mockListTraces).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });

  it('uses default limit and offset', async () => {
    mockListTraces.mockResolvedValueOnce({ traces: [], total: 0 });

    await GET(makeRequest('/api/admin/rag/traces'));

    expect(mockListTraces).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 0 }),
    );
  });

  it('handles date range filters', async () => {
    mockListTraces.mockResolvedValueOnce({ traces: [], total: 0 });

    await GET(makeRequest('/api/admin/rag/traces?dateFrom=2026-01-01&dateTo=2026-02-01'));

    expect(mockListTraces).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.any(Date),
        dateTo: expect.any(Date),
      }),
    );
  });

  it('returns 500 on internal error', async () => {
    mockListTraces.mockRejectedValueOnce(new Error('DB timeout'));

    const res = await GET(makeRequest('/api/admin/rag/traces'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/admin/rag/traces/[id]
// ---------------------------------------------------------------------------

describe('GET /api/admin/rag/traces/[id]', () => {
  let GET: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../traces/[id]/route');
    GET = mod.GET;
  });

  it('returns a single trace', async () => {
    const trace = makeSampleTrace();
    mockGetTrace.mockResolvedValueOnce(trace);

    const res = await GET(
      makeRequest('/api/admin/rag/traces/trace-12345678'),
      { params: Promise.resolve({ id: 'trace-12345678' }) },
    );
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.id).toBe('trace-12345678');
    expect(json.data.query).toBe('VPN with firewall');
  });

  it('returns 404 when trace not found', async () => {
    mockGetTrace.mockResolvedValueOnce(null);

    const res = await GET(
      makeRequest('/api/admin/rag/traces/trace-nonexist'),
      { params: Promise.resolve({ id: 'trace-nonexist' }) },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 500 on internal error', async () => {
    mockGetTrace.mockRejectedValueOnce(new Error('DB error'));

    const res = await GET(
      makeRequest('/api/admin/rag/traces/trace-12345678'),
      { params: Promise.resolve({ id: 'trace-12345678' }) },
    );
    expect(res.status).toBe(500);
  });
});
