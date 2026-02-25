/**
 * Admin RAG Crawl API
 *
 * POST /api/admin/rag/crawl
 *
 * Fetches content from a URL (GitHub README or generic web page),
 * generates embeddings, and indexes into ChromaDB's EXTERNAL_CONTENT
 * collection for RAG retrieval.
 *
 * Security: CSRF + requireAdmin + rate limit (5/min, 50/day)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { checkRateLimit, type RateLimitConfig } from '@/lib/middleware/rateLimiter';
import { createLogger } from '@/lib/utils/logger';
import { CrawlRequestSchema } from '@/lib/validations/ragApi';

const log = createLogger('AdminRAGCrawl');

// ---------------------------------------------------------------------------
// Rate limit: 5 req/min, 50/day
// ---------------------------------------------------------------------------

const CRAWL_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000,
  dailyLimit: 50,
};

// ---------------------------------------------------------------------------
// CSRF check (inline, same pattern as knowledgeRouteFactory)
// ---------------------------------------------------------------------------

function checkCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || '';
  const secFetchSite = request.headers.get('sec-fetch-site');
  const allowedOrigins = [`http://${host}`, `https://${host}`];

  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return NextResponse.json({ success: false, error: 'CSRF check failed' }, { status: 403 });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ success: false, error: 'CSRF check failed' }, { status: 403 });
  }

  return null;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. CSRF
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  // 2. Auth
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

  // 3. Rate limit
  const { allowed, response: rateLimitResponse } = await checkRateLimit(request, CRAWL_RATE_LIMIT);
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  // 4. Validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: '잘못된 JSON 형식입니다 / Invalid JSON' },
      { status: 400 },
    );
  }

  const parsed = CrawlRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
      { status: 400 },
    );
  }

  const { url, forceRefresh, tags, title } = parsed.data;

  try {
    // 5. Dynamic import for fetcher modules (keep route bundle small)
    const { isCached, invalidateCache } = await import('@/lib/rag/fetcher/fetchCache');
    const { isGitHubUrl, fetchGitHubReadme, extractReadmeSections } = await import('@/lib/rag/fetcher/githubFetcher');
    const { fetchUrl } = await import('@/lib/rag/fetcher/webFetcher');
    const { indexExternalContent } = await import('@/lib/rag/fetcher/liveIndexer');

    // 6. Cache check
    if (!forceRefresh) {
      const cached = await isCached(url);
      if (cached) {
        return NextResponse.json({
          success: true,
          cached: true,
          message: '이미 캐시된 콘텐츠입니다 / Content already cached',
        });
      }
    } else {
      // Force refresh: invalidate existing cache
      await invalidateCache(url);
    }

    // 7. Detect URL type and fetch
    let content: string;
    let resolvedTitle: string;
    let sourceType: 'github-readme' | 'web-page';

    if (isGitHubUrl(url)) {
      sourceType = 'github-readme';
      const readmeText = await fetchGitHubReadme(url);
      const sections = extractReadmeSections(readmeText);
      resolvedTitle = title ?? (sections.title || url);
      // Build searchable content from structured sections
      content = [
        sections.title,
        sections.description,
        sections.features,
        sections.installation,
        sections.requirements,
      ].filter(Boolean).join('\n\n');
    } else {
      sourceType = 'web-page';
      const result = await fetchUrl(url);
      content = result.content;
      resolvedTitle = title ?? url;
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: '콘텐츠를 추출할 수 없습니다 / No content extracted' },
        { status: 422 },
      );
    }

    // 8. Index
    const indexResult = await indexExternalContent({
      content,
      title: resolvedTitle,
      sourceUrl: url,
      tags,
      sourceType,
    });

    if (!indexResult.success) {
      return NextResponse.json(
        { success: false, error: indexResult.error ?? 'Indexing failed' },
        { status: 500 },
      );
    }

    log.info('External content crawled and indexed', {
      url,
      sourceType,
      id: indexResult.id,
      contentLength: content.length,
    });

    return NextResponse.json({
      success: true,
      id: indexResult.id,
      sourceType,
      title: resolvedTitle,
      contentLength: content.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Crawl failed', { url, error: message });
    return NextResponse.json(
      { success: false, error: `크롤링 실패 / Crawl failed: ${message}` },
      { status: 500 },
    );
  }
}
