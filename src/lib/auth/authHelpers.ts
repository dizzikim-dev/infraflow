/**
 * Auth Helper Functions
 *
 * Utility functions for protecting API routes and pages.
 */

import { auth } from './auth';

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
