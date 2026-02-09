import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/parse/route';

// Mock environment variables
const originalEnv = process.env;

describe('/api/parse', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('GET /api/parse', () => {
    it('should return available status when no API keys are configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const response = await GET();
      const data = await response.json();

      expect(data.available).toBe(false);
      expect(data.providers.claude).toBe(false);
      expect(data.providers.openai).toBe(false);
    });

    it('should return available status when Claude API key is configured', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-claude-key';
      delete process.env.OPENAI_API_KEY;

      const response = await GET();
      const data = await response.json();

      expect(data.available).toBe(true);
      expect(data.providers.claude).toBe(true);
      expect(data.providers.openai).toBe(false);
    });

    it('should return available status when OpenAI API key is configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const response = await GET();
      const data = await response.json();

      expect(data.available).toBe(true);
      expect(data.providers.claude).toBe(false);
      expect(data.providers.openai).toBe(true);
    });

    it('should return features list', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.features).toEqual({
        intentAnalysis: true,
        positionParsing: true,
        contextAwareness: true,
      });
    });
  });

  describe('POST /api/parse', () => {
    it('should return error for missing prompt', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for non-string prompt', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({ prompt: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return success when LLM is disabled', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          useLLM: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.intent).toBeUndefined();
    });

    it('should return error for unknown provider', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'unknown' as any,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return success with error message when API key is not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({
          prompt: '3티어 웹 아키텍처',
          provider: 'claude',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.error).toContain('API key not configured');
    });

    it('should accept context with currentSpec', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'WAF 추가해줘',
          useLLM: false,
          context: {
            currentSpec: {
              nodes: [{ id: 'user', type: 'user', label: 'User' }],
              connections: [],
            },
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle JSON parse errors', async () => {
      const request = new NextRequest('http://localhost/api/parse', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
