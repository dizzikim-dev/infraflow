/**
 * Live Augmenter
 *
 * Query-time augmentation: when RAG search results have low confidence,
 * attempts to fetch relevant external content (e.g., GitHub READMEs)
 * and index it for immediate use.
 *
 * Has a hard timeout (2.5s by default) to avoid blocking the user.
 */

import { createLogger } from '@/lib/utils/logger';
import { FETCH_CACHE_CONFIG } from '../chromaClient';
import type { LiveAugmentResult } from '../types';
import { isGitHubUrl, fetchGitHubReadme, extractReadmeSections } from './githubFetcher';
import { fetchUrl } from './webFetcher';
import { indexExternalContent } from './liveIndexer';

const log = createLogger('LiveAugmenter');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Known product names to GitHub repo URL mapping.
 * Used to auto-fetch README for recognized products.
 */
const PRODUCT_GITHUB_URLS: Record<string, string> = {
  ollama: 'https://github.com/ollama/ollama',
  vllm: 'https://github.com/vllm-project/vllm',
  chromadb: 'https://github.com/chroma-core/chroma',
  langchain: 'https://github.com/langchain-ai/langchain',
  llamaindex: 'https://github.com/run-llama/llama_index',
  litellm: 'https://github.com/BerriAI/litellm',
  mlflow: 'https://github.com/mlflow/mlflow',
  milvus: 'https://github.com/milvus-io/milvus',
  qdrant: 'https://github.com/qdrant/qdrant',
  weaviate: 'https://github.com/weaviate/weaviate',
  'llama.cpp': 'https://github.com/ggerganov/llama.cpp',
  tgi: 'https://github.com/huggingface/text-generation-inference',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface LiveAugmentOptions {
  /** Timeout in milliseconds (default: FETCH_CACHE_CONFIG.timeoutMs) */
  timeoutMs?: number;
}

/**
 * Attempt to augment RAG results by fetching external content.
 *
 * Strategy:
 * 1. Extract product names from query
 * 2. Look up known GitHub repos for those products
 * 3. Fetch README and index it
 * 4. Return result within the hard timeout
 *
 * Never throws — returns a result indicating success or failure.
 */
export async function liveAugment(
  query: string,
  options?: LiveAugmentOptions,
): Promise<LiveAugmentResult> {
  const timeoutMs = options?.timeoutMs ?? FETCH_CACHE_CONFIG.timeoutMs;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await Promise.race([
      doAugment(query),
      new Promise<LiveAugmentResult>((_, reject) => {
        controller.signal.addEventListener('abort', () =>
          reject(new Error('Live augment timeout')),
        );
      }),
    ]);

    return {
      ...result,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug('Live augment failed or timed out', { query, error: message });
    return {
      attempted: true,
      success: false,
      documentsIndexed: 0,
      durationMs: Date.now() - startTime,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

/**
 * Extract product names from query by matching against known products.
 */
export function extractProductNames(query: string): string[] {
  const lower = query.toLowerCase();
  return Object.keys(PRODUCT_GITHUB_URLS).filter((name) => lower.includes(name));
}

/**
 * Core augmentation logic (called inside the timeout race).
 */
async function doAugment(query: string): Promise<LiveAugmentResult> {
  const products = extractProductNames(query);

  if (products.length === 0) {
    return {
      attempted: false,
      success: false,
      documentsIndexed: 0,
      durationMs: 0,
    };
  }

  // Pick the first matching product
  const product = products[0];
  const githubUrl = PRODUCT_GITHUB_URLS[product];

  if (!githubUrl) {
    return {
      attempted: false,
      success: false,
      documentsIndexed: 0,
      durationMs: 0,
    };
  }

  log.debug('Attempting live augment', { product, githubUrl });

  let content: string;
  let title: string;

  if (isGitHubUrl(githubUrl)) {
    const readmeText = await fetchGitHubReadme(githubUrl, { timeoutMs: 2000 });
    const sections = extractReadmeSections(readmeText);
    title = sections.title || product;
    content = [
      sections.title,
      sections.description,
      sections.features,
      sections.installation,
      sections.requirements,
    ].filter(Boolean).join('\n\n');
  } else {
    const result = await fetchUrl(githubUrl, { timeoutMs: 2000 });
    content = result.content;
    title = product;
  }

  if (!content.trim()) {
    return {
      attempted: true,
      success: false,
      documentsIndexed: 0,
      durationMs: 0,
      sourceUrl: githubUrl,
      error: 'No content extracted',
    };
  }

  const indexResult = await indexExternalContent({
    content,
    title,
    sourceUrl: githubUrl,
    tags: [product, 'live-augment'],
    sourceType: 'github-readme',
  });

  return {
    attempted: true,
    success: indexResult.success,
    documentsIndexed: indexResult.success ? 1 : 0,
    durationMs: 0, // Will be overwritten by caller
    sourceUrl: githubUrl,
    error: indexResult.error,
  };
}
