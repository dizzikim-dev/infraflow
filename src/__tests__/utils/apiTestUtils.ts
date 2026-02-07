/**
 * Test Utility: API Test Utils
 *
 * Utilities for testing Next.js API routes
 */

import { vi, Mock, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================
// Types
// ============================================================

export interface MockRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
  params?: Record<string, string>;
}

export interface MockResponseResult {
  status: number;
  headers: Headers;
  body: unknown;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

// ============================================================
// Request Builders
// ============================================================

/**
 * Create a mock NextRequest for API route testing
 *
 * @example
 * ```ts
 * const request = createMockRequest({
 *   method: 'POST',
 *   body: { prompt: 'test prompt' },
 * });
 *
 * const response = await POST(request);
 * expect(response.status).toBe(200);
 * ```
 */
export function createMockRequest(options: MockRequestOptions = {}): NextRequest {
  const {
    method = 'GET',
    body,
    headers = {},
    searchParams = {},
  } = options;

  // Build URL with search params
  const url = new URL('http://localhost:3000/api/test');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Build headers
  const requestHeaders = new Headers(headers);
  if (body && typeof body === 'object') {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // Create request init
  const init = {
    method,
    headers: requestHeaders,
    body: undefined as string | undefined,
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new NextRequest(url, init);
}

/**
 * Create a mock context object with params (for dynamic routes)
 *
 * @example
 * ```ts
 * const context = createMockContext({ id: '123' });
 * const response = await GET(request, context);
 * ```
 */
export function createMockContext(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) };
}

// ============================================================
// Response Helpers
// ============================================================

/**
 * Parse response from API route
 */
export async function parseResponse(response: Response): Promise<MockResponseResult> {
  const clonedResponse = response.clone();

  let body: unknown;
  try {
    body = await clonedResponse.json();
  } catch {
    body = await response.clone().text();
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
    json: () => response.clone().json(),
    text: () => response.clone().text(),
  };
}

/**
 * Assert response status and return parsed body
 */
export async function expectStatus(
  response: Response,
  expectedStatus: number
): Promise<unknown> {
  const result = await parseResponse(response);

  if (result.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${result.status}. Body: ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
}

/**
 * Assert successful JSON response
 */
export async function expectSuccess<T = unknown>(response: Response): Promise<T> {
  return expectStatus(response, 200) as Promise<T>;
}

/**
 * Assert created response (201)
 */
export async function expectCreated<T = unknown>(response: Response): Promise<T> {
  return expectStatus(response, 201) as Promise<T>;
}

/**
 * Assert bad request response (400)
 */
export async function expectBadRequest(response: Response): Promise<{ error: string }> {
  return expectStatus(response, 400) as Promise<{ error: string }>;
}

/**
 * Assert not found response (404)
 */
export async function expectNotFound(response: Response): Promise<{ error: string }> {
  return expectStatus(response, 404) as Promise<{ error: string }>;
}

/**
 * Assert internal server error response (500)
 */
export async function expectServerError(response: Response): Promise<{ error: string }> {
  return expectStatus(response, 500) as Promise<{ error: string }>;
}

// ============================================================
// Mock Fetch
// ============================================================

/**
 * Create a mock fetch function
 */
export function createMockFetch(
  responses: Array<{
    url?: string | RegExp;
    method?: string;
    response: unknown;
    status?: number;
  }>
): Mock {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    const match = responses.find((r) => {
      const urlMatch = r.url
        ? typeof r.url === 'string'
          ? url.includes(r.url)
          : r.url.test(url)
        : true;
      const methodMatch = r.method ? r.method === method : true;
      return urlMatch && methodMatch;
    });

    if (!match) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      );
    }

    return Promise.resolve(
      new Response(JSON.stringify(match.response), {
        status: match.status || 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
}

// ============================================================
// LLM API Mocks
// ============================================================

/**
 * Mock Anthropic API response
 */
export function createMockAnthropicResponse(content: string) {
  return {
    id: 'msg_mock_123',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: content,
      },
    ],
    model: 'claude-3-sonnet-20240229',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 200,
    },
  };
}

/**
 * Mock OpenAI API response
 */
export function createMockOpenAIResponse(content: string) {
  return {
    id: 'chatcmpl-mock123',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
  };
}

/**
 * Create mock LLM parse result
 */
export function createMockParseResult(overrides = {}) {
  return {
    nodes: [
      { id: 'user-1', type: 'user', label: 'User' },
      { id: 'firewall-1', type: 'firewall', label: 'Firewall' },
      { id: 'web-server-1', type: 'web-server', label: 'Web Server' },
    ],
    connections: [
      { source: 'user-1', target: 'firewall-1' },
      { source: 'firewall-1', target: 'web-server-1' },
    ],
    ...overrides,
  };
}

// ============================================================
// Database Mocks
// ============================================================

/**
 * Mock Prisma client for API tests
 */
export function createMockPrismaClient() {
  const mockComponents = [
    {
      id: '1',
      type: 'firewall',
      name: 'Firewall',
      nameKo: '방화벽',
      category: 'security',
      tier: 'dmz',
      description: 'Network firewall',
      descriptionKo: '네트워크 방화벽',
      functions: ['Packet filtering', 'NAT', 'VPN'],
      functionsKo: ['패킷 필터링', 'NAT', 'VPN'],
      features: ['Stateful', 'Layer 7'],
      featuresKo: ['상태 기반', '레이어 7'],
      vendors: ['Palo Alto', 'Fortinet'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    infraComponent: {
      findMany: vi.fn().mockResolvedValue(mockComponents),
      findUnique: vi.fn((args) => {
        const component = mockComponents.find((c) => c.id === args.where.id);
        return Promise.resolve(component || null);
      }),
      findFirst: vi.fn((args) => {
        const component = mockComponents.find((c) => c.type === args.where.type);
        return Promise.resolve(component || null);
      }),
      create: vi.fn((args) => {
        const newComponent = {
          id: `new-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return Promise.resolve(newComponent);
      }),
      update: vi.fn((args) => {
        const component = mockComponents.find((c) => c.id === args.where.id);
        if (!component) return Promise.resolve(null);
        return Promise.resolve({ ...component, ...args.data });
      }),
      delete: vi.fn((args) => {
        const component = mockComponents.find((c) => c.id === args.where.id);
        return Promise.resolve(component || null);
      }),
      count: vi.fn().mockResolvedValue(mockComponents.length),
    },
    policyRecommendation: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn((args) => Promise.resolve({ id: 'policy-1', ...args.data })),
      delete: vi.fn().mockResolvedValue({}),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
}

// ============================================================
// Environment Mocks
// ============================================================

/**
 * Set up environment variables for testing
 */
export function setupTestEnv(env: Record<string, string> = {}) {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    Object.assign(process.env, {
      ANTHROPIC_API_KEY: 'test-api-key',
      OPENAI_API_KEY: 'test-openai-key',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      ...env,
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });
}

// ============================================================
// Timing Utilities
// ============================================================

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Measure execution time of async function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}
