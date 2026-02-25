/**
 * Vector Store Abstraction Tests
 *
 * Tests for the VectorStore interface and ChromaDB implementation adapter.
 * The adapter wraps the existing ChromaDB client to conform to the
 * unified VectorStore interface for future backend extensibility.
 *
 * @module lib/rag/__tests__/vectorStore
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks (defined before vi.mock hoisting)
// ---------------------------------------------------------------------------

const {
  mockCollectionQuery,
  mockCollectionAdd,
  mockCollectionCount,
  mockCollectionDelete,
  mockHeartbeat,
  mockGetOrCreateCollection,
} = vi.hoisted(() => ({
  mockCollectionQuery: vi.fn(),
  mockCollectionAdd: vi.fn(),
  mockCollectionCount: vi.fn(),
  mockCollectionDelete: vi.fn(),
  mockHeartbeat: vi.fn(),
  mockGetOrCreateCollection: vi.fn(),
}));

vi.mock('chromadb', () => ({
  ChromaClient: class MockChromaClient {
    heartbeat = mockHeartbeat;
    getOrCreateCollection = mockGetOrCreateCollection;
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mock setup)
// ---------------------------------------------------------------------------

import {
  ChromaVectorStore,
  createVectorStore,
  type VectorStore,
  type VectorCollection,
} from '../vectorStore';

// Helper: reset all mocks and set up default successful responses
function setupMocks() {
  mockHeartbeat.mockReset();
  mockGetOrCreateCollection.mockReset();
  mockCollectionQuery.mockReset();
  mockCollectionAdd.mockReset();
  mockCollectionCount.mockReset();
  mockCollectionDelete.mockReset();

  mockHeartbeat.mockResolvedValue(true);
  mockGetOrCreateCollection.mockResolvedValue({
    query: mockCollectionQuery,
    add: mockCollectionAdd,
    count: mockCollectionCount,
    delete: mockCollectionDelete,
  });
}

// ---------------------------------------------------------------------------
// Factory tests
// ---------------------------------------------------------------------------

describe('createVectorStore', () => {
  it('creates a ChromaVectorStore for "chroma" type', () => {
    const store = createVectorStore('chroma');
    expect(store).toBeInstanceOf(ChromaVectorStore);
    expect(store.name).toBe('chroma');
  });

  it('throws for unknown type', () => {
    expect(() => createVectorStore('unknown' as 'chroma')).toThrow('Unknown vector store type');
  });
});

// ---------------------------------------------------------------------------
// ChromaVectorStore
// ---------------------------------------------------------------------------

describe('ChromaVectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    setupMocks();
    store = new ChromaVectorStore();
  });

  describe('name', () => {
    it('returns "chroma"', () => {
      expect(store.name).toBe('chroma');
    });
  });

  describe('isAvailable', () => {
    it('returns true when heartbeat succeeds', async () => {
      expect(await store.isAvailable()).toBe(true);
    });

    it('returns false when heartbeat fails', async () => {
      mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
      expect(await store.isAvailable()).toBe(false);
    });
  });

  describe('getCollection', () => {
    it('returns a VectorCollection wrapper', async () => {
      await store.isAvailable();

      const collection = await store.getCollection('test-collection');
      expect(collection).not.toBeNull();
      expect(collection!.name).toBe('test-collection');
      expect(mockGetOrCreateCollection).toHaveBeenCalledWith({ name: 'test-collection' });
    });

    it('returns null when store is not available', async () => {
      mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
      await store.isAvailable();

      const collection = await store.getCollection('test-collection');
      expect(collection).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// ChromaVectorCollection (via ChromaVectorStore.getCollection)
// ---------------------------------------------------------------------------

describe('ChromaVectorCollection', () => {
  let collection: VectorCollection;

  beforeEach(async () => {
    setupMocks();
    const store = new ChromaVectorStore();
    await store.isAvailable();
    const col = await store.getCollection('test-collection');
    collection = col!;
  });

  describe('query', () => {
    it('converts ChromaDB results to VectorQueryResult format', async () => {
      mockCollectionQuery.mockResolvedValue({
        ids: [['doc-1', 'doc-2']],
        documents: [['First document', 'Second document']],
        metadatas: [[{ category: 'ai' }, { category: 'cloud' }]],
        distances: [[0.1, 0.5]],
      });

      const result = await collection.query([0.1, 0.2, 0.3], { topK: 5 });

      expect(result.documents).toHaveLength(2);
      expect(result.documents[0]).toEqual({
        id: 'doc-1',
        content: 'First document',
        metadata: { category: 'ai' },
        score: expect.closeTo(1 / (1 + 0.1), 4),
      });
      expect(result.documents[1]).toEqual({
        id: 'doc-2',
        content: 'Second document',
        metadata: { category: 'cloud' },
        score: expect.closeTo(1 / (1 + 0.5), 4),
      });

      expect(mockCollectionQuery).toHaveBeenCalledWith({
        queryEmbeddings: [[0.1, 0.2, 0.3]],
        nResults: 5,
      });
    });

    it('handles empty results', async () => {
      mockCollectionQuery.mockResolvedValue({
        ids: [[]],
        documents: [[]],
        metadatas: [[]],
        distances: [[]],
      });

      const result = await collection.query([0.1], { topK: 10 });
      expect(result.documents).toHaveLength(0);
    });

    it('handles missing distances gracefully', async () => {
      mockCollectionQuery.mockResolvedValue({
        ids: [['doc-1']],
        documents: [['text']],
        metadatas: [[{}]],
      });

      const result = await collection.query([0.1], { topK: 5 });
      expect(result.documents[0].score).toBe(1); // 1 / (1 + 0) = 1
    });
  });

  describe('add', () => {
    it('delegates to ChromaDB collection.add', async () => {
      mockCollectionAdd.mockResolvedValue(undefined);

      await collection.add({
        ids: ['id-1', 'id-2'],
        documents: ['doc 1', 'doc 2'],
        metadatas: [{ key: 'val1' }, { key: 'val2' }],
        embeddings: [[0.1], [0.2]],
      });

      expect(mockCollectionAdd).toHaveBeenCalledWith({
        ids: ['id-1', 'id-2'],
        documents: ['doc 1', 'doc 2'],
        metadatas: [{ key: 'val1' }, { key: 'val2' }],
        embeddings: [[0.1], [0.2]],
      });
    });
  });

  describe('count', () => {
    it('returns collection document count', async () => {
      mockCollectionCount.mockResolvedValue(42);
      expect(await collection.count()).toBe(42);
    });
  });

  describe('deleteByIds', () => {
    it('deletes documents by IDs', async () => {
      mockCollectionDelete.mockResolvedValue(undefined);
      await collection.deleteByIds(['id-1', 'id-2']);
      expect(mockCollectionDelete).toHaveBeenCalledWith({ ids: ['id-1', 'id-2'] });
    });
  });
});

// ---------------------------------------------------------------------------
// VectorStore contract tests
// ---------------------------------------------------------------------------

describe('VectorStore interface contract', () => {
  it('has required properties and methods', () => {
    const store = createVectorStore('chroma');

    expect(typeof store.name).toBe('string');
    expect(typeof store.isAvailable).toBe('function');
    expect(typeof store.getCollection).toBe('function');
  });
});
