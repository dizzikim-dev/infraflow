/**
 * Web Fetcher
 *
 * Fetches and processes web content for RAG indexing.
 * Converts HTML pages to plain text with size limits.
 */

import { createLogger } from '@/lib/utils/logger';
import { getEnv } from '@/lib/config/env';
import { FETCH_CACHE_CONFIG } from '../chromaClient';

const log = createLogger('WebFetcher');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default fetch timeout in milliseconds — reads from RAG_FETCH_TIMEOUT_MS env */
function getDefaultTimeoutMs(): number {
  return getEnv().RAG_FETCH_TIMEOUT_MS;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchUrlOptions {
  /** Timeout in milliseconds (default: 10s) */
  timeoutMs?: number;
  /** Maximum content size in bytes (default: FETCH_CACHE_CONFIG.maxBytes) */
  maxBytes?: number;
}

export interface FetchUrlResult {
  content: string;
  contentHash: string;
  contentLength: number;
  contentType: string;
  url: string;
}

/**
 * Fetch content from a URL and convert to plain text.
 *
 * - Uses AbortController for timeout enforcement
 * - Strips HTML to plain text
 * - Truncates content at maxBytes
 */
export async function fetchUrl(
  url: string,
  options?: FetchUrlOptions,
): Promise<FetchUrlResult> {
  const timeoutMs = options?.timeoutMs ?? getDefaultTimeoutMs();
  const maxBytes = options?.maxBytes ?? FETCH_CACHE_CONFIG.maxBytes;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'InfraFlow-RAG/1.0',
        Accept: 'text/html,text/plain,text/markdown,application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? 'text/html';
    const rawText = await response.text();

    // Convert HTML to text if needed
    let content: string;
    if (contentType.includes('text/html')) {
      content = htmlToText(rawText);
    } else {
      content = rawText;
    }

    // Truncate to max size
    if (content.length > maxBytes) {
      content = content.slice(0, maxBytes);
      log.debug('Content truncated', { url, original: rawText.length, truncated: maxBytes });
    }

    return {
      content,
      contentHash: contentHash(content),
      contentLength: content.length,
      contentType,
      url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Strip HTML tags and convert to plain text.
 *
 * Removes script/style blocks, strips tags, decodes basic entities,
 * and normalizes whitespace.
 */
export function htmlToText(html: string): string {
  let text = html;

  // Remove script and style blocks
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Replace block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br)\s*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Generate a simple hash of content for deduplication.
 * Uses a fast string hash (djb2).
 */
export function contentHash(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash + content.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
