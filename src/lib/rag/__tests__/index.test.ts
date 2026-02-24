import { describe, it, expect } from 'vitest';

describe('RAG Module Public API', () => {
  it('should export all types', async () => {
    // Types are compile-time only, just verify the module loads
    const mod = await import('../index');
    expect(mod).toBeDefined();
  });

  it('should export ChromaDB client functions', async () => {
    const { COLLECTIONS, RAG_CONFIG, getChromaClient, isChromaAvailable, resetChromaClient } = await import('../index');
    expect(COLLECTIONS).toBeDefined();
    expect(COLLECTIONS.AI_SOFTWARE).toBe('infraflow-ai-software');
    expect(RAG_CONFIG).toBeDefined();
    expect(getChromaClient).toBeInstanceOf(Function);
    expect(isChromaAvailable).toBeInstanceOf(Function);
    expect(resetChromaClient).toBeInstanceOf(Function);
  });

  it('should export embedding functions', async () => {
    const mod = await import('../index');
    expect(mod.generateEmbedding).toBeInstanceOf(Function);
    expect(mod.generateEmbeddings).toBeInstanceOf(Function);
    expect(mod.buildEmbeddingText).toBeInstanceOf(Function);
  });

  it('should export EMBEDDING_DIMENSIONS constant', async () => {
    const { EMBEDDING_DIMENSIONS } = await import('../index');
    expect(EMBEDDING_DIMENSIONS).toBe(1536);
  });

  it('should export indexer functions', async () => {
    const { indexAll, indexAISoftware, indexCloudServices, indexProductIntelligence } = await import('../index');
    expect(indexAll).toBeInstanceOf(Function);
    expect(indexAISoftware).toBeInstanceOf(Function);
    expect(indexCloudServices).toBeInstanceOf(Function);
    expect(indexProductIntelligence).toBeInstanceOf(Function);
  });

  it('should export retriever function', async () => {
    const { searchProductIntelligence } = await import('../index');
    expect(searchProductIntelligence).toBeInstanceOf(Function);
  });
});
