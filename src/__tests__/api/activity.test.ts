import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (vi.hoisted runs before vi.mock hoisting) ────────────────
const { mockCreate, mockAuth } = vi.hoisted(() => {
  // Set DATABASE_URL so hasDb is true when the route module loads
  process.env.DATABASE_URL = 'mock://test';
  return {
    mockCreate: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    mockAuth: vi.fn(),
  };
});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    activityEvent: { create: mockCreate },
  },
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// ── Import AFTER mocks ─────────────────────────────────────────────
import { POST } from '@/app/api/activity/route';

// ── Helpers ─────────────────────────────────────────────────────────
function makeRequest(body: Record<string, unknown>, headers?: Record<string, string>) {
  return new Request('http://localhost/api/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// ── Tests ───────────────────────────────────────────────────────────
describe('POST /api/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated requests (401)', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ type: 'node_add', sessionId: 'sess-1' }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should validate required fields — missing type and sessionId (400)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } });

    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('type and sessionId required');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should reject invalid activity type (400)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } });

    const res = await POST(makeRequest({ type: 'invalid_type', sessionId: 'sess-1' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid activity type');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should create activity event for authenticated user (200)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } });

    const res = await POST(
      makeRequest({
        type: 'prompt_submit',
        sessionId: 'sess-1',
        diagramId: 'diag-1',
        prompt: '3-tier web architecture',
        detail: { source: 'test' },
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'prompt_submit',
        sessionId: 'sess-1',
        diagramId: 'diag-1',
        prompt: '3-tier web architecture',
        detail: { source: 'test' },
      },
    });
  });
});
