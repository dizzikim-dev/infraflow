/**
 * Tests for security headers in next.config.mjs
 *
 * Verifies that required security headers (HSTS, X-Content-Type-Options,
 * Referrer-Policy, X-Frame-Options) are present in the Next.js config.
 * Note: CSP is now set dynamically in middleware with per-request nonce.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import nextConfig from '../../../next.config.mjs';

interface HeaderEntry {
  key: string;
  value: string;
}

interface RouteHeaders {
  source: string;
  headers: HeaderEntry[];
}

interface NextConfigWithHeaders {
  headers: () => Promise<RouteHeaders[]>;
  poweredByHeader: boolean;
}

describe('next.config.mjs security headers', () => {
  let headers: HeaderEntry[];

  // The headers function returns an array of route-header entries.
  // We test the catch-all route '/(.*)'
  beforeAll(async () => {
    const config = nextConfig as NextConfigWithHeaders;
    const headerConfig = await config.headers();
    const catchAll = headerConfig.find((h) => h.source === '/(.*)');
    headers = catchAll?.headers ?? [];
  });

  it('should have Strict-Transport-Security (HSTS) header', () => {
    const hsts = headers.find((h) => h.key === 'Strict-Transport-Security');
    expect(hsts).toBeDefined();
    expect(hsts!.value).toContain('max-age=31536000');
    expect(hsts!.value).toContain('includeSubDomains');
  });

  it('should have X-Content-Type-Options header', () => {
    const xcto = headers.find((h) => h.key === 'X-Content-Type-Options');
    expect(xcto).toBeDefined();
    expect(xcto!.value).toBe('nosniff');
  });

  it('should have Referrer-Policy header', () => {
    const rp = headers.find((h) => h.key === 'Referrer-Policy');
    expect(rp).toBeDefined();
    expect(rp!.value).toBe('strict-origin-when-cross-origin');
  });

  it('should have X-Frame-Options header', () => {
    const xfo = headers.find((h) => h.key === 'X-Frame-Options');
    expect(xfo).toBeDefined();
    expect(xfo!.value).toBe('DENY');
  });

  it('should NOT have static Content-Security-Policy (now in middleware)', () => {
    const csp = headers.find((h) => h.key === 'Content-Security-Policy');
    expect(csp).toBeUndefined();
  });

  it('should have poweredByHeader disabled', () => {
    expect((nextConfig as NextConfigWithHeaders).poweredByHeader).toBe(false);
  });
});
