import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/auth.config';

const authHandler = NextAuth(authConfig).auth;

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

  // Delegate to NextAuth middleware
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (authHandler as any)(request);
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};
