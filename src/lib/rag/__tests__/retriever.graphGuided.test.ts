/**
 * Graph-Guided RAG Retriever Tests
 *
 * Tests for the graph-guided query expansion feature in the retriever.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../chromaClient', () => ({
  getChromaClient: vi.fn().mockResolvedValue(null), // No ChromaDB
  COLLECTIONS: {
    AI_SOFTWARE: 'infraflow-ai-software',
    CLOUD_SERVICES: 'infraflow-cloud-services',
    DEPLOYMENT_SCENARIOS: 'infraflow-deployment-scenarios',
    INTEGRATION_PATTERNS: 'infraflow-integration-patterns',
    EXTERNAL_CONTENT: 'infraflow-external-content',
  },
  RAG_CONFIG: {
    persistDirectory: '.chroma',
    embeddingModel: 'text-embedding-ada-002',
    defaultTopK: 10,
    similarityThreshold: 0.7,
  },
  FETCH_CACHE_CONFIG: {
    maxBytes: 50 * 1024,
    ttlSeconds: 86400,
    confidenceThreshold: 0.5,
    timeoutMs: 2500,
  },
}));

vi.mock('../embeddings', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0)),
}));

const mockSearchPI = vi.fn().mockReturnValue([
  { id: 'pi-1', name: 'Ollama', category: 'ai-inference', embeddingText: 'Ollama inference engine' },
  { id: 'pi-2', name: 'ChromaDB', category: 'vector-dbs', embeddingText: 'ChromaDB vector database' },
]);

vi.mock('@/lib/knowledge/productIntelligence', () => ({
  searchPI: (...args: unknown[]) => mockSearchPI(...args),
}));

const mockExtractNodeTypes = vi.fn().mockReturnValue(['inference-engine']);
vi.mock('@/app/api/llm/route', () => ({
  extractNodeTypesFromPrompt: (...args: unknown[]) => mockExtractNodeTypes(...args),
}));

const mockGetExpandedTypes = vi.fn().mockReturnValue({
  types: ['inference-engine', 'gpu-server', 'ai-monitor'],
  paths: [
    { from: 'inference-engine', to: 'gpu-server', via: ['REL-AI-001'], totalConfidence: 0.95 },
    { from: 'inference-engine', to: 'ai-monitor', via: ['REL-AI-010'], totalConfidence: 0.8 },
  ],
  hops: new Map([['inference-engine', 0], ['gpu-server', 1], ['ai-monitor', 1]]),
});

vi.mock('@/lib/knowledge/graphTraverser', () => ({
  getExpandedTypes: (...args: unknown[]) => mockGetExpandedTypes(...args),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('searchProductIntelligence with graph guidance', () => {
  let searchProductIntelligence: typeof import('../retriever').searchProductIntelligence;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../retriever');
    searchProductIntelligence = mod.searchProductIntelligence;
  });

  it('expands query with graph-guided types when enabled', async () => {
    await searchProductIntelligence('setup ollama', { enableGraphGuidance: true });

    expect(mockExtractNodeTypes).toHaveBeenCalledWith('setup ollama');
    expect(mockGetExpandedTypes).toHaveBeenCalledWith(['inference-engine']);

    // The searchPI should be called with expanded query
    expect(mockSearchPI).toHaveBeenCalledWith(
      expect.stringContaining('gpu-server'),
    );
  });

  it('does not expand when graph guidance is disabled', async () => {
    await searchProductIntelligence('setup ollama', { enableGraphGuidance: false });

    expect(mockGetExpandedTypes).not.toHaveBeenCalled();
    expect(mockSearchPI).toHaveBeenCalledWith('setup ollama');
  });

  it('does not expand when no options provided', async () => {
    await searchProductIntelligence('setup ollama');

    expect(mockGetExpandedTypes).not.toHaveBeenCalled();
  });

  it('falls back gracefully when extraction finds no types', async () => {
    mockExtractNodeTypes.mockReturnValueOnce([]);

    await searchProductIntelligence('hello world', { enableGraphGuidance: true });

    expect(mockGetExpandedTypes).not.toHaveBeenCalled();
    expect(mockSearchPI).toHaveBeenCalledWith('hello world');
  });

  it('falls back gracefully on graph guidance error', async () => {
    mockGetExpandedTypes.mockImplementationOnce(() => {
      throw new Error('graph traversal failed');
    });

    const result = await searchProductIntelligence('setup ollama', { enableGraphGuidance: true });

    // Should still return keyword fallback results
    expect(result.documents.length).toBeGreaterThanOrEqual(0);
  });

  it('appends expanded types to query string', async () => {
    await searchProductIntelligence('setup ollama', { enableGraphGuidance: true });

    // searchPI is called with expanded query: "setup ollama gpu-server ai-monitor"
    const calledWith = mockSearchPI.mock.calls[0][0];
    expect(calledWith).toContain('setup ollama');
    expect(calledWith).toContain('gpu-server');
    expect(calledWith).toContain('ai-monitor');
  });

  it('does not duplicate seed types in expansion', async () => {
    mockGetExpandedTypes.mockReturnValueOnce({
      types: ['inference-engine', 'gpu-server'], // inference-engine is the seed
      paths: [{ from: 'inference-engine', to: 'gpu-server', via: ['REL-AI-001'], totalConfidence: 0.95 }],
      hops: new Map([['inference-engine', 0], ['gpu-server', 1]]),
    });

    await searchProductIntelligence('setup ollama', { enableGraphGuidance: true });

    const calledWith = mockSearchPI.mock.calls[0][0];
    // Should only add gpu-server (not inference-engine again)
    expect(calledWith).toBe('setup ollama gpu-server');
  });
});
