/**
 * Tests for auth.ts authorize() — account lockout integration
 *
 * Mocks prisma and bcrypt to test the lockout flow end-to-end
 * without a real database.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (vi.hoisted runs before vi.mock hoisting) ────────────────
const { mockFindUnique, mockUpdate, mockCompare, authorizeHolder } = vi.hoisted(() => {
  return {
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
    mockCompare: vi.fn(),
    // Container object to capture the authorize function (avoids TDZ with let)
    authorizeHolder: {
      fn: null as null | ((credentials: Record<string, unknown>) => Promise<unknown>),
    },
  };
});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: { compare: mockCompare },
}));

// Mock next-auth to extract the authorize function
vi.mock('next-auth', () => ({
  default: (config: { providers: Array<{ options?: { authorize?: unknown } }> }) => {
    // Find the Credentials provider (the one with authorize function)
    for (const provider of config.providers) {
      if (provider.options && typeof provider.options.authorize === 'function') {
        authorizeHolder.fn = provider.options.authorize as NonNullable<typeof authorizeHolder.fn>;
      }
    }
    return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() };
  },
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: (opts: Record<string, unknown>) => ({ options: opts }),
}));

vi.mock('next-auth/providers/google', () => ({
  default: () => ({}),
}));

vi.mock('next-auth/providers/github', () => ({
  default: () => ({}),
}));

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ── Import AFTER mocks ─────────────────────────────────────────────
// This triggers NextAuth() which captures authorize via authorizeHolder
import '@/lib/auth/auth';

// ── Helpers ─────────────────────────────────────────────────────────
function authorize(credentials: Record<string, unknown>) {
  if (!authorizeHolder.fn) {
    throw new Error('authorize function was not captured from NextAuth mock');
  }
  return authorizeHolder.fn(credentials);
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    role: 'USER',
    passwordHash: '$2a$10$hashed',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────
describe('authorize() — account lockout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  it('should return null for invalid credentials format', async () => {
    const result = await authorize({ email: 'not-email', password: '' });
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('should return null when user is not found', async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const result = await authorize({
      email: 'unknown@example.com',
      password: 'Password1!',
    });

    expect(result).toBeNull();
  });

  it('should return null when account is locked (lockedUntil in the future)', async () => {
    const lockedUser = makeUser({
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // locked for 10 more minutes
    });
    mockFindUnique.mockResolvedValueOnce(lockedUser);

    const result = await authorize({
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(result).toBeNull();
    // Should NOT check password or update DB
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should allow login when lockout has expired (lockedUntil in the past)', async () => {
    const expiredLockUser = makeUser({
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() - 60 * 1000), // expired 1 min ago
    });
    mockFindUnique.mockResolvedValueOnce(expiredLockUser);
    mockCompare.mockResolvedValueOnce(true);

    const result = await authorize({
      email: 'test@example.com',
      password: 'CorrectPass1!',
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(
      expect.objectContaining({ id: 'user-1', email: 'test@example.com' })
    );
    // Should reset the counter
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    });
  });

  it('should increment failedLoginAttempts on wrong password', async () => {
    const user = makeUser({ failedLoginAttempts: 2 });
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(false);

    const result = await authorize({
      email: 'test@example.com',
      password: 'WrongPass1!',
    });

    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 3,
      }),
    });
    // Should NOT set lockedUntil (only 3 attempts, threshold is 5)
    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.data.lockedUntil).toBeUndefined();
  });

  it('should lock account on 5th consecutive failed attempt', async () => {
    const user = makeUser({ failedLoginAttempts: 4 }); // 4 prior failures
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(false);

    const result = await authorize({
      email: 'test@example.com',
      password: 'WrongPass1!',
    });

    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
      }),
    });

    // Verify lockedUntil is roughly 15 minutes from now
    const lockedUntil = mockUpdate.mock.calls[0][0].data.lockedUntil as Date;
    const expectedMs = 15 * 60 * 1000;
    const diff = lockedUntil.getTime() - Date.now();
    expect(diff).toBeGreaterThan(expectedMs - 2000); // within 2s tolerance
    expect(diff).toBeLessThanOrEqual(expectedMs + 1000);
  });

  it('should reset failedLoginAttempts and lastLoginAt on successful login', async () => {
    const user = makeUser({ failedLoginAttempts: 3 });
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(true);

    const beforeLogin = Date.now();
    const result = await authorize({
      email: 'test@example.com',
      password: 'CorrectPass1!',
    });

    expect(result).not.toBeNull();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: expect.any(Date),
      }),
    });

    const lastLoginAt = mockUpdate.mock.calls[0][0].data.lastLoginAt as Date;
    expect(lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin);
  });

  it('should return user data on successful login', async () => {
    const user = makeUser();
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(true);

    const result = await authorize({
      email: 'test@example.com',
      password: 'CorrectPass1!',
    });

    expect(result).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      role: 'USER',
    });
  });

  it('should still return null on failed password even if DB update fails', async () => {
    const user = makeUser();
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(false);
    mockUpdate.mockRejectedValueOnce(new Error('DB connection failed'));

    const result = await authorize({
      email: 'test@example.com',
      password: 'WrongPass1!',
    });

    expect(result).toBeNull();
  });

  it('should still return user on successful login even if DB reset fails', async () => {
    const user = makeUser();
    mockFindUnique.mockResolvedValueOnce(user);
    mockCompare.mockResolvedValueOnce(true);
    mockUpdate.mockRejectedValueOnce(new Error('DB connection failed'));

    const result = await authorize({
      email: 'test@example.com',
      password: 'CorrectPass1!',
    });

    // Should still return user even though DB update failed
    expect(result).toEqual(
      expect.objectContaining({ id: 'user-1', email: 'test@example.com' })
    );
  });
});
