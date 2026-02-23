import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/auth.config';
import { generateNonce, buildCspHeader } from '@/lib/security/cspNonce';

const authHandler = NextAuth(authConfig).auth;

/** Paths that require NextAuth middleware */
const AUTH_PATHS = ['/dashboard', '/admin', '/auth'];

function requiresAuth(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

export default async function middleware(request: NextRequest) {
  // HTTPS enforcement in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Generate CSP nonce for this request
  const nonce = generateNonce();
  const cspHeader = buildCspHeader(nonce);

  // Clone request headers and add the nonce for downstream consumption
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // For auth-protected paths, delegate to NextAuth then attach CSP to its response
  if (requiresAuth(request.nextUrl.pathname)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authResponse = await (authHandler as any)(request);

    if (authResponse) {
      // Auth middleware returned a response (redirect or error) — attach CSP
      authResponse.headers.set('Content-Security-Policy', cspHeader);
      authResponse.headers.set('x-nonce', nonce);
      return authResponse;
    }
  }

  // For all other paths (or when auth passes through), create response with CSP
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
