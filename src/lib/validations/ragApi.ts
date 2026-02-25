/**
 * RAG API Validation Schemas
 *
 * Zod schemas for validating RAG admin API request bodies.
 * Bilingual error messages (Korean + English).
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Crawl Request — POST /api/admin/rag/crawl
// ---------------------------------------------------------------------------

export const CrawlRequestSchema = z.object({
  /** URL to crawl */
  url: z
    .string()
    .url('유효한 URL을 입력하세요 / Please enter a valid URL')
    .max(2048, 'URL은 최대 2048자까지 허용됩니다 / URL must be at most 2048 characters'),
  /** Force re-fetch even if cached */
  forceRefresh: z.boolean().default(false),
  /** Optional tags for categorization */
  tags: z.array(z.string().max(50)).max(10).optional(),
  /** Optional title override */
  title: z.string().max(200).optional(),
});

export type CrawlRequest = z.infer<typeof CrawlRequestSchema>;

// ---------------------------------------------------------------------------
// Direct Index Request — POST /api/admin/rag/index
// ---------------------------------------------------------------------------

export const DirectIndexRequestSchema = z.object({
  /** Content to index (max 50KB) */
  content: z
    .string()
    .min(1, '콘텐츠를 입력하세요 / Content is required')
    .max(51200, '콘텐츠는 최대 50KB까지 허용됩니다 / Content must be at most 50KB'),
  /** Document title */
  title: z
    .string()
    .min(1, '제목을 입력하세요 / Title is required')
    .max(200, '제목은 최대 200자까지 허용됩니다 / Title must be at most 200 characters'),
  /** Source URL (optional) */
  sourceUrl: z
    .string()
    .url('유효한 URL을 입력하세요 / Please enter a valid URL')
    .optional(),
  /** Optional tags for categorization */
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type DirectIndexRequest = z.infer<typeof DirectIndexRequestSchema>;
