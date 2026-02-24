/**
 * RAG (Retrieval-Augmented Generation) Types
 *
 * Type definitions for the RAG module that powers semantic search
 * across InfraFlow's knowledge base using ChromaDB vector storage.
 */

/** Configuration for the RAG system */
export interface RAGConfig {
  persistDirectory: string;
  embeddingModel: string;
  defaultTopK: number;
  similarityThreshold: number;
}

/** Configuration for a ChromaDB collection */
export interface RAGCollectionConfig {
  name: string;
  description: string;
  metadataFields: string[];
}

/** A document retrieved from the RAG system */
export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  collection: string;
}

/** Result of a RAG search query */
export interface RAGSearchResult {
  documents: RAGDocument[];
  totalResults: number;
  queryTimeMs: number;
}

/** Options for a RAG search query */
export interface RAGSearchOptions {
  topK?: number;
  collections?: string[];
  filters?: Record<string, unknown>;
  similarityThreshold?: number;
}
