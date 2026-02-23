/**
 * Auth Helper Functions
 *
 * Utility functions for protecting API routes and pages.
 */

import { auth } from './auth';

/** Fake admin session returned when NEXT_PUBLIC_DEMO_MODE=true (DB-free deployment) */
const DEMO_SESSION = {
  user: { id: 'demo-admin', name: 'Demo Admin', email: 'admin@infraflow.dev', role: 'ADMIN' as const },
  expires: '2099-12-31T23:59:59.999Z',
};

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Get authenticated session or throw AuthError.
 * Use in API routes that require authentication.
 */
export async function requireAuth() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return DEMO_SESSION;

  const session = await auth();

  if (!session?.user) {
    throw new AuthError('로그인이 필요합니다', 401);
  }

  return session;
}

/**
 * Get authenticated admin session or throw AuthError.
 * Use in API routes that require admin access.
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    throw new AuthError('관리자 권한이 필요합니다', 403);
  }

  return session;
}
