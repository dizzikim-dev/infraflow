/**
 * Tests for CSP Nonce Generator & Header Builder
 *
 * Verifies nonce generation produces unique, properly formatted base64 strings,
 * and that the CSP header builder correctly includes the nonce in script-src
 * while preserving all other security directives.
 */

import { describe, it, expect } from 'vitest';
import { generateNonce, buildCspHeader } from '../cspNonce';

describe('generateNonce', () => {
  it('should return a base64-encoded string', () => {
    const nonce = generateNonce();
    // Base64 regex: only A-Z, a-z, 0-9, +, /, and optional = padding
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('should return a string of expected length (24 chars for 16 bytes)', () => {
    const nonce = generateNonce();
    // 16 bytes -> ceil(16/3)*4 = 24 characters in base64
    expect(nonce.length).toBe(24);
  });

  it('should return different values on each call', () => {
    const nonces = new Set<string>();
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce());
    }
    // With 16 bytes of randomness, collisions are astronomically unlikely
    expect(nonces.size).toBe(100);
  });
});

describe('buildCspHeader', () => {
  const testNonce = 'dGVzdE5vbmNlMTIzNDU2Nzg=';

  it('should include the nonce in script-src', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain(`'nonce-${testNonce}'`);
  });

  it('should include the nonce in script-src directive specifically', () => {
    const csp = buildCspHeader(testNonce);
    // Extract script-src directive
    const scriptSrc = csp
      .split('; ')
      .find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).toContain(`'nonce-${testNonce}'`);
  });

  it('should NOT contain unsafe-inline in script-src', () => {
    const csp = buildCspHeader(testNonce);
    const scriptSrc = csp
      .split('; ')
      .find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('should keep unsafe-eval in script-src for Next.js dev compatibility', () => {
    const csp = buildCspHeader(testNonce);
    const scriptSrc = csp
      .split('; ')
      .find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toContain("'unsafe-eval'");
  });

  it('should keep unsafe-inline in style-src for Tailwind/next-font', () => {
    const csp = buildCspHeader(testNonce);
    const styleSrc = csp
      .split('; ')
      .find((d) => d.startsWith('style-src'));
    expect(styleSrc).toBeDefined();
    expect(styleSrc).toContain("'unsafe-inline'");
  });

  it('should include default-src self', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain("default-src 'self'");
  });

  it('should include img-src with self, data, and blob', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain("img-src 'self' data: blob:");
  });

  it('should include font-src self', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain("font-src 'self'");
  });

  it('should include connect-src with Anthropic API', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain("connect-src 'self' https://api.anthropic.com");
  });

  it('should include frame-ancestors none', () => {
    const csp = buildCspHeader(testNonce);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('should produce a valid semicolon-separated directive string', () => {
    const csp = buildCspHeader(testNonce);
    const directives = csp.split('; ');
    expect(directives.length).toBe(7);
    // Each directive should have a directive name
    for (const directive of directives) {
      expect(directive).toMatch(/^[a-z-]+\s/);
    }
  });
});
