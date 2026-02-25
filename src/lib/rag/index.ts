/**
 * RAG (Retrieval-Augmented Generation) Module — Public API
 *
 * Provides vector-based search across InfraFlow's knowledge base
 * using ChromaDB for embedding storage and OpenAI for embedding generation.
 */

// Types
export type {
  RAGConfig,
  RAGCollectionConfig,
  RAGDocument,
  RAGSearchResult,
  RAGSearchOptions,
  FetchMetadata,
  FetchCacheConfig,
  LiveAugmentResult,
  ExternalIndexRequest,
  ReasoningTrace,
  TracedDocument,
  TracedRelationship,
  TraceSummary,
  PostVerification,
  VerifiedRelationship,
  TypePath,
  ExpandedTypeResult,
} from './types';

// ChromaDB Client
export { COLLECTIONS, RAG_CONFIG, FETCH_CACHE_CONFIG, getChromaClient, isChromaAvailable, resetChromaClient } from './chromaClient';

// Embeddings
export { generateEmbedding, generateEmbeddings, buildEmbeddingText, EMBEDDING_DIMENSIONS } from './embeddings';

// Indexer
export { indexAll, indexAISoftware, indexCloudServices, indexProductIntelligence } from './indexer';

// Retriever
export { searchProductIntelligence } from './retriever';

// Trace Collector
export { createTraceCollector, TraceCollector } from './traceCollector';

// Trace Store
export { saveTrace, listTraces, getTrace, deleteOldTraces } from './traceStore';

// Post-Verifier
export { verifyAgainstOntology } from './postVerifier';

// Vector Store Abstraction
export {
  createVectorStore,
  ChromaVectorStore,
  type VectorStore,
  type VectorCollection,
  type VectorDocument,
  type VectorQueryOptions,
  type VectorQueryResult,
  type VectorAddData,
} from './vectorStore';

// Fetcher (external content)
export {
  fetchUrl,
  htmlToText,
  contentHash,
  parseGitHubUrl,
  isGitHubUrl,
  fetchGitHubReadme,
  extractReadmeSections,
  isCached,
  getCachedContent,
  invalidateCache,
  normalizeUrl,
  indexExternalContent,
  indexExternalContentBatch,
  liveAugment,
  extractProductNames,
} from './fetcher';
