/**
 * Admin RAG Health API
 *
 * GET /api/admin/rag/health
 *
 * Returns ChromaDB connection status, collection document counts,
 * and system configuration values.
 *
 * Security: requireAdmin (GET — no CSRF needed)
 */

import { NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AdminRAGHealth');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionStat {
  name: string;
  count: number;
}

interface HealthResponse {
  success: boolean;
  data?: {
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
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse<HealthResponse>> {
  // 1. Auth
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { success: false, error: '인증 오류 / Authentication error' },
      { status: 401 },
    );
  }

  try {
    // 2. Dynamic import to keep bundle small
    const { getChromaClient, COLLECTIONS, FETCH_CACHE_CONFIG, RAG_CONFIG } =
      await import('@/lib/rag/chromaClient');

    const client = await getChromaClient();

    if (!client) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          collections: [],
          totalDocuments: 0,
          config: {
            maxBytes: FETCH_CACHE_CONFIG.maxBytes,
            ttlSeconds: FETCH_CACHE_CONFIG.ttlSeconds,
            confidenceThreshold: FETCH_CACHE_CONFIG.confidenceThreshold,
            timeoutMs: FETCH_CACHE_CONFIG.timeoutMs,
            embeddingModel: RAG_CONFIG.embeddingModel,
            defaultTopK: RAG_CONFIG.defaultTopK,
            similarityThreshold: RAG_CONFIG.similarityThreshold,
          },
        },
      });
    }

    // 3. Collect stats per collection
    const collectionNames = Object.values(COLLECTIONS);
    const collections: CollectionStat[] = [];
    let totalDocuments = 0;

    for (const name of collectionNames) {
      try {
        const collection = await client.getOrCreateCollection({ name });
        const count = await collection.count();
        collections.push({ name, count });
        totalDocuments += count;
      } catch {
        collections.push({ name, count: 0 });
      }
    }

    log.info('Health check completed', { connected: true, totalDocuments });

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        collections,
        totalDocuments,
        config: {
          maxBytes: FETCH_CACHE_CONFIG.maxBytes,
          ttlSeconds: FETCH_CACHE_CONFIG.ttlSeconds,
          confidenceThreshold: FETCH_CACHE_CONFIG.confidenceThreshold,
          timeoutMs: FETCH_CACHE_CONFIG.timeoutMs,
          embeddingModel: RAG_CONFIG.embeddingModel,
          defaultTopK: RAG_CONFIG.defaultTopK,
          similarityThreshold: RAG_CONFIG.similarityThreshold,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Health check failed', { error: message });
    return NextResponse.json(
      { success: false, error: `상태 확인 실패 / Health check failed: ${message}` },
      { status: 500 },
    );
  }
}
