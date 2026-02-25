import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/middleware/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    info: { current: 1, limit: 10, remaining: 9, resetIn: 60000 },
  }),
  LLM_RATE_LIMIT: { maxRequests: 10, windowMs: 60000 },
}));

vi.mock('@/lib/llm/providers', () => ({
  detectLLMProvider: vi.fn().mockReturnValue({
    provider: 'anthropic',
    apiKey: 'test-key',
  }),
}));

vi.mock('@/lib/llm/models', () => ({
  LLM_MODELS: {
    ANTHROPIC_DEFAULT: 'claude-3-haiku-20240307',
    OPENAI_DEFAULT: 'gpt-4o-mini',
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { POST } from '../route';
import { checkRateLimit } from '@/lib/middleware/rateLimiter';
import { detectLLMProvider } from '@/lib/llm/providers';

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
  const req = new NextRequest('http://localhost:3000/api/route-prompt', {
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

function validBody() {
  return {
    prompt: '맥미니에서 AI비서 + 클라우드 백업',
    templateMatch: {
      templateId: 'hybrid',
      nodeTypes: ['aws-vpc', 'web-server', 'db-server'],
      confidence: 0.8,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/route-prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to default
    vi.mocked(detectLLMProvider).mockReturnValue({
      provider: 'anthropic',
      apiKey: 'test-key',
    });
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      info: { current: 1, limit: 10, remaining: 9, resetIn: 60000 },
    });
  });

  it('returns CSRF error for cross-origin requests', async () => {
    const req = makeRequest(validBody(), { origin: 'http://evil.com' });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('CSRF');
  });

  it('returns 400 for missing prompt', async () => {
    const req = makeRequest({ templateMatch: { templateId: 'x', nodeTypes: [], confidence: 0.8 } });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing templateMatch', async () => {
    const req = makeRequest({ prompt: 'test prompt' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns use_template when no LLM provider is available', async () => {
    vi.mocked(detectLLMProvider).mockReturnValue(null);

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_template');
    expect(data.reason).toContain('프로바이더');
  });

  it('returns rate limit error when rate limited', async () => {
    const { NextResponse } = await import('next/server');
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      info: { current: 11, limit: 10, remaining: 0, resetIn: 30000 },
      response: NextResponse.json({ success: false, error: 'Rate limited' }, { status: 429 }),
    });

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('falls back to use_template when Anthropic API call fails', async () => {
    // Mock fetch to simulate API failure
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_template');

    globalThis.fetch = originalFetch;
  });

  it('returns use_template when Anthropic returns valid use_template', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '{"decision": "use_template", "reason": "아키텍처가 일치합니다."}' }],
      }),
    });

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_template');
    expect(data.reason).toBe('아키텍처가 일치합니다.');

    globalThis.fetch = originalFetch;
  });

  it('returns use_llm when Anthropic decides template is not appropriate', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '{"decision": "use_llm", "reason": "프롬프트가 AI 비서를 설명하므로 personal-ai가 더 적합합니다."}' }],
      }),
    });

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_llm');
    expect(data.reason).toContain('personal-ai');

    globalThis.fetch = originalFetch;
  });

  it('falls back to use_template when response is unparseable', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: 'This is not JSON' }],
      }),
    });

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_template');

    globalThis.fetch = originalFetch;
  });

  it('works with OpenAI provider', async () => {
    vi.mocked(detectLLMProvider).mockReturnValue({
      provider: 'openai',
      apiKey: 'test-openai-key',
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '{"decision": "use_llm", "reason": "Different architecture needed"}' } }],
      }),
    });

    const req = makeRequest(validBody());
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decision).toBe('use_llm');

    globalThis.fetch = originalFetch;
  });

  it('allows same-origin requests without Origin header', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '{"decision": "use_template", "reason": "ok"}' }],
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/route-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: 'localhost:3000',
      },
      body: JSON.stringify(validBody()),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    globalThis.fetch = originalFetch;
  });
});
