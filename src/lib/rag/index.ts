/**
 * RAG (Retrieval-Augmented Generation) Module — Public API
 *
 * Provides vector-based search across InfraFlow's knowledge base
 * using ChromaDB for embedding storage and OpenAI for embedding generation.
 */

// Types
export type { RAGConfig, RAGCollectionConfig, RAGDocument, RAGSearchResult, RAGSearchOptions } from './types';

// ChromaDB Client
export { COLLECTIONS, RAG_CONFIG, getChromaClient, isChromaAvailable, resetChromaClient } from './chromaClient';

// Embeddings
export { generateEmbedding, generateEmbeddings, buildEmbeddingText, EMBEDDING_DIMENSIONS } from './embeddings';

// Indexer
export { indexAll, indexAISoftware, indexCloudServices, indexProductIntelligence } from './indexer';

// Retriever
export { searchProductIntelligence } from './retriever';
