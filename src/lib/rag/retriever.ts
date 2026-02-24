/**
 * RAG Retriever
 *
 * Searches for relevant Product Intelligence data using RAG (Retrieval-Augmented
 * Generation). Implements a two-tier search strategy:
 *
 * 1. **Vector search** (primary): Uses ChromaDB to find semantically similar
 *    documents via embedding distance. Queries all configured collections unless
 *    filtered via options.
 *
 * 2. **Keyword fallback** (secondary): When ChromaDB is unavailable or throws,
 *    falls back to `searchPI()` from the Product Intelligence module for simple
 *    keyword matching.
 *
 * Graceful degradation is a first-class concern — the retriever never throws.
 */

import { createLogger } from '@/lib/utils/logger';
import type { ChromaClient } from 'chromadb';
import type { RAGDocument, RAGSearchResult, RAGSearchOptions } from './types';
import { getChromaClient, COLLECTIONS, RAG_CONFIG } from './chromaClient';
import { generateEmbedding } from './embeddings';
import { searchPI } from '@/lib/knowledge/productIntelligence';

const log = createLogger('RAGRetriever');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default similarity score assigned to keyword fallback matches */
const KEYWORD_FALLBACK_SCORE = 0.5;

/** Collection name used for keyword fallback results */
const KEYWORD_FALLBACK_COLLECTION = 'keyword-fallback';

/** All collection names for querying all by default */
const ALL_COLLECTION_NAMES = Object.values(COLLECTIONS);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for relevant Product Intelligence data using RAG.
 *
 * Strategy:
 * 1. Try ChromaDB vector search (if available)
 * 2. Fall back to keyword search using searchPI() (if ChromaDB unavailable)
 *
 * @param query - User's natural language query
 * @param options - Search options (topK, collections, filters)
 * @returns RAGSearchResult with matching documents
 */
export async function searchProductIntelligence(
  query: string,
  options?: RAGSearchOptions,
): Promise<RAGSearchResult> {
  const startTime = Date.now();
  const topK = options?.topK ?? RAG_CONFIG.defaultTopK;
  const threshold = options?.similarityThreshold ?? RAG_CONFIG.similarityThreshold;

  // Empty query → empty result
  if (!query.trim()) {
    return {
      documents: [],
      totalResults: 0,
      queryTimeMs: Date.now() - startTime,
    };
  }

  // Try ChromaDB vector search first
  try {
    const client = await getChromaClient();
    if (client) {
      return await vectorSearch(client, query, topK, threshold, options?.collections, startTime);
    }
  } catch (error) {
    log.warn('ChromaDB search failed, falling back to keyword search', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Fallback: keyword search
  return keywordFallback(query, topK, startTime);
}

// ---------------------------------------------------------------------------
// Internal: Vector search
// ---------------------------------------------------------------------------

/**
 * Perform vector similarity search across ChromaDB collections.
 *
 * 1. Generates an embedding for the query
 * 2. Queries each target collection
 * 3. Merges, sorts, filters, and trims results
 */
async function vectorSearch(
  client: ChromaClient,
  query: string,
  topK: number,
  threshold: number,
  collections?: string[],
  startTime?: number,
): Promise<RAGSearchResult> {
  const start = startTime ?? Date.now();

  // Determine which collections to query
  const targetCollections = collections ?? ALL_COLLECTION_NAMES;

  // Generate embedding for the query
  const embedding = await generateEmbedding(query);

  // Query each collection and collect all documents
  const allDocuments: RAGDocument[] = [];

  for (const collectionName of targetCollections) {
    try {
      const collection = await client.getOrCreateCollection({ name: collectionName });
      const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: topK,
      });

      // Convert ChromaDB results to RAGDocument format
      const ids = results.ids[0] ?? [];
      const documents = results.documents[0] ?? [];
      const metadatas = results.metadatas[0] ?? [];
      const distances = results.distances?.[0] ?? [];

      for (let i = 0; i < ids.length; i++) {
        const distance = distances[i] ?? 0;
        const score = 1 / (1 + distance);

        allDocuments.push({
          id: ids[i],
          content: documents[i] ?? '',
          metadata: (metadatas[i] as Record<string, unknown>) ?? {},
          score,
          collection: collectionName,
        });
      }
    } catch (error) {
      log.warn(`Failed to query collection "${collectionName}"`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Sort by score descending
  allDocuments.sort((a, b) => b.score - a.score);

  // Filter by similarity threshold
  const filtered = allDocuments.filter((doc) => doc.score >= threshold);

  // Take topK results
  const trimmed = filtered.slice(0, topK);

  return {
    documents: trimmed,
    totalResults: trimmed.length,
    queryTimeMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Internal: Keyword fallback
// ---------------------------------------------------------------------------

/**
 * Keyword-based fallback search using the Product Intelligence module.
 *
 * Called when ChromaDB is unavailable or throws an error. Uses `searchPI()`
 * which performs simple case-insensitive substring matching across product
 * names and embedding text fields.
 */
function keywordFallback(
  query: string,
  topK: number,
  startTime: number,
): RAGSearchResult {
  const matches = searchPI(query);

  const documents: RAGDocument[] = matches.slice(0, topK).map((pi) => ({
    id: pi.id,
    content: pi.embeddingText,
    metadata: { category: pi.category, productName: pi.name },
    score: KEYWORD_FALLBACK_SCORE,
    collection: KEYWORD_FALLBACK_COLLECTION,
  }));

  return {
    documents,
    totalResults: documents.length,
    queryTimeMs: Date.now() - startTime,
  };
}
