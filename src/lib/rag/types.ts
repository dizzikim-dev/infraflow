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
  /** Enable query-time live augmentation from external sources */
  enableLiveAugment?: boolean;
  /** Enable graph-guided query expansion using ontology edges (Phase 3) */
  enableGraphGuidance?: boolean;
}

// ---------------------------------------------------------------------------
// External Fetch Types
// ---------------------------------------------------------------------------

/** Metadata for externally fetched content */
export interface FetchMetadata {
  sourceUrl: string;
  fetchedAt: number;
  contentHash: string;
  title?: string;
  tags?: string[];
  sourceType: 'github-readme' | 'web-page';
  contentLength: number;
}

/** Configuration for fetch caching */
export interface FetchCacheConfig {
  /** Maximum content size in bytes */
  maxBytes: number;
  /** Cache TTL in seconds */
  ttlSeconds: number;
  /** Confidence threshold below which live augment is triggered */
  confidenceThreshold: number;
  /** Timeout for live augmentation in milliseconds */
  timeoutMs: number;
}

/** Result of a live augmentation attempt */
export interface LiveAugmentResult {
  /** Whether augmentation was attempted */
  attempted: boolean;
  /** Whether augmentation succeeded */
  success: boolean;
  /** Number of new documents indexed */
  documentsIndexed: number;
  /** Time taken in milliseconds */
  durationMs: number;
  /** Source URL fetched (if any) */
  sourceUrl?: string;
  /** Error message if failed */
  error?: string;
}

/** Request to index external content */
export interface ExternalIndexRequest {
  content: string;
  title: string;
  sourceUrl?: string;
  tags?: string[];
  sourceType: 'github-readme' | 'web-page';
}

// ---------------------------------------------------------------------------
// Reasoning Trace Types
// ---------------------------------------------------------------------------

/** A single document recorded in a reasoning trace */
export interface TracedDocument {
  id: string;
  collection: string;
  score: number;
  /** metadata.productName or metadata.title */
  title: string;
  /** metadata.category */
  category: string;
}

/** A relationship recorded in a reasoning trace */
export interface TracedRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
  reasonKo: string;
}

/** Full reasoning pipeline trace */
export interface ReasoningTrace {
  id: string;
  query: string;
  timestamp: number;
  durationMs: number;

  /** Step 1: Keyword extraction */
  extractedNodeTypes: string[];

  /** Step 2: RAG vector search */
  ragSearch: {
    method: 'vector' | 'keyword-fallback';
    queryTimeMs: number;
    totalResults: number;
    documents: TracedDocument[];
    maxScore: number;
    threshold: number;
  };

  /** Step 3: Live augment decision */
  liveAugment: {
    triggered: boolean;
    reason: string;
    result?: LiveAugmentResult;
  };

  /** Step 4: Knowledge enrichment */
  enrichment: {
    relationshipsMatched: TracedRelationship[];
    relationshipsExcluded: number;
    suggestionsCount: number;
    violationsCount: number;
    risksCount: number;
    piDocumentsInjected: number;
    cacheHit: boolean;
    promptSectionLength: number;
  };

  /** Step 5: LLM call */
  llm: {
    provider: 'claude' | 'openai' | 'fallback';
    model?: string;
    attempts: number;
    success: boolean;
  };

  /** Phase 3: Graph guidance (optional) */
  graphGuidance?: {
    enabled: boolean;
    seedTypes: string[];
    expandedTypes: string[];
    paths: TypePath[];
    expansionMs: number;
  };

  /** Phase 2: Post-verification (optional) */
  postVerification?: PostVerification;
}

/** Lightweight trace summary included in LLM response */
export interface TraceSummary {
  ragDocumentsUsed: number;
  maxScore: number;
  relationshipsMatched: number;
  gapsDetected: number;
  liveAugmentTriggered: boolean;
  enrichmentCacheHit: boolean;
}

// ---------------------------------------------------------------------------
// Post-Verification Types (Phase 2)
// ---------------------------------------------------------------------------

/** A verified relationship with status */
export interface VerifiedRelationship {
  relationshipId: string;
  source: string;
  target: string;
  type: string;
  reasonKo: string;
  status: 'satisfied' | 'missing' | 'conflict';
}

/** Result of post-verification against ontology */
export interface PostVerification {
  satisfied: VerifiedRelationship[];
  missingRequired: VerifiedRelationship[];
  missingRecommended: VerifiedRelationship[];
  conflicts: VerifiedRelationship[];
  unusedKnowledge: TracedDocument[];
  /** 0-100, higher is better */
  verificationScore: number;
}

// ---------------------------------------------------------------------------
// Graph Traversal Types (Phase 3)
// ---------------------------------------------------------------------------

/** A typed path between node types via ontology edges */
export interface TypePath {
  from: string;
  to: string;
  via: string[];
  totalConfidence: number;
}

/** Result of expanding seed types through the ontology graph */
export interface ExpandedTypeResult {
  types: string[];
  paths: TypePath[];
  hops: Map<string, number>;
}
