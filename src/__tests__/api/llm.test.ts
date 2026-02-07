import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/llm/route';

// Mock environment variables
const originalEnv = process.env;

// Mock fetch for LLM API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/llm', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('GET /api/llm', () => {
    it('should return configured status when no API keys are configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const response = await GET();
      const data = await response.json();

      expect(data.configured).toBe(false);
      expect(data.providers.claude).toBe(false);
      expect(data.providers.openai).toBe(false);
    });

    it('should return configured status when Claude API key is configured', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-claude-key';
      delete process.env.OPENAI_API_KEY;

      const response = await GET();
      const data = await response.json();

      expect(data.configured).toBe(true);
      expect(data.providers.claude).toBe(true);
      expect(data.providers.openai).toBe(false);
    });

    it('should return configured status when OpenAI API key is configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const response = await GET();
      const data = await response.json();

      expect(data.configured).toBe(true);
      expect(data.providers.claude).toBe(false);
      expect(data.providers.openai).toBe(true);
    });

    it('should return configured status when both API keys are configured', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-claude-key';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const response = await GET();
      const data = await response.json();

      expect(data.configured).toBe(true);
      expect(data.providers.claude).toBe(true);
      expect(data.providers.openai).toBe(true);
    });
  });

  describe('POST /api/llm', () => {
    it('should return error for missing prompt', async () => {
      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({ provider: 'claude' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('prompt');
    });

    it('should return error for missing provider', async () => {
      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('provider');
    });

    it('should return error for invalid provider', async () => {
      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'test prompt',
          provider: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('provider');
    });

    it('should use fallback when Claude API key is not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'claude',
          useFallback: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // With useFallback: true (default), it should succeed with fallback template
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.fromFallback).toBe(true);
    });

    it('should use fallback when OpenAI API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'openai',
          useFallback: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // With useFallback: true (default), it should succeed with fallback template
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.fromFallback).toBe(true);
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should include rate limit info in response', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: '{"nodes":[],"connections":[]}' }],
        }),
      });

      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'claude',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });

    it('should use fallback template when useFallback is true and LLM fails', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      // Mock failed API response
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const request = new NextRequest('http://localhost/api/llm', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'claude',
          useFallback: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // With fallback, it should still succeed
      expect(data.success).toBe(true);
      expect(data.fromFallback).toBe(true);
    });
  });
});
