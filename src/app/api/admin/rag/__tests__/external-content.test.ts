import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Hoisted mocks (vi.mock factories are hoisted — variables must be too)
// ---------------------------------------------------------------------------

const { mockCount, mockGet, mockDelete, mockGetOrCreateCollection, mockChromaClient } = vi.hoisted(() => {
  const mockCount = vi.fn().mockResolvedValue(2);
  const mockGet = vi.fn().mockResolvedValue({
    ids: ['ext-abc1', 'ext-abc2'],
    metadatas: [
      { title: 'Ollama', sourceUrl: 'https://github.com/ollama/ollama', sourceType: 'github-readme', fetchedAt: 1700000000000, contentLength: 5000, tags: 'ai,llm' },
      { title: 'ChromaDB', sourceUrl: 'https://chromadb.dev', sourceType: 'web-page', fetchedAt: 1700000001000, contentLength: 3000, tags: 'vector-db' },
    ],
    documents: ['Ollama content preview...', 'ChromaDB content preview...'],
  });
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockGetOrCreateCollection = vi.fn().mockResolvedValue({
    count: mockCount,
    get: mockGet,
    delete: mockDelete,
  });
  const mockChromaClient = { getOrCreateCollection: mockGetOrCreateCollection };
  return { mockCount, mockGet, mockDelete, mockGetOrCreateCollection, mockChromaClient };
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
    EXTERNAL_CONTENT: 'infraflow-external-content',
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GET, DELETE } from '../external-content/route';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { getChromaClient } from '@/lib/rag/chromaClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGetRequest(params = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/rag/external-content${params}`);
}

function makeDeleteRequest(
  body: Record<string, unknown>,
  headerOverrides?: Record<string, string | null>,
): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/admin/rag/external-content', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      host: 'localhost:3000',
    },
    body: JSON.stringify(body),
  });

  if (headerOverrides) {
    const originalGet = req.headers.get.bind(req.headers);
    vi.spyOn(req.headers, 'get').mockImplementation((name: string) => {
      const lower = name.toLowerCase();
      if (lower in headerOverrides) {
        return headerOverrides[lower] ?? null;
      }
      return originalGet(name);
    });
  }

  return req;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({
    user: { id: 'admin', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' as const },
    expires: '2099-12-31',
  });
  vi.mocked(getChromaClient).mockResolvedValue(mockChromaClient as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  mockCount.mockResolvedValue(2);
  mockGet.mockResolvedValue({
    ids: ['ext-abc1', 'ext-abc2'],
    metadatas: [
      { title: 'Ollama', sourceUrl: 'https://github.com/ollama/ollama', sourceType: 'github-readme', fetchedAt: 1700000000000, contentLength: 5000, tags: 'ai,llm' },
      { title: 'ChromaDB', sourceUrl: 'https://chromadb.dev', sourceType: 'web-page', fetchedAt: 1700000001000, contentLength: 3000, tags: 'vector-db' },
    ],
    documents: ['Ollama content preview...', 'ChromaDB content preview...'],
  });
  mockDelete.mockResolvedValue(undefined);
  mockGetOrCreateCollection.mockResolvedValue({
    count: mockCount,
    get: mockGet,
    delete: mockDelete,
  });
});

// ---------------------------------------------------------------------------
// GET Tests
// ---------------------------------------------------------------------------

describe('GET /api/admin/rag/external-content', () => {
  it('returns paginated external content list', async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(2);
    expect(data.data.total).toBe(2);
    expect(data.data.items[0].title).toBe('Ollama');
    expect(data.data.items[0].tags).toEqual(['ai', 'llm']);
    expect(data.data.items[1].sourceType).toBe('web-page');
  });

  it('respects limit and offset params', async () => {
    const req = makeGetRequest('?limit=1&offset=1');
    await GET(req);

    expect(mockGet).toHaveBeenCalledWith({
      limit: 1,
      offset: 1,
      include: ['metadatas', 'documents'],
    });
  });

  it('clamps limit to max 100', async () => {
    const req = makeGetRequest('?limit=200');
    await GET(req);

    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });

  it('returns empty array when ChromaDB unavailable', async () => {
    vi.mocked(getChromaClient).mockResolvedValue(null);

    const req = makeGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.items).toHaveLength(0);
    expect(data.data.total).toBe(0);
  });

  it('returns empty array when collection is empty', async () => {
    mockCount.mockResolvedValue(0);

    const req = makeGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.items).toHaveLength(0);
  });

  it('rejects when not admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('관리자 권한이 필요합니다', 403));

    const req = makeGetRequest();
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it('includes content preview (max 200 chars)', async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(data.data.items[0].contentPreview).toBe('Ollama content preview...');
  });
});

// ---------------------------------------------------------------------------
// DELETE Tests
// ---------------------------------------------------------------------------

describe('DELETE /api/admin/rag/external-content', () => {
  it('deletes external content by IDs', async () => {
    const req = makeDeleteRequest({ ids: ['ext-abc1', 'ext-abc2'] });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deleted).toBe(2);
    expect(mockDelete).toHaveBeenCalledWith({ ids: ['ext-abc1', 'ext-abc2'] });
  });

  it('rejects empty ids array', async () => {
    const req = makeDeleteRequest({ ids: [] });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it('rejects missing ids field', async () => {
    const req = makeDeleteRequest({});
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it('filters out non-string ids', async () => {
    const req = makeDeleteRequest({ ids: ['ext-abc1', '', 123, null] });
    const res = await DELETE(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ ids: ['ext-abc1'] });
  });

  it('rejects CSRF with cross-site sec-fetch-site', async () => {
    const req = makeDeleteRequest(
      { ids: ['ext-abc1'] },
      { 'sec-fetch-site': 'cross-site', 'origin': null },
    );
    const res = await DELETE(req);

    expect(res.status).toBe(403);
  });

  it('rejects when not admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('관리자 권한이 필요합니다', 403));

    const req = makeDeleteRequest({ ids: ['ext-abc1'] });
    const res = await DELETE(req);

    expect(res.status).toBe(403);
  });

  it('returns 503 when ChromaDB unavailable', async () => {
    vi.mocked(getChromaClient).mockResolvedValue(null);

    const req = makeDeleteRequest({ ids: ['ext-abc1'] });
    const res = await DELETE(req);

    expect(res.status).toBe(503);
  });

  it('handles delete failure gracefully', async () => {
    mockDelete.mockRejectedValue(new Error('ChromaDB error'));
    mockGetOrCreateCollection.mockResolvedValue({
      count: mockCount,
      get: mockGet,
      delete: mockDelete,
    });

    const req = makeDeleteRequest({ ids: ['ext-abc1'] });
    const res = await DELETE(req);

    expect(res.status).toBe(500);
  });
});
