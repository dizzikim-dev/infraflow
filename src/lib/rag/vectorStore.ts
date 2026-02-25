/**
 * Vector Store Abstraction
 *
 * Unified interface for vector storage backends. Currently supports ChromaDB;
 * designed to be extended with hnswlib-node or other backends for offline
 * or embedded fallback scenarios.
 *
 * The abstraction handles:
 * - Collection management (getOrCreate semantics)
 * - Query with embedding vectors
 * - Document insertion with metadata
 * - Score normalization (distance → similarity)
 *
 * @module lib/rag/vectorStore
 */

import { ChromaClient } from 'chromadb';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('VectorStore');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single document returned from a vector query */
export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  /** Similarity score (0-1, higher = more similar) */
  score: number;
}

/** Options for vector queries */
export interface VectorQueryOptions {
  topK: number;
}

/** Result of a vector query */
export interface VectorQueryResult {
  documents: VectorDocument[];
}

/** Data to add to a vector collection */
export interface VectorAddData {
  ids: string[];
  documents: string[];
  metadatas: Record<string, string>[];
  embeddings: number[][];
}

/**
 * A single collection within a vector store.
 * Provides query, add, count, and delete operations.
 */
export interface VectorCollection {
  readonly name: string;

  /** Query the collection with an embedding vector */
  query(embedding: number[], options: VectorQueryOptions): Promise<VectorQueryResult>;

  /** Add documents with embeddings */
  add(data: VectorAddData): Promise<void>;

  /** Get the number of documents in the collection */
  count(): Promise<number>;

  /** Delete documents by IDs */
  deleteByIds(ids: string[]): Promise<void>;
}

/**
 * Unified vector store interface.
 * Implementations handle connection management and provide collections.
 */
export interface VectorStore {
  readonly name: string;

  /** Check if the store is reachable and available */
  isAvailable(): Promise<boolean>;

  /** Get or create a named collection. Returns null if store is unavailable. */
  getCollection(name: string): Promise<VectorCollection | null>;
}

// ---------------------------------------------------------------------------
// ChromaDB Implementation
// ---------------------------------------------------------------------------

/**
 * ChromaDB collection wrapper that conforms to the VectorCollection interface.
 */
class ChromaVectorCollection implements VectorCollection {
  readonly name: string;
  private readonly inner: {
    query: (params: { queryEmbeddings: number[][]; nResults: number }) => Promise<{
      ids: string[][];
      documents: (string | null)[][];
      metadatas: (Record<string, unknown> | null)[][];
      distances?: number[][];
    }>;
    add: (params: {
      ids: string[];
      documents: string[];
      metadatas: Record<string, string>[];
      embeddings: number[][];
    }) => Promise<void>;
    count: () => Promise<number>;
    delete: (params: { ids: string[] }) => Promise<void>;
  };

  constructor(name: string, inner: ChromaVectorCollection['inner']) {
    this.name = name;
    this.inner = inner;
  }

  async query(embedding: number[], options: VectorQueryOptions): Promise<VectorQueryResult> {
    const results = await this.inner.query({
      queryEmbeddings: [embedding],
      nResults: options.topK,
    });

    const ids = results.ids[0] ?? [];
    const documents = results.documents[0] ?? [];
    const metadatas = results.metadatas[0] ?? [];
    const distances = results.distances?.[0] ?? [];

    const docs: VectorDocument[] = [];
    for (let i = 0; i < ids.length; i++) {
      const distance = distances[i] ?? 0;
      const score = 1 / (1 + distance);

      docs.push({
        id: ids[i],
        content: documents[i] ?? '',
        metadata: (metadatas[i] as Record<string, unknown>) ?? {},
        score,
      });
    }

    return { documents: docs };
  }

  async add(data: VectorAddData): Promise<void> {
    await this.inner.add({
      ids: data.ids,
      documents: data.documents,
      metadatas: data.metadatas,
      embeddings: data.embeddings,
    });
  }

  async count(): Promise<number> {
    return this.inner.count();
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.inner.delete({ ids });
  }
}

/**
 * ChromaDB-backed vector store implementation.
 *
 * Wraps the ChromaDB client singleton pattern with graceful degradation.
 * When ChromaDB is unreachable, `isAvailable()` returns false and
 * `getCollection()` returns null.
 */
export class ChromaVectorStore implements VectorStore {
  readonly name = 'chroma' as const;
  private client: ChromaClient | null = null;
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      const client = new ChromaClient();
      await client.heartbeat();
      this.client = client;
      this.initialized = true;
      return true;
    } catch {
      this.client = null;
      this.initialized = true;
      return false;
    }
  }

  async getCollection(name: string): Promise<VectorCollection | null> {
    if (!this.initialized) {
      await this.isAvailable();
    }

    if (!this.client) {
      logger.debug('ChromaDB unavailable — cannot get collection', { name });
      return null;
    }

    try {
      const inner = await this.client.getOrCreateCollection({ name });
      return new ChromaVectorCollection(name, inner as unknown as ChromaVectorCollection['inner']);
    } catch (error) {
      logger.warn('Failed to get ChromaDB collection', {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a vector store instance by type.
 *
 * @param type - Currently only 'chroma' is supported
 * @returns The vector store instance
 * @throws Error if the type is unknown
 */
export function createVectorStore(type: 'chroma'): VectorStore {
  switch (type) {
    case 'chroma':
      return new ChromaVectorStore();
    default:
      throw new Error(`Unknown vector store type: ${type}`);
  }
}
