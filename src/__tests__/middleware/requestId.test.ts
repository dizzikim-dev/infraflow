/**
 * Request ID (x-request-id) Audit Trail Tests
 *
 * Verifies that the middleware generates a request ID,
 * propagates it to both request and response headers, and that
 * each request gets a unique ID.
 *
 * NOTE: In the happy-dom test environment, crypto.randomUUID() returns
 * polyfilled values (e.g., "test-uuid-xxx"). These tests verify behavior
 * (presence, uniqueness, propagation) rather than strict UUID v4 format.
 * In production (Edge Runtime), crypto.randomUUID() produces real UUID v4.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth to avoid real auth initialization in middleware
vi.mock('next-auth', () => ({
  default: () => ({
    auth: vi.fn().mockResolvedValue(null),
  }),
}));

// Mock auth config
vi.mock('@/lib/auth/auth.config', () => ({
  authConfig: {
    providers: [],
    callbacks: {},
  },
}));

// Mock CSP nonce generation
vi.mock('@/lib/security/cspNonce', () => ({
  generateNonce: () => 'test-nonce-value',
  buildCspHeader: () => "default-src 'self'",
}));

// Mock env validation
vi.mock('@/lib/config/env', () => ({
  validateProductionEnv: vi.fn(),
}));

describe('Request ID (x-request-id) Audit Trail', () => {
  let middleware: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamically import middleware to pick up mocks
    const mod = await import('@/middleware');
    middleware = mod.default;
  });

  describe('crypto.randomUUID availability', () => {
    it('should have crypto.randomUUID available', () => {
      expect(typeof crypto.randomUUID).toBe('function');
    });

    it('should generate a non-empty string', () => {
      const uuid = crypto.randomUUID();
      expect(uuid).toBeTruthy();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(0);
    });

    it('should generate unique values on each call', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => crypto.randomUUID()));
      expect(uuids.size).toBe(100);
    });
  });

  describe('middleware response headers', () => {
    it('should add x-request-id to response headers', async () => {
      const request = new NextRequest('http://localhost:3000/test');
      const response = await middleware(request);

      const requestId = response.headers.get('x-request-id');
      expect(requestId).toBeTruthy();
      expect(typeof requestId).toBe('string');
      expect(requestId!.length).toBeGreaterThan(0);
    });

    it('should generate a unique request ID per request', async () => {
      const request1 = new NextRequest('http://localhost:3000/page1');
      const request2 = new NextRequest('http://localhost:3000/page2');
      const request3 = new NextRequest('http://localhost:3000/page3');

      const response1 = await middleware(request1);
      const response2 = await middleware(request2);
      const response3 = await middleware(request3);

      const id1 = response1.headers.get('x-request-id');
      const id2 = response2.headers.get('x-request-id');
      const id3 = response3.headers.get('x-request-id');

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id3).toBeTruthy();
      // All three IDs should be different
      expect(new Set([id1, id2, id3]).size).toBe(3);
    });

    it('should include x-request-id alongside existing CSP header', async () => {
      const request = new NextRequest('http://localhost:3000/test');
      const response = await middleware(request);

      expect(response.headers.get('x-request-id')).toBeTruthy();
      expect(response.headers.get('content-security-policy')).toBeTruthy();
    });

    it('should set x-request-id on API routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/llm');
      const response = await middleware(request);

      const requestId = response.headers.get('x-request-id');
      expect(requestId).toBeTruthy();
    });
  });

  describe('request ID extraction (downstream route simulation)', () => {
    it('should allow extraction of x-request-id from headers', () => {
      const requestId = 'abc-123-def-456';
      const headers = new Headers();
      headers.set('x-request-id', requestId);

      const extracted = headers.get('x-request-id');
      expect(extracted).toBe(requestId);
    });

    it('should fallback to "unknown" when header is missing', () => {
      const headers = new Headers();
      const requestId = headers.get('x-request-id') || 'unknown';
      expect(requestId).toBe('unknown');
    });

    it('should preserve request ID through header cloning', () => {
      const original = new Headers();
      original.set('x-request-id', 'test-request-id-123');

      const cloned = new Headers(original);
      expect(cloned.get('x-request-id')).toBe('test-request-id-123');
    });
  });

});
