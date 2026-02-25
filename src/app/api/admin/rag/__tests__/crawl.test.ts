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
    info: { current: 1, limit: 5, remaining: 4, resetIn: 60000 },
  }),
}));

vi.mock('@/lib/rag/fetcher/fetchCache', () => ({
  isCached: vi.fn().mockResolvedValue(false),
  invalidateCache: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/rag/fetcher/githubFetcher', () => ({
  isGitHubUrl: vi.fn().mockReturnValue(false),
  fetchGitHubReadme: vi.fn().mockResolvedValue('# Ollama\n\nRun LLMs locally.'),
  extractReadmeSections: vi.fn().mockReturnValue({
    title: 'Ollama',
    description: 'Run LLMs locally.',
    installation: 'curl install',
    requirements: 'macOS 12+',
    features: 'Local inference',
    fullText: '# Ollama\n\nRun LLMs locally.',
  }),
}));

vi.mock('@/lib/rag/fetcher/webFetcher', () => ({
  fetchUrl: vi.fn().mockResolvedValue({
    content: 'Web page content',
    contentHash: 'abcd1234',
    contentLength: 16,
    contentType: 'text/html',
    url: 'https://example.com',
  }),
}));

vi.mock('@/lib/rag/fetcher/liveIndexer', () => ({
  indexExternalContent: vi.fn().mockResolvedValue({
    id: 'ext-test1234',
    success: true,
  }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { POST } from '../crawl/route';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { checkRateLimit } from '@/lib/middleware/rateLimiter';
import { isCached } from '@/lib/rag/fetcher/fetchCache';
import { isGitHubUrl } from '@/lib/rag/fetcher/githubFetcher';
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
  const req = new NextRequest('http://localhost:3000/api/admin/rag/crawl', {
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
    info: { current: 1, limit: 5, remaining: 4, resetIn: 60000 },
  });
  vi.mocked(isCached).mockResolvedValue(false);
  vi.mocked(isGitHubUrl).mockReturnValue(false);
  vi.mocked(indexExternalContent).mockResolvedValue({ id: 'ext-test1234', success: true });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/admin/rag/crawl', () => {
  it('crawls and indexes a web page', async () => {
    const req = makeRequest({ url: 'https://example.com/docs' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe('ext-test1234');
    expect(data.sourceType).toBe('web-page');
  });

  it('crawls GitHub README when URL is GitHub', async () => {
    vi.mocked(isGitHubUrl).mockReturnValue(true);

    const req = makeRequest({ url: 'https://github.com/ollama/ollama' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sourceType).toBe('github-readme');
    expect(data.title).toBe('Ollama');
  });

  it('returns cached response when content is already cached', async () => {
    vi.mocked(isCached).mockResolvedValue(true);

    const req = makeRequest({ url: 'https://example.com' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cached).toBe(true);
  });

  it('force refreshes when forceRefresh is true', async () => {
    vi.mocked(isCached).mockResolvedValue(true);

    const req = makeRequest({ url: 'https://example.com', forceRefresh: true });
    const res = await POST(req);
    const data = await res.json();

    // Should not return cached response
    expect(data.cached).toBeUndefined();
    expect(data.success).toBe(true);
  });

  it('rejects CSRF with cross-site sec-fetch-site', async () => {
    const req = makeRequest(
      { url: 'https://example.com' },
      { 'sec-fetch-site': 'cross-site', 'origin': null },
    );
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('rejects when not admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('관리자 권한이 필요합니다', 403));

    const req = makeRequest({ url: 'https://example.com' });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('rejects rate-limited requests', async () => {
    const rateLimitResp = new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 });
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      info: { current: 6, limit: 5, remaining: 0, resetIn: 30000 },
      response: rateLimitResp as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    const req = makeRequest({ url: 'https://example.com' });
    const res = await POST(req);

    expect(res.status).toBe(429);
  });

  it('rejects invalid URL', async () => {
    const req = makeRequest({ url: 'not-a-url' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('rejects missing URL', async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('handles indexing failure', async () => {
    vi.mocked(indexExternalContent).mockResolvedValue({
      id: 'ext-fail',
      success: false,
      error: 'ChromaDB unavailable',
    });

    const req = makeRequest({ url: 'https://example.com' });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });

  it('uses custom title when provided', async () => {
    const req = makeRequest({
      url: 'https://example.com',
      title: 'Custom Title',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.title).toBe('Custom Title');
  });
});
