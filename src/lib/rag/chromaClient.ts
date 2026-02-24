/**
 * ChromaDB Client Wrapper
 *
 * Provides a lazy singleton ChromaDB client with graceful degradation.
 * When ChromaDB is unavailable (not running, connection refused), the client
 * returns null instead of throwing, allowing the application to continue
 * without vector search capabilities.
 */

import { ChromaClient } from 'chromadb';
import { createLogger } from '@/lib/utils/logger';
import type { RAGConfig } from './types';

const logger = createLogger('ChromaClient');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** ChromaDB collection names for InfraFlow knowledge domains */
export const COLLECTIONS = {
  AI_SOFTWARE: 'infraflow-ai-software',
  CLOUD_SERVICES: 'infraflow-cloud-services',
  DEPLOYMENT_SCENARIOS: 'infraflow-deployment-scenarios',
  INTEGRATION_PATTERNS: 'infraflow-integration-patterns',
} as const;

/** Default RAG configuration */
export const RAG_CONFIG: RAGConfig = {
  persistDirectory: '.chroma',
  embeddingModel: 'text-embedding-ada-002',
  defaultTopK: 10,
  similarityThreshold: 0.7,
};

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

let clientInstance: ChromaClient | null = null;
let clientInitialized = false;

/**
 * Get or create the ChromaDB client singleton.
 *
 * Uses a lazy initialization pattern — the client is created on first call
 * and reused for subsequent calls. If ChromaDB is unreachable, logs a warning
 * and returns null (graceful degradation).
 *
 * @returns The ChromaClient instance, or null if ChromaDB is unavailable
 */
export async function getChromaClient(): Promise<ChromaClient | null> {
  if (clientInitialized) {
    return clientInstance;
  }

  try {
    const client = new ChromaClient();
    await client.heartbeat();
    clientInstance = client;
    clientInitialized = true;
    logger.info('ChromaDB client connected successfully');
    return clientInstance;
  } catch (error) {
    clientInitialized = true;
    clientInstance = null;
    logger.warn('ChromaDB is not available — RAG features will be disabled', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Check whether ChromaDB is reachable.
 *
 * Creates a temporary client and attempts a heartbeat. Does NOT affect the
 * singleton — use this for health-check endpoints.
 *
 * @returns true if ChromaDB responds to a heartbeat, false otherwise
 */
export async function isChromaAvailable(): Promise<boolean> {
  try {
    const client = new ChromaClient();
    await client.heartbeat();
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset the singleton client (for testing only).
 *
 * Clears the cached client so the next call to `getChromaClient()` will
 * attempt a fresh connection.
 */
export function resetChromaClient(): void {
  clientInstance = null;
  clientInitialized = false;
}
