/**
 * Embedding Generator
 *
 * Generates vector embeddings using OpenAI's text-embedding-ada-002 model.
 * Provides graceful degradation — returns zero vectors when the OpenAI API
 * is unavailable (no API key, network error, etc.).
 */

import OpenAI from 'openai';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('Embeddings');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Embedding model used by OpenAI */
export const EMBEDDING_MODEL = 'text-embedding-ada-002';

/** Dimensionality of ada-002 embeddings */
export const EMBEDDING_DIMENSIONS = 1536;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Create a zero vector of the standard embedding dimensions.
 * Used as a fallback when the API is unavailable.
 */
function zeroVector(): number[] {
  return new Array(EMBEDDING_DIMENSIONS).fill(0);
}

/**
 * Sanitise input texts for the OpenAI API.
 * The API rejects empty strings, so we replace them with a single space.
 */
function sanitise(texts: string[]): string[] {
  return texts.map((t) => (t.length === 0 ? ' ' : t));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate embedding for a single text string.
 * Returns zero vector if OpenAI is unavailable.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0];
}

/**
 * Generate embeddings for multiple texts (batch).
 * Returns zero vectors if OpenAI is unavailable.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    const client = new OpenAI();
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: sanitise(texts),
    });
    return response.data.map((item) => item.embedding);
  } catch (error) {
    logger.warn('Failed to generate embeddings — returning zero vectors', {
      error: error instanceof Error ? error.message : String(error),
      count: texts.length,
    });
    return texts.map(() => zeroVector());
  }
}

/**
 * Build an embedding text string from structured product data.
 * Combines key fields into a single searchable string.
 */
export function buildEmbeddingText(data: {
  name: string;
  description: string;
  platforms?: string[];
  useCases?: string[];
}): string {
  const parts: string[] = [data.name, data.description];

  if (data.platforms && data.platforms.length > 0) {
    parts.push(data.platforms.join(' '));
  }

  if (data.useCases && data.useCases.length > 0) {
    parts.push(data.useCases.join(' '));
  }

  return parts.join(' ');
}
