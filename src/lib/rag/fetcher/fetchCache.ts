/**
 * Fetch Cache
 *
 * Prevents duplicate fetching of external content by checking
 * ChromaDB metadata for existing entries. Uses URL-based lookup
 * with TTL expiration.
 */

import { createLogger } from '@/lib/utils/logger';
import { getChromaClient, COLLECTIONS, FETCH_CACHE_CONFIG } from '../chromaClient';

const log = createLogger('FetchCache');

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a URL has already been fetched and cached in ChromaDB.
 *
 * Looks up the EXTERNAL_CONTENT collection for documents with
 * a matching sourceUrl metadata field, then checks TTL.
 */
export async function isCached(url: string): Promise<boolean> {
  const normalized = normalizeUrl(url);

  try {
    const client = await getChromaClient();
    if (!client) return false;

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const results = await collection.get({
      where: { sourceUrl: normalized },
      limit: 1,
    });

    if (!results.ids.length) return false;

    // Check TTL
    const metadata = results.metadatas?.[0];
    if (!metadata) return false;

    const fetchedAt = Number(metadata.fetchedAt ?? 0);
    const now = Date.now();
    const ttlMs = FETCH_CACHE_CONFIG.ttlSeconds * 1000;

    if (now - fetchedAt > ttlMs) {
      log.debug('Cache entry expired', { url: normalized, fetchedAt });
      return false;
    }

    return true;
  } catch (error) {
    log.warn('Cache check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Get cached content for a URL from ChromaDB.
 *
 * @returns The cached document content, or null if not cached/expired
 */
export async function getCachedContent(url: string): Promise<string | null> {
  const normalized = normalizeUrl(url);

  try {
    const client = await getChromaClient();
    if (!client) return null;

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const results = await collection.get({
      where: { sourceUrl: normalized },
      limit: 1,
    });

    if (!results.ids.length) return null;

    // Check TTL
    const metadata = results.metadatas?.[0];
    if (!metadata) return null;

    const fetchedAt = Number(metadata.fetchedAt ?? 0);
    const now = Date.now();
    const ttlMs = FETCH_CACHE_CONFIG.ttlSeconds * 1000;

    if (now - fetchedAt > ttlMs) return null;

    return results.documents?.[0] ?? null;
  } catch (error) {
    log.warn('Cache get failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Invalidate (delete) cached content for a URL.
 */
export async function invalidateCache(url: string): Promise<boolean> {
  const normalized = normalizeUrl(url);

  try {
    const client = await getChromaClient();
    if (!client) return false;

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const results = await collection.get({
      where: { sourceUrl: normalized },
    });

    if (results.ids.length > 0) {
      await collection.delete({ ids: results.ids });
      log.debug('Cache invalidated', { url: normalized, count: results.ids.length });
      return true;
    }

    return false;
  } catch (error) {
    log.warn('Cache invalidation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Normalize a URL for cache key comparison.
 *
 * - Lowercases the hostname
 * - Removes trailing slashes
 * - Removes fragment (#...)
 * - Sorts query parameters
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';

    // Sort search params for deterministic comparison
    const params = new URLSearchParams(parsed.searchParams);
    const sorted = new URLSearchParams([...params.entries()].sort());
    parsed.search = sorted.toString() ? `?${sorted.toString()}` : '';

    // Remove trailing slash from pathname (except root)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}
