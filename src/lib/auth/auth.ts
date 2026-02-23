/**
 * NextAuth.js v5 Full Configuration
 *
 * - Extends Edge-compatible config with PrismaAdapter + Credentials provider
 * - This file must NOT be imported from middleware.ts (uses Prisma)
 * - Includes account lockout after MAX_FAILED_ATTEMPTS consecutive failures
 *
 * NOTE: The lockout fields (failedLoginAttempts, lockedUntil, lastLoginAt) are
 * defined in prisma/schema.prisma but require `prisma migrate` + `prisma generate`
 * to appear in the generated client types. Until then, we use type assertions.
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { LoginSchema } from '@/lib/validations/auth';
import { authConfig } from './auth.config';
import { createLogger } from '@/lib/utils/logger';
import {
  isAccountLocked,
  shouldLockAccount,
  getLockoutExpiry,
} from './loginSecurity';

const logger = createLogger('Auth');

/**
 * Extended user type with lockout fields.
 * These fields exist in the Prisma schema but may not be in the generated
 * client yet (pending migration). This interface bridges the gap.
 */
interface UserWithLockout {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  passwordHash: string | null;
  role: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const rawUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!rawUser || !rawUser.passwordHash) return null;

        // Cast to include lockout fields (present after migration)
        const user = rawUser as unknown as UserWithLockout;

        // Check if account is locked
        if (isAccountLocked(user.lockedUntil ?? null)) {
          logger.warn('Login attempt on locked account', { email });
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash!);

        if (!isValid) {
          // Failed login — increment counter, possibly lock
          try {
            const newFailedAttempts = (user.failedLoginAttempts ?? 0) + 1;
            const lockData = shouldLockAccount(newFailedAttempts)
              ? { lockedUntil: getLockoutExpiry() }
              : {};

            await prisma.user.update({
              where: { id: user.id },
              data: {
                ...lockData,
                failedLoginAttempts: newFailedAttempts,
              } as Record<string, unknown>,
            });

            if (lockData.lockedUntil) {
              logger.warn('Account locked due to too many failed attempts', {
                email,
                failedAttempts: newFailedAttempts,
              });
            }
          } catch (error) {
            // DB update failure should not crash auth — log and continue
            logger.error(
              'Failed to update login attempt counter',
              error instanceof Error ? error : new Error(String(error)),
              { email }
            );
          }

          return null;
        }

        // Successful login — reset lockout state
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            } as Record<string, unknown>,
          });
        } catch (error) {
          // DB update failure should not prevent successful login
          logger.error(
            'Failed to reset login state on successful login',
            error instanceof Error ? error : new Error(String(error)),
            { email }
          );
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
