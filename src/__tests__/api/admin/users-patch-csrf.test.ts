/**
 * CSRF Protection Tests for PATCH /api/admin/users/[id]
 *
 * Verifies that the PATCH endpoint rejects cross-origin requests
 * via Sec-Fetch-Site and Origin header checks.
 *
 * Note: happy-dom treats `origin` and `sec-fetch-site` as forbidden headers
 * (per Fetch spec), so we test the CSRF logic by mocking req.headers.get().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (vi.hoisted runs before vi.mock hoisting) ────────────────
const { mockRequireAdmin, mockFindUnique, mockUpdate } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

vi.mock('@/lib/auth/authHelpers', () => {
  class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401) {
      super(message);
      this.name = 'AuthError';
      this.statusCode = statusCode;
    }
  }
  return {
    requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
    AuthError,
  };
});

// ── Import AFTER mocks ─────────────────────────────────────────────
import { PATCH } from '@/app/api/admin/users/[id]/route';
import { NextRequest } from 'next/server';

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Create a PATCH request with custom header overrides.
 * happy-dom strips `origin` and `sec-fetch-site` (forbidden headers per Fetch spec),
 * so we monkey-patch `headers.get` after construction.
 */
function makePatchRequest(
  body: unknown,
  headerOverrides: Record<string, string | null> = {}
): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/admin/users/user-123', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      host: 'localhost:3000',
    },
    body: JSON.stringify(body),
  });

  // Monkey-patch headers.get to return custom values for forbidden headers
  const originalGet = req.headers.get.bind(req.headers);
  vi.spyOn(req.headers, 'get').mockImplementation((name: string) => {
    const lower = name.toLowerCase();
    if (lower in headerOverrides) {
      return headerOverrides[lower] ?? null;
    }
    return originalGet(name);
  });

  return req;
}

// ── Tests ───────────────────────────────────────────────────────────
describe('PATCH /api/admin/users/[id] — CSRF Protection', () => {
  const params = Promise.resolve({ id: 'user-123' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    });
  });

  it('should reject request with cross-origin Sec-Fetch-Site header', async () => {
    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'sec-fetch-site': 'cross-site', 'origin': null }
    );

    const res = await PATCH(req, { params });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('CSRF validation failed');
  });

  it('should reject request with wrong Origin header', async () => {
    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'origin': 'https://evil.com', 'sec-fetch-site': null }
    );

    const res = await PATCH(req, { params });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('CSRF validation failed');
  });

  it('should allow request with same-origin Sec-Fetch-Site header', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'user-123' });
    mockUpdate.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test',
      email: 'test@example.com',
      role: 'ADMIN',
    });

    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'sec-fetch-site': 'same-origin', 'origin': 'http://localhost:3000' }
    );

    const res = await PATCH(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeDefined();
  });

  it('should allow request with matching Origin header and no Sec-Fetch-Site', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'user-123' });
    mockUpdate.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test',
      email: 'test@example.com',
      role: 'ADMIN',
    });

    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'origin': 'http://localhost:3000', 'sec-fetch-site': null }
    );

    const res = await PATCH(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeDefined();
  });

  it('should allow request with Sec-Fetch-Site: none (direct navigation)', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'user-123' });
    mockUpdate.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test',
      email: 'test@example.com',
      role: 'ADMIN',
    });

    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'sec-fetch-site': 'none', 'origin': 'http://localhost:3000' }
    );

    const res = await PATCH(req, { params });

    expect(res.status).toBe(200);
  });

  it('should reject Sec-Fetch-Site: same-site (subdomain attack)', async () => {
    const req = makePatchRequest(
      { role: 'ADMIN' },
      { 'sec-fetch-site': 'same-site', 'origin': null }
    );

    const res = await PATCH(req, { params });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('CSRF validation failed');
  });
});
