import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (vi.hoisted runs before vi.mock hoisting) ────────────────
const { mockFindMany, mockCount, mockRequireAdmin } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockRequireAdmin: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    activityEvent: {
      findMany: mockFindMany,
      count: mockCount,
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
import { GET } from '@/app/api/admin/activities/route';
import { AuthError } from '@/lib/auth/authHelpers';
import { NextRequest } from 'next/server';

// ── Helpers ─────────────────────────────────────────────────────────
function makeRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/admin/activities');
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new NextRequest(url);
}

// ── Tests ───────────────────────────────────────────────────────────
describe('GET /api/admin/activities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated requests (401)', async () => {
    mockRequireAdmin.mockRejectedValueOnce(
      new AuthError('로그인이 필요합니다', 401)
    );

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다');
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('should reject non-admin users (403)', async () => {
    mockRequireAdmin.mockRejectedValueOnce(
      new AuthError('관리자 권한이 필요합니다', 403)
    );

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('관리자 권한이 필요합니다');
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('should return activities with default pagination for admin (200)', async () => {
    const mockActivities = [
      {
        id: 'act-1',
        userId: 'user-1',
        type: 'prompt_submit',
        createdAt: '2026-02-22T00:00:00Z',
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com', image: null },
      },
    ];
    mockRequireAdmin.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'ADMIN' },
    });
    mockFindMany.mockResolvedValueOnce(mockActivities);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activities).toEqual(mockActivities);
    expect(data.total).toBe(1);
    expect(data.limit).toBe(50);
    expect(data.offset).toBe(0);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 50,
      skip: 0,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    expect(mockCount).toHaveBeenCalledWith({ where: {} });
  });

  it('should pass filter params to Prisma query', async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'ADMIN' },
    });
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    const res = await GET(
      makeRequest({
        userId: 'user-42',
        diagramId: 'diag-7',
        type: 'node_add',
        limit: '10',
        offset: '20',
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(20);

    const expectedWhere = {
      userId: 'user-42',
      diagramId: 'diag-7',
      type: 'node_add',
    };
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
        take: 10,
        skip: 20,
      })
    );
    expect(mockCount).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('should clamp limit to maximum 200', async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'ADMIN' },
    });
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    const res = await GET(makeRequest({ limit: '999' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.limit).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    );
  });

  it('should clamp negative offset to 0', async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'ADMIN' },
    });
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    const res = await GET(makeRequest({ offset: '-5' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.offset).toBe(0);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });
});
