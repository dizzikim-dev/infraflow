/**
 * Tests for auth.config.ts
 *
 * Verifies JWT callback behavior including session fixation prevention (jti).
 */

import { describe, it, expect } from 'vitest';
import { authConfig } from '@/lib/auth/auth.config';

describe('authConfig', () => {
  describe('session', () => {
    it('should use jwt strategy', () => {
      expect(authConfig.session.strategy).toBe('jwt');
    });

    it('should have 24h max age', () => {
      expect(authConfig.session.maxAge).toBe(24 * 60 * 60);
    });

    it('should have 2h update age', () => {
      expect(authConfig.session.updateAge).toBe(2 * 60 * 60);
    });
  });

  describe('jwt callback', () => {
    const jwtCallback = authConfig.callbacks.jwt;

    it('should set token.id from user on login', async () => {
      const token = {} as Record<string, unknown>;
      const user = { id: 'user-123', role: 'USER' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      expect(result.id).toBe('user-123');
    });

    it('should set token.role from user on login', async () => {
      const token = {} as Record<string, unknown>;
      const user = { id: 'user-123', role: 'ADMIN' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      expect(result.role).toBe('ADMIN');
    });

    it('should set jti (JWT ID) on login for session fixation prevention', async () => {
      const token = {} as Record<string, unknown>;
      const user = { id: 'user-123', role: 'USER' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      expect(result.jti).toBeDefined();
      expect(typeof result.jti).toBe('string');
      // UUID v4 format check
      expect(result.jti).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique jti for each login', async () => {
      const user = { id: 'user-123', role: 'USER' };

      const result1 = await jwtCallback({
        token: {} as Record<string, unknown>,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      const result2 = await jwtCallback({
        token: {} as Record<string, unknown>,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      expect(result1.jti).not.toBe(result2.jti);
    });

    it('should not override jti on subsequent token refreshes (no user)', async () => {
      const token = { id: 'user-123', role: 'USER', jti: 'existing-jti' } as Record<string, unknown>;

      const result = await jwtCallback({
        token,
        user: undefined,
        account: null,
        trigger: 'update',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      // When there's no user (not a login), jti should remain unchanged
      expect(result.jti).toBe('existing-jti');
    });

    it('should default role to USER when user has no role', async () => {
      const token = {} as Record<string, unknown>;
      const user = { id: 'user-123' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as unknown as Parameters<typeof jwtCallback>[0]);

      expect(result.role).toBe('USER');
    });
  });

  describe('session callback', () => {
    const sessionCallback = authConfig.callbacks.session;

    it('should copy id and role from token to session.user', async () => {
      const session = { user: { id: '', role: '' } };
      const token = { id: 'user-123', role: 'ADMIN' };

      const result = await sessionCallback({
        session,
        token,
      } as unknown as Parameters<typeof sessionCallback>[0]);

      expect(result.user.id).toBe('user-123');
      expect(result.user.role).toBe('ADMIN');
    });
  });
});
