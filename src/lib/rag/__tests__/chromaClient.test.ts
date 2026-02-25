import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb — must be declared before imports
// ---------------------------------------------------------------------------

const mockHeartbeat = vi.fn();

vi.mock('chromadb', () => {
  const MockChromaClient = vi.fn().mockImplementation(function (this: { heartbeat: typeof mockHeartbeat }) {
    this.heartbeat = mockHeartbeat;
  });
  return { ChromaClient: MockChromaClient };
});

import type {
  RAGConfig,
  RAGCollectionConfig,
  RAGDocument,
  RAGSearchResult,
  RAGSearchOptions,
} from '../types';
import {
  COLLECTIONS,
  RAG_CONFIG,
  getChromaClient,
  isChromaAvailable,
  resetChromaClient,
} from '../chromaClient';

// ---------------------------------------------------------------------------
// Types compile correctly
// ---------------------------------------------------------------------------

describe('RAG types', () => {
  it('RAGConfig compiles with all fields', () => {
    const config: RAGConfig = {
      persistDirectory: '.chroma',
      embeddingModel: 'text-embedding-ada-002',
      defaultTopK: 10,
      similarityThreshold: 0.7,
    };
    expect(config.persistDirectory).toBe('.chroma');
    expect(config.embeddingModel).toBe('text-embedding-ada-002');
    expect(config.defaultTopK).toBe(10);
    expect(config.similarityThreshold).toBe(0.7);
  });

  it('RAGCollectionConfig compiles with all fields', () => {
    const config: RAGCollectionConfig = {
      name: 'test-collection',
      description: 'A test collection',
      metadataFields: ['category', 'source'],
    };
    expect(config.name).toBe('test-collection');
    expect(config.metadataFields).toHaveLength(2);
  });

  it('RAGDocument compiles with all fields', () => {
    const doc: RAGDocument = {
      id: 'doc-1',
      content: 'Some content',
      metadata: { category: 'network' },
      score: 0.95,
      collection: 'infraflow-ai-software',
    };
    expect(doc.id).toBe('doc-1');
    expect(doc.score).toBe(0.95);
  });

  it('RAGSearchResult compiles with all fields', () => {
    const result: RAGSearchResult = {
      documents: [],
      totalResults: 0,
      queryTimeMs: 12,
    };
    expect(result.totalResults).toBe(0);
  });

  it('RAGSearchOptions compiles with optional fields', () => {
    const opts: RAGSearchOptions = {};
    expect(opts.topK).toBeUndefined();

    const fullOpts: RAGSearchOptions = {
      topK: 5,
      collections: ['infraflow-ai-software'],
      filters: { category: 'network' },
      similarityThreshold: 0.8,
    };
    expect(fullOpts.topK).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// COLLECTIONS constant
// ---------------------------------------------------------------------------

describe('COLLECTIONS', () => {
  it('has all 5 collection names', () => {
    expect(Object.keys(COLLECTIONS)).toHaveLength(5);
    expect(COLLECTIONS.AI_SOFTWARE).toBe('infraflow-ai-software');
    expect(COLLECTIONS.CLOUD_SERVICES).toBe('infraflow-cloud-services');
    expect(COLLECTIONS.DEPLOYMENT_SCENARIOS).toBe('infraflow-deployment-scenarios');
    expect(COLLECTIONS.INTEGRATION_PATTERNS).toBe('infraflow-integration-patterns');
    expect(COLLECTIONS.EXTERNAL_CONTENT).toBe('infraflow-external-content');
  });
});

// ---------------------------------------------------------------------------
// RAG_CONFIG defaults
// ---------------------------------------------------------------------------

describe('RAG_CONFIG', () => {
  it('has correct default values', () => {
    expect(RAG_CONFIG.persistDirectory).toBe('.chroma');
    expect(RAG_CONFIG.embeddingModel).toBe('text-embedding-ada-002');
    expect(RAG_CONFIG.defaultTopK).toBe(10);
    expect(RAG_CONFIG.similarityThreshold).toBe(0.7);
  });
});

// ---------------------------------------------------------------------------
// Exported functions exist
// ---------------------------------------------------------------------------

describe('exported functions', () => {
  it('getChromaClient is a function', () => {
    expect(typeof getChromaClient).toBe('function');
  });

  it('isChromaAvailable is a function', () => {
    expect(typeof isChromaAvailable).toBe('function');
  });

  it('resetChromaClient is a function', () => {
    expect(typeof resetChromaClient).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Graceful degradation — ChromaDB unavailable
// ---------------------------------------------------------------------------

describe('when ChromaDB is not running', () => {
  beforeEach(() => {
    resetChromaClient();
    mockHeartbeat.mockReset();
  });

  it('getChromaClient returns null (not throw)', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
    const client = await getChromaClient();
    expect(client).toBeNull();
  });

  it('isChromaAvailable returns false', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
    const available = await isChromaAvailable();
    expect(available).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Successful connection
// ---------------------------------------------------------------------------

describe('when ChromaDB is running', () => {
  beforeEach(() => {
    resetChromaClient();
    mockHeartbeat.mockReset();
  });

  it('getChromaClient returns a client object', async () => {
    mockHeartbeat.mockResolvedValue(true);
    const client = await getChromaClient();
    expect(client).not.toBeNull();
    expect(client).toHaveProperty('heartbeat');
  });

  it('isChromaAvailable returns true', async () => {
    mockHeartbeat.mockResolvedValue(true);
    const available = await isChromaAvailable();
    expect(available).toBe(true);
  });

  it('getChromaClient uses singleton pattern', async () => {
    mockHeartbeat.mockResolvedValue(true);
    const first = await getChromaClient();
    const second = await getChromaClient();
    expect(first).toBe(second);
    // heartbeat should only be called once (on first init)
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// resetChromaClient
// ---------------------------------------------------------------------------

describe('resetChromaClient', () => {
  beforeEach(() => {
    resetChromaClient();
    mockHeartbeat.mockReset();
  });

  it('allows re-initialisation after reset', async () => {
    // First: connection fails
    mockHeartbeat.mockRejectedValueOnce(new Error('Connection refused'));
    const first = await getChromaClient();
    expect(first).toBeNull();

    // Reset, then succeed
    resetChromaClient();
    mockHeartbeat.mockResolvedValue(true);
    const second = await getChromaClient();
    expect(second).not.toBeNull();
  });
});
