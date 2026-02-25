/**
 * Admin RAG 페이지 공통 타입
 */

export interface CollectionStat {
  name: string;
  count: number;
}

export interface HealthData {
  connected: boolean;
  collections: CollectionStat[];
  totalDocuments: number;
  config: {
    maxBytes: number;
    ttlSeconds: number;
    confidenceThreshold: number;
    timeoutMs: number;
    embeddingModel: string;
    defaultTopK: number;
    similarityThreshold: number;
  };
}

export interface ExternalContentItem {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: string;
  fetchedAt: number;
  contentLength: number;
  tags: string[];
  contentPreview: string;
}

export interface ExternalContentData {
  items: ExternalContentItem[];
  total: number;
  limit: number;
  offset: number;
}
