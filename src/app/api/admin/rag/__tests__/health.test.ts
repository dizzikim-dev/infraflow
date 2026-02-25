import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks (vi.mock factories are hoisted — variables must be too)
// ---------------------------------------------------------------------------

const { mockCount, mockGetOrCreateCollection, mockChromaClient } = vi.hoisted(() => {
  const mockCount = vi.fn().mockResolvedValue(42);
  const mockGetOrCreateCollection = vi.fn().mockResolvedValue({ count: mockCount });
  const mockChromaClient = { getOrCreateCollection: mockGetOrCreateCollection };
  return { mockCount, mockGetOrCreateCollection, mockChromaClient };
});

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/auth/authHelpers', () => ({
  requireAdmin: vi.fn().mockResolvedValue({
    user: { id: 'admin', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    expires: '2099-12-31',
  }),
  AuthError: class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 401) {
      super(message);
      this.name = 'AuthError';
      this.statusCode = statusCode;
    }
  },
}));

vi.mock('@/lib/rag/chromaClient', () => ({
  getChromaClient: vi.fn().mockResolvedValue(mockChromaClient),
  COLLECTIONS: {
    AI_SOFTWARE: 'infraflow-ai-software',
    CLOUD_SERVICES: 'infraflow-cloud-services',
    DEPLOYMENT_SCENARIOS: 'infraflow-deployment-scenarios',
    INTEGRATION_PATTERNS: 'infraflow-integration-patterns',
    EXTERNAL_CONTENT: 'infraflow-external-content',
  },
  FETCH_CACHE_CONFIG: {
    maxBytes: 51200,
    ttlSeconds: 86400,
    confidenceThreshold: 0.5,
    timeoutMs: 2500,
  },
  RAG_CONFIG: {
    persistDirectory: '.chroma',
    embeddingModel: 'text-embedding-ada-002',
    defaultTopK: 10,
    similarityThreshold: 0.7,
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '../health/route';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { getChromaClient } from '@/lib/rag/chromaClient';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({
    user: { id: 'admin', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' as const },
    expires: '2099-12-31',
  });
  vi.mocked(getChromaClient).mockResolvedValue(mockChromaClient as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  mockCount.mockResolvedValue(42);
  mockGetOrCreateCollection.mockResolvedValue({ count: mockCount });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/admin/rag/health', () => {
  it('returns health data with collection counts', async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.connected).toBe(true);
    expect(data.data.collections).toHaveLength(5);
    expect(data.data.collections[0].count).toBe(42);
    expect(data.data.totalDocuments).toBe(210); // 5 collections * 42
  });

  it('returns config values', async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.data.config.maxBytes).toBe(51200);
    expect(data.data.config.ttlSeconds).toBe(86400);
    expect(data.data.config.confidenceThreshold).toBe(0.5);
    expect(data.data.config.timeoutMs).toBe(2500);
    expect(data.data.config.embeddingModel).toBe('text-embedding-ada-002');
    expect(data.data.config.defaultTopK).toBe(10);
    expect(data.data.config.similarityThreshold).toBe(0.7);
  });

  it('returns disconnected state when ChromaDB unavailable', async () => {
    vi.mocked(getChromaClient).mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.connected).toBe(false);
    expect(data.data.collections).toHaveLength(0);
    expect(data.data.totalDocuments).toBe(0);
    // Config should still be returned
    expect(data.data.config.embeddingModel).toBe('text-embedding-ada-002');
  });

  it('rejects when not admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('관리자 권한이 필요합니다', 403));

    const res = await GET();

    expect(res.status).toBe(403);
  });

  it('handles collection.count() failure gracefully', async () => {
    mockGetOrCreateCollection.mockResolvedValue({
      count: vi.fn().mockRejectedValue(new Error('count failed')),
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Failed collections should report count 0
    expect(data.data.collections.every((c: { count: number }) => c.count === 0)).toBe(true);
  });

  it('handles unexpected auth error', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('unexpected'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
  });
});
