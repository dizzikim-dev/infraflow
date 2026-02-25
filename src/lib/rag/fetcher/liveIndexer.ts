/**
 * Live Indexer
 *
 * Indexes externally fetched content into ChromaDB's EXTERNAL_CONTENT
 * collection. Generates embeddings and stores documents with metadata
 * for cache management.
 */

import { nanoid } from 'nanoid';
import { createLogger } from '@/lib/utils/logger';
import { getChromaClient, COLLECTIONS } from '../chromaClient';
import { generateEmbedding, generateEmbeddings } from '../embeddings';
import type { ExternalIndexRequest, FetchMetadata } from '../types';
import { contentHash } from './webFetcher';

const log = createLogger('LiveIndexer');

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface IndexResult {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Index a single piece of external content into ChromaDB.
 *
 * Generates an embedding for the content and upserts it into the
 * EXTERNAL_CONTENT collection with full metadata.
 */
export async function indexExternalContent(
  request: ExternalIndexRequest,
): Promise<IndexResult> {
  const id = `ext-${nanoid(8)}`;

  try {
    const client = await getChromaClient();
    if (!client) {
      return { id, success: false, error: 'ChromaDB unavailable' };
    }

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const embedding = await generateEmbedding(request.content);

    const metadata: Record<string, string | number> = {
      title: request.title,
      sourceUrl: request.sourceUrl ?? '',
      sourceType: request.sourceType,
      contentHash: contentHash(request.content),
      contentLength: request.content.length,
      fetchedAt: Date.now(),
      tags: (request.tags ?? []).join(','),
    };

    await collection.add({
      ids: [id],
      documents: [request.content],
      metadatas: [metadata],
      embeddings: [embedding],
    });

    log.info('Indexed external content', { id, title: request.title, sourceType: request.sourceType });

    return { id, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Failed to index external content', { id, error: message });
    return { id, success: false, error: message };
  }
}

/**
 * Index multiple external content items in batch.
 *
 * More efficient than calling indexExternalContent() in a loop because
 * it batches embedding generation and uses a single ChromaDB upsert.
 */
export async function indexExternalContentBatch(
  requests: ExternalIndexRequest[],
): Promise<IndexResult[]> {
  if (requests.length === 0) return [];

  const ids = requests.map(() => `ext-${nanoid(8)}`);

  try {
    const client = await getChromaClient();
    if (!client) {
      return ids.map((id) => ({ id, success: false, error: 'ChromaDB unavailable' }));
    }

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const documents = requests.map((r) => r.content);
    const embeddings = await generateEmbeddings(documents);

    const metadatas = requests.map((r) => ({
      title: r.title,
      sourceUrl: r.sourceUrl ?? '',
      sourceType: r.sourceType,
      contentHash: contentHash(r.content),
      contentLength: r.content.length,
      fetchedAt: Date.now(),
      tags: (r.tags ?? []).join(','),
    }));

    await collection.add({
      ids,
      documents,
      metadatas,
      embeddings,
    });

    log.info(`Batch indexed ${ids.length} external content items`);

    return ids.map((id) => ({ id, success: true }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Batch indexing failed', { error: message });
    return ids.map((id) => ({ id, success: false, error: message }));
  }
}
