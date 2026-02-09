/**
 * NextAuth.js v5 Edge-compatible Configuration
 *
 * This file contains ONLY the config that can run in Edge Runtime
 * (no Prisma, no bcrypt, no DB access).
 * Used by middleware.ts for JWT session verification.
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = ((user as { role?: string }).role as 'USER' | 'ADMIN') ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isAdmin = auth?.user?.role === 'ADMIN';

      const protectedPaths = ['/dashboard', '/admin'];
      const adminPaths = ['/admin'];
      const authPaths = ['/auth/login', '/auth/register'];

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Protect dashboard and admin routes
      if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!isLoggedIn) return false; // redirects to signIn page
        if (adminPaths.some((p) => pathname.startsWith(p)) && !isAdmin) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
