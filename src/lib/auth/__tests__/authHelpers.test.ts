import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requireAuth, requireAdmin, AuthError } from '../authHelpers';

// Mock next-auth's auth() function
vi.mock('../auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '../auth';
const mockAuth = vi.mocked(auth);

describe('authHelpers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockAuth.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ============================================================
  // requireAuth — Demo Mode
  // ============================================================

  describe('requireAuth', () => {
    it('should return USER role session when NEXT_PUBLIC_DEMO_MODE=true', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');

      const session = await requireAuth();

      expect(session.user.role).toBe('USER');
      expect(session.user.id).toBe('demo-user');
      expect(session.user.email).toBe('user@infraflow.dev');
      expect(mockAuth).not.toHaveBeenCalled();
    });

    it('should NOT return ADMIN role in demo mode by default', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');

      const session = await requireAuth();

      expect(session.user.role).not.toBe('ADMIN');
    });

    it('should call auth() when demo mode is disabled', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      mockAuth.mockResolvedValue({
        user: { id: 'real-user', name: 'Real User', email: 'real@test.com', role: 'USER' },
        expires: '2026-12-31T23:59:59.999Z',
      } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      const session = await requireAuth();

      expect(mockAuth).toHaveBeenCalledOnce();
      expect(session.user.id).toBe('real-user');
    });

    it('should throw AuthError(401) when auth() returns null (not logged in)', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      mockAuth.mockResolvedValue(null as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      await expect(requireAuth()).rejects.toThrow(AuthError);
      await expect(requireAuth()).rejects.toThrow('로그인이 필요합니다');
    });

    it('should throw AuthError(401) when session has no user', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      mockAuth.mockResolvedValue({ user: undefined, expires: '' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      await expect(requireAuth()).rejects.toThrow(AuthError);
    });
  });

  // ============================================================
  // requireAdmin — Demo Mode
  // ============================================================

  describe('requireAdmin', () => {
    it('should throw AuthError(403) in demo mode without DEMO_ADMIN_ENABLED', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');

      await expect(requireAdmin()).rejects.toThrow(AuthError);
      await expect(requireAdmin()).rejects.toThrow('관리자 권한이 필요합니다');
    });

    it('should return ADMIN session when DEMO_ADMIN_ENABLED=true in demo mode', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
      vi.stubEnv('DEMO_ADMIN_ENABLED', 'true');

      const session = await requireAdmin();

      expect(session.user.role).toBe('ADMIN');
      expect(session.user.id).toBe('demo-admin');
      expect(session.user.email).toBe('admin@infraflow.dev');
    });

    it('should NOT grant admin when only DEMO_ADMIN_ENABLED=true (no demo mode)', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      vi.stubEnv('DEMO_ADMIN_ENABLED', 'true');
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', name: 'Regular', email: 'reg@test.com', role: 'USER' },
        expires: '2026-12-31T23:59:59.999Z',
      } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      await expect(requireAdmin()).rejects.toThrow(AuthError);
      await expect(requireAdmin()).rejects.toThrow('관리자 권한이 필요합니다');
    });

    it('should pass through real ADMIN session when not in demo mode', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      mockAuth.mockResolvedValue({
        user: { id: 'admin-1', name: 'Real Admin', email: 'admin@test.com', role: 'ADMIN' },
        expires: '2026-12-31T23:59:59.999Z',
      } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      const session = await requireAdmin();

      expect(session.user.role).toBe('ADMIN');
      expect(session.user.id).toBe('admin-1');
    });

    it('should throw AuthError(403) when real user is not admin', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
      mockAuth.mockResolvedValue({
        user: { id: 'user-2', name: 'Normal', email: 'normal@test.com', role: 'USER' },
        expires: '2026-12-31T23:59:59.999Z',
      } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      await expect(requireAdmin()).rejects.toThrow(AuthError);
    });
  });

  // ============================================================
  // AuthError
  // ============================================================

  describe('AuthError', () => {
    it('should default to statusCode 401', () => {
      const err = new AuthError('test');
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('AuthError');
    });

    it('should accept custom statusCode', () => {
      const err = new AuthError('forbidden', 403);
      expect(err.statusCode).toBe(403);
    });
  });
});
