import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/dashboard', '/admin'];
const adminPaths = ['/admin'];
const authPaths = ['/auth/login', '/auth/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect dashboard and admin routes
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (adminPaths.some((p) => pathname.startsWith(p)) && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};
