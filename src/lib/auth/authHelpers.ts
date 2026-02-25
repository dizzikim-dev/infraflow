/**
 * Auth Helper Functions
 *
 * Utility functions for protecting API routes and pages.
 */

import { auth } from './auth';

/** User-level demo session (default for demo mode — safe for public demos) */
const DEMO_SESSION = {
  user: { id: 'demo-user', name: 'Demo User', email: 'user@infraflow.dev', role: 'USER' as const },
  expires: '2099-12-31T23:59:59.999Z',
};

/** Admin-level demo session (only when DEMO_ADMIN_ENABLED=true — controlled environments only) */
const DEMO_ADMIN_SESSION = {
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
 *
 * In demo mode, returns a USER-level session (safe for public access).
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
 *
 * In demo mode, only grants admin access when DEMO_ADMIN_ENABLED=true.
 * This prevents demo deployments from exposing admin functionality by default.
 */
export async function requireAdmin() {
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' &&
    process.env.DEMO_ADMIN_ENABLED === 'true'
  ) {
    return DEMO_ADMIN_SESSION;
  }

  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    throw new AuthError('관리자 권한이 필요합니다', 403);
  }

  return session;
}
