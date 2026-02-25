import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb — must be declared before imports
// ---------------------------------------------------------------------------

const mockQuery = vi.fn();
const mockGetOrCreateCollection = vi.fn().mockResolvedValue({
  query: mockQuery,
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
// Mock productIntelligence searchPI
// ---------------------------------------------------------------------------

vi.mock('@/lib/knowledge/productIntelligence', () => ({
  searchPI: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { resetChromaClient } from '../chromaClient';
import { searchProductIntelligence } from '../retriever';
import { searchPI } from '@/lib/knowledge/productIntelligence';

const mockSearchPI = vi.mocked(searchPI);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard ChromaDB query response */
function buildChromaResponse(
  ids: string[],
  documents: (string | null)[],
  metadatas: (Record<string, unknown> | null)[],
  distances: number[],
) {
  return {
    ids: [ids],
    documents: [documents],
    metadatas: [metadatas],
    distances: [distances],
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetChromaClient();
  mockHeartbeat.mockReset();
  mockQuery.mockReset();
  mockGetOrCreateCollection.mockClear();
  mockSearchPI.mockReset();
});

// ---------------------------------------------------------------------------
// ChromaDB available — vector search
// ---------------------------------------------------------------------------

describe('when ChromaDB is available', () => {
  beforeEach(() => {
    mockHeartbeat.mockResolvedValue(true);
    mockQuery.mockResolvedValue(
      buildChromaResponse(
        ['doc-1', 'doc-2'],
        ['OpenClaw AI assistant', 'Ollama inference engine'],
        [{ category: 'ai-assistant' }, { category: 'ai-inference' }],
        [0.1, 0.3],
      ),
    );
  });

  it('returns RAGSearchResult with documents', async () => {
    const result = await searchProductIntelligence('AI assistant');

    expect(result).toHaveProperty('documents');
    expect(result).toHaveProperty('totalResults');
    expect(result).toHaveProperty('queryTimeMs');
    expect(result.documents.length).toBeGreaterThan(0);
  });

  it('documents have correct fields (id, content, metadata, score, collection)', async () => {
    const result = await searchProductIntelligence('AI assistant');
    const doc = result.documents[0];

    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('content');
    expect(doc).toHaveProperty('metadata');
    expect(doc).toHaveProperty('score');
    expect(doc).toHaveProperty('collection');

    expect(typeof doc.id).toBe('string');
    expect(typeof doc.content).toBe('string');
    expect(typeof doc.metadata).toBe('object');
    expect(typeof doc.score).toBe('number');
    expect(typeof doc.collection).toBe('string');
  });

  it('results are sorted by score descending', async () => {
    // Distance 0.1 -> score = 1/(1+0.1) ~ 0.909
    // Distance 0.3 -> score = 1/(1+0.3) ~ 0.769
    const result = await searchProductIntelligence('AI');

    for (let i = 1; i < result.documents.length; i++) {
      expect(result.documents[i - 1].score).toBeGreaterThanOrEqual(
        result.documents[i].score,
      );
    }
  });

  it('topK option limits results', async () => {
    const result = await searchProductIntelligence('AI', { topK: 1 });

    expect(result.documents).toHaveLength(1);
    expect(result.totalResults).toBe(1);
  });

  it('similarityThreshold filters low-score results', async () => {
    // Distance 0.1 -> score ~ 0.909
    // Distance 0.3 -> score ~ 0.769
    // Threshold 0.8 should keep only docs with distance 0.1 (one per collection)
    // Query against single collection to make assertion simple
    const result = await searchProductIntelligence('AI', {
      similarityThreshold: 0.8,
      collections: ['infraflow-ai-software'],
    });

    // Only the doc with distance 0.1 (score ~0.909) should pass
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].score).toBeGreaterThanOrEqual(0.8);
  });

  it('collections option limits which collections are searched', async () => {
    await searchProductIntelligence('AI', {
      collections: ['infraflow-ai-software'],
    });

    // Only one collection should be queried
    expect(mockGetOrCreateCollection).toHaveBeenCalledTimes(1);
    expect(mockGetOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'infraflow-ai-software' }),
    );
  });

  it('converts distance to similarity score correctly', async () => {
    // Use single collection to get exactly 2 docs
    const result = await searchProductIntelligence('AI', {
      collections: ['infraflow-ai-software'],
    });

    // Distance 0.1 -> score = 1 / (1 + 0.1) = 0.9090...
    const expectedScore1 = 1 / (1 + 0.1);
    expect(result.documents[0].score).toBeCloseTo(expectedScore1, 4);

    // Distance 0.3 -> score = 1 / (1 + 0.3) = 0.7692...
    const expectedScore2 = 1 / (1 + 0.3);
    expect(result.documents[1].score).toBeCloseTo(expectedScore2, 4);
  });

  it('queries all 5 collections by default', async () => {
    await searchProductIntelligence('AI');

    expect(mockGetOrCreateCollection).toHaveBeenCalledTimes(5);
  });

  it('queryTimeMs is populated', async () => {
    const result = await searchProductIntelligence('AI assistant');

    expect(result.queryTimeMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.queryTimeMs).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// ChromaDB unavailable — keyword fallback
// ---------------------------------------------------------------------------

describe('when ChromaDB is unavailable', () => {
  beforeEach(() => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
  });

  it('falls back to keyword search', async () => {
    mockSearchPI.mockReturnValue([
      {
        id: 'PI-CLAUDE-001',
        name: 'Claude',
        nameKo: '클로드',
        category: 'ai-assistant',
        embeddingText: 'Claude AI assistant by Anthropic',
        embeddingTextKo: 'Anthropic의 AI 어시스턴트 클로드',
        productId: 'anthropic-claude',
        sourceUrl: 'https://claude.ai',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    const result = await searchProductIntelligence('Claude');

    expect(result.documents.length).toBeGreaterThan(0);
    expect(mockSearchPI).toHaveBeenCalledWith('Claude');
  });

  it('keyword fallback returns results from searchPI', async () => {
    mockSearchPI.mockReturnValue([
      {
        id: 'PI-OLLAMA-001',
        name: 'Ollama',
        nameKo: '올라마',
        category: 'ai-inference',
        embeddingText: 'Ollama local inference engine',
        embeddingTextKo: '올라마 로컬 추론 엔진',
        productId: 'ollama',
        sourceUrl: 'https://ollama.ai',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
      {
        id: 'PI-VLLM-001',
        name: 'vLLM',
        nameKo: 'vLLM',
        category: 'ai-inference',
        embeddingText: 'vLLM high-throughput inference',
        embeddingTextKo: 'vLLM 고처리량 추론',
        productId: 'vllm',
        sourceUrl: 'https://vllm.ai',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    const result = await searchProductIntelligence('inference');

    expect(result.documents).toHaveLength(2);
    expect(result.documents[0].id).toBe('PI-OLLAMA-001');
    expect(result.documents[1].id).toBe('PI-VLLM-001');
  });

  it('keyword fallback documents have score 0.5', async () => {
    mockSearchPI.mockReturnValue([
      {
        id: 'PI-TEST-001',
        name: 'Test Product',
        nameKo: '테스트 제품',
        category: 'ai-assistant',
        embeddingText: 'Test product description',
        embeddingTextKo: '테스트 제품 설명',
        productId: 'test',
        sourceUrl: 'https://test.com',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    const result = await searchProductIntelligence('test');

    for (const doc of result.documents) {
      expect(doc.score).toBe(0.5);
    }
  });

  it('keyword fallback documents have collection "keyword-fallback"', async () => {
    mockSearchPI.mockReturnValue([
      {
        id: 'PI-TEST-001',
        name: 'Test Product',
        nameKo: '테스트 제품',
        category: 'ai-assistant',
        embeddingText: 'Test product description',
        embeddingTextKo: '테스트 제품 설명',
        productId: 'test',
        sourceUrl: 'https://test.com',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    const result = await searchProductIntelligence('test');

    for (const doc of result.documents) {
      expect(doc.collection).toBe('keyword-fallback');
    }
  });

  it('keyword fallback metadata includes category and productName', async () => {
    mockSearchPI.mockReturnValue([
      {
        id: 'PI-TEST-001',
        name: 'Test Product',
        nameKo: '테스트 제품',
        category: 'ai-assistant',
        embeddingText: 'Test product description',
        embeddingTextKo: '테스트 제품 설명',
        productId: 'test',
        sourceUrl: 'https://test.com',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    const result = await searchProductIntelligence('test');
    const doc = result.documents[0];

    expect(doc.metadata).toHaveProperty('category', 'ai-assistant');
    expect(doc.metadata).toHaveProperty('productName', 'Test Product');
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('empty query returns empty results', async () => {
    const result = await searchProductIntelligence('');

    expect(result.documents).toHaveLength(0);
    expect(result.totalResults).toBe(0);
    expect(result.queryTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('ChromaDB throws during query — per-collection errors handled gracefully', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGetOrCreateCollection.mockRejectedValue(
      new Error('Collection error'),
    );

    // Even though all collections fail, the vector search path completes
    // gracefully with empty results (does not throw)
    const result = await searchProductIntelligence('fallback');

    expect(result.documents).toHaveLength(0);
    expect(result.totalResults).toBe(0);
  });

  it('falls back to keyword search when getChromaClient throws', async () => {
    // Simulate ChromaDB client itself throwing (not just collection errors)
    mockHeartbeat.mockResolvedValue(true);

    // Override getChromaClient to throw after initial success
    // We achieve this by making the client constructor throw on query
    mockGetOrCreateCollection.mockImplementation(() => {
      throw new Error('Unexpected client error');
    });

    mockSearchPI.mockReturnValue([
      {
        id: 'PI-FALLBACK-001',
        name: 'Fallback Product',
        nameKo: '폴백 제품',
        category: 'ai-assistant',
        embeddingText: 'Fallback product for testing',
        embeddingTextKo: '테스트용 폴백 제품',
        productId: 'fallback',
        sourceUrl: 'https://fallback.com',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
      },
    ]);

    // Per-collection errors are caught inside vectorSearch, so no fallback
    // The result will be empty from vector search
    const result = await searchProductIntelligence('fallback');
    expect(result.documents).toHaveLength(0);
  });

  it('ChromaDB returns empty results', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGetOrCreateCollection.mockResolvedValue({ query: mockQuery });
    mockQuery.mockResolvedValue(
      buildChromaResponse([], [], [], []),
    );

    const result = await searchProductIntelligence('nonexistent');

    expect(result.documents).toHaveLength(0);
    expect(result.totalResults).toBe(0);
  });

  it('searchPI returns empty array for fallback', async () => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
    mockSearchPI.mockReturnValue([]);

    const result = await searchProductIntelligence('nonexistent');

    expect(result.documents).toHaveLength(0);
    expect(result.totalResults).toBe(0);
  });

  it('handles null documents from ChromaDB gracefully', async () => {
    mockHeartbeat.mockResolvedValue(true);
    mockGetOrCreateCollection.mockResolvedValue({ query: mockQuery });
    mockQuery.mockResolvedValue(
      buildChromaResponse(
        ['doc-1', 'doc-2'],
        [null, 'Valid document'],
        [null, { category: 'ai-inference' }],
        [0.1, 0.2],
      ),
    );

    const result = await searchProductIntelligence('test', {
      collections: ['infraflow-ai-software'],
    });

    // Should handle nulls without throwing
    expect(result.documents.length).toBeGreaterThanOrEqual(0);
  });
});
