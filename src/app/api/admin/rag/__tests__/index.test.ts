import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

vi.mock('@/lib/middleware/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    info: { current: 1, limit: 10, remaining: 9, resetIn: 60000 },
  }),
}));

vi.mock('@/lib/rag/fetcher/liveIndexer', () => ({
  indexExternalContent: vi.fn().mockResolvedValue({
    id: 'ext-idx12345',
    success: true,
  }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { POST } from '../index/route';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { checkRateLimit } from '@/lib/middleware/rateLimiter';
import { indexExternalContent } from '@/lib/rag/fetcher/liveIndexer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a POST request with optional header overrides.
 * happy-dom strips forbidden headers (origin, sec-fetch-site),
 * so we monkey-patch headers.get for CSRF testing.
 */
function makeRequest(
  body: Record<string, unknown>,
  headerOverrides?: Record<string, string | null>,
): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/admin/rag/index', {
    method: 'POST',
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
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    info: { current: 1, limit: 10, remaining: 9, resetIn: 60000 },
  });
  vi.mocked(indexExternalContent).mockResolvedValue({ id: 'ext-idx12345', success: true });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/admin/rag/index', () => {
  it('indexes provided content successfully', async () => {
    const req = makeRequest({
      content: 'Ollama is a local inference engine for running LLMs.',
      title: 'Ollama Overview',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe('ext-idx12345');
    expect(data.title).toBe('Ollama Overview');
  });

  it('accepts request with all optional fields', async () => {
    const req = makeRequest({
      content: 'Content about ChromaDB vector database.',
      title: 'ChromaDB Docs',
      sourceUrl: 'https://docs.trychroma.com',
      tags: ['vector-db', 'rag'],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects CSRF with cross-site sec-fetch-site', async () => {
    const req = makeRequest(
      { content: 'test', title: 'Test' },
      { 'sec-fetch-site': 'cross-site', 'origin': null },
    );
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('rejects when not admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('관리자 권한이 필요합니다', 403));

    const req = makeRequest({ content: 'test', title: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('rejects rate-limited requests', async () => {
    const rateLimitResp = new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 });
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      info: { current: 11, limit: 10, remaining: 0, resetIn: 30000 },
      response: rateLimitResp as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    const req = makeRequest({ content: 'test', title: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(429);
  });

  it('rejects missing content', async () => {
    const req = makeRequest({ title: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('rejects empty content', async () => {
    const req = makeRequest({ content: '', title: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('rejects missing title', async () => {
    const req = makeRequest({ content: 'Some content' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('handles indexing failure', async () => {
    vi.mocked(indexExternalContent).mockResolvedValue({
      id: 'ext-fail',
      success: false,
      error: 'ChromaDB unavailable',
    });

    const req = makeRequest({ content: 'test content', title: 'Test' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
