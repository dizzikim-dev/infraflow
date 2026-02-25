import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb
// ---------------------------------------------------------------------------

const mockAdd = vi.fn();
const mockGetOrCreateCollection = vi.fn().mockResolvedValue({
  add: mockAdd,
});
const mockHeartbeat = vi.fn();

vi.mock('chromadb', () => {
  const MockChromaClient = vi.fn().mockImplementation(function (
    this: {
      heartbeat: typeof mockHeartbeat;
      getOrCreateCollection: typeof mockGetOrCreateCollection;
    },
  ) {
    this.heartbeat = mockHeartbeat;
    this.getOrCreateCollection = mockGetOrCreateCollection;
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
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { resetChromaClient } from '../../chromaClient';
import { indexExternalContent, indexExternalContentBatch } from '../liveIndexer';
import type { ExternalIndexRequest } from '../../types';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetChromaClient();
  mockHeartbeat.mockReset();
  mockAdd.mockReset();
  mockGetOrCreateCollection.mockClear();
});

// ---------------------------------------------------------------------------
// indexExternalContent
// ---------------------------------------------------------------------------

describe('indexExternalContent', () => {
  it('indexes content and returns success', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockResolvedValue(undefined);

    const request: ExternalIndexRequest = {
      content: 'Ollama is a local inference engine',
      title: 'Ollama README',
      sourceUrl: 'https://github.com/ollama/ollama',
      sourceType: 'github-readme',
      tags: ['ai', 'inference'],
    };

    const result = await indexExternalContent(request);

    expect(result.success).toBe(true);
    expect(result.id).toBe('ext-abcd1234');
    expect(result.error).toBeUndefined();

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: ['ext-abcd1234'],
        documents: ['Ollama is a local inference engine'],
        metadatas: [
          expect.objectContaining({
            title: 'Ollama README',
            sourceUrl: 'https://github.com/ollama/ollama',
            sourceType: 'github-readme',
            tags: 'ai,inference',
          }),
        ],
        embeddings: [expect.any(Array)],
      }),
    );
  });

  it('returns failure when ChromaDB is unavailable', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));

    const request: ExternalIndexRequest = {
      content: 'test content',
      title: 'Test',
      sourceType: 'web-page',
    };

    const result = await indexExternalContent(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe('ChromaDB unavailable');
  });

  it('handles ChromaDB add failure gracefully', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockRejectedValue(new Error('Collection error'));

    const request: ExternalIndexRequest = {
      content: 'test content',
      title: 'Test',
      sourceType: 'web-page',
    };

    const result = await indexExternalContent(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Collection error');
  });

  it('includes contentHash in metadata', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockResolvedValue(undefined);

    const request: ExternalIndexRequest = {
      content: 'some content',
      title: 'Test',
      sourceType: 'web-page',
    };

    await indexExternalContent(request);

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        metadatas: [
          expect.objectContaining({
            contentHash: expect.stringMatching(/^[0-9a-f]{8}$/),
          }),
        ],
      }),
    );
  });

  it('handles missing optional fields', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockResolvedValue(undefined);

    const request: ExternalIndexRequest = {
      content: 'minimal content',
      title: 'Minimal',
      sourceType: 'web-page',
    };

    const result = await indexExternalContent(request);

    expect(result.success).toBe(true);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        metadatas: [
          expect.objectContaining({
            sourceUrl: '',
            tags: '',
          }),
        ],
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// indexExternalContentBatch
// ---------------------------------------------------------------------------

describe('indexExternalContentBatch', () => {
  it('indexes multiple items in one call', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockResolvedValue(undefined);

    const requests: ExternalIndexRequest[] = [
      { content: 'Item 1', title: 'First', sourceType: 'web-page' },
      { content: 'Item 2', title: 'Second', sourceType: 'github-readme' },
    ];

    const results = await indexExternalContentBatch(requests);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: expect.arrayContaining([expect.stringMatching(/^ext-/)]),
        documents: ['Item 1', 'Item 2'],
      }),
    );
  });

  it('returns empty array for empty input', async () => {
    const results = await indexExternalContentBatch([]);
    expect(results).toHaveLength(0);
  });

  it('returns failures when ChromaDB is unavailable', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));

    const requests: ExternalIndexRequest[] = [
      { content: 'Item 1', title: 'First', sourceType: 'web-page' },
    ];

    const results = await indexExternalContentBatch(requests);

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe('ChromaDB unavailable');
  });

  it('returns failures when batch add fails', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockAdd.mockRejectedValue(new Error('Batch error'));

    const requests: ExternalIndexRequest[] = [
      { content: 'Item 1', title: 'First', sourceType: 'web-page' },
      { content: 'Item 2', title: 'Second', sourceType: 'web-page' },
    ];

    const results = await indexExternalContentBatch(requests);

    expect(results).toHaveLength(2);
    expect(results.every((r) => !r.success)).toBe(true);
    expect(results[0].error).toBe('Batch error');
  });
});
