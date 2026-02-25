import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb (needed by fetchCache, liveIndexer)
// ---------------------------------------------------------------------------

const mockAdd = vi.fn();
const mockHeartbeat = vi.fn();

vi.mock('chromadb', () => {
  const MockChromaClient = vi.fn().mockImplementation(function (
    this: { heartbeat: typeof mockHeartbeat; getOrCreateCollection: () => Promise<{ add: typeof mockAdd }> },
  ) {
    this.heartbeat = mockHeartbeat;
    this.getOrCreateCollection = vi.fn().mockResolvedValue({ add: mockAdd });
  });
  return { ChromaClient: MockChromaClient };
});

// ---------------------------------------------------------------------------
// Mock OpenAI embeddings
// ---------------------------------------------------------------------------

vi.mock('openai', () => ({
  default: class MockOpenAI {
    embeddings = {
      create: vi.fn().mockImplementation(({ input }: { input: string[] }) => {
        return Promise.resolve({
          data: input.map(() => ({
            embedding: new Array(1536).fill(0.1),
          })),
        });
      }),
    };
  },
}));

// ---------------------------------------------------------------------------
// Mock nanoid
// ---------------------------------------------------------------------------

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('abcd1234'),
}));

// ---------------------------------------------------------------------------
// Mock global.fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  mockHeartbeat.mockResolvedValue(true);
  mockAdd.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { liveAugment, extractProductNames } from '../liveAugmenter';
import { resetChromaClient } from '../../chromaClient';

beforeEach(() => {
  resetChromaClient();
});

// ---------------------------------------------------------------------------
// extractProductNames
// ---------------------------------------------------------------------------

describe('extractProductNames', () => {
  it('extracts known product names from query', () => {
    expect(extractProductNames('How do I deploy ollama?')).toEqual(['ollama']);
  });

  it('extracts multiple products', () => {
    const result = extractProductNames('Compare chromadb and milvus for vector search');
    expect(result).toContain('chromadb');
    expect(result).toContain('milvus');
  });

  it('is case-insensitive', () => {
    expect(extractProductNames('How to use LangChain?')).toEqual(['langchain']);
  });

  it('returns empty for unrecognized products', () => {
    expect(extractProductNames('How to set up a firewall?')).toEqual([]);
  });

  it('handles empty query', () => {
    expect(extractProductNames('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// liveAugment
// ---------------------------------------------------------------------------

describe('liveAugment', () => {
  it('fetches and indexes content for known product', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain; charset=utf-8' }),
      text: () => Promise.resolve('# Ollama\n\nRun LLMs locally.\n\n## Features\n\n- Local inference'),
    });

    const result = await liveAugment('How to deploy ollama?', { timeoutMs: 5000 });

    expect(result.attempted).toBe(true);
    expect(result.success).toBe(true);
    expect(result.documentsIndexed).toBe(1);
    expect(result.sourceUrl).toContain('ollama');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns not attempted for unrecognized query', async () => {
    const result = await liveAugment('How to configure a firewall?');

    expect(result.attempted).toBe(false);
    expect(result.success).toBe(false);
    expect(result.documentsIndexed).toBe(0);
  });

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await liveAugment('Tell me about ollama', { timeoutMs: 5000 });

    expect(result.attempted).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('respects timeout', async () => {
    // Mock fetch that takes longer than timeout
    mockFetch.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'text/plain' }),
          text: () => Promise.resolve('content'),
        }), 5000),
      ),
    );

    const result = await liveAugment('Tell me about ollama', { timeoutMs: 100 });

    expect(result.attempted).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
    expect(result.durationMs).toBeLessThan(3000);
  });

  it('returns durationMs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('# vLLM\n\nHigh-throughput inference.'),
    });

    const result = await liveAugment('How does vllm work?', { timeoutMs: 5000 });

    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('handles ChromaDB unavailable gracefully', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
    resetChromaClient();

    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('# Ollama\n\nRun LLMs.'),
    });

    const result = await liveAugment('ollama setup', { timeoutMs: 5000 });

    expect(result.attempted).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ChromaDB unavailable');
  });
});
