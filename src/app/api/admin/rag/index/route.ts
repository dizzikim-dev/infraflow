/**
 * Admin RAG Direct Index API
 *
 * POST /api/admin/rag/index
 *
 * Directly indexes provided text content into ChromaDB's EXTERNAL_CONTENT
 * collection (no URL fetch needed). Useful for manually curated content.
 *
 * Security: CSRF + requireAdmin + rate limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { checkRateLimit, type RateLimitConfig } from '@/lib/middleware/rateLimiter';
import { createLogger } from '@/lib/utils/logger';
import { DirectIndexRequestSchema } from '@/lib/validations/ragApi';

const log = createLogger('AdminRAGIndex');

// ---------------------------------------------------------------------------
// Rate limit: 10 req/min, 100/day
// ---------------------------------------------------------------------------

const INDEX_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
  dailyLimit: 100,
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
  const { allowed, response: rateLimitResponse } = await checkRateLimit(request, INDEX_RATE_LIMIT);
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

  const parsed = DirectIndexRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
      { status: 400 },
    );
  }

  const { content, title, sourceUrl, tags } = parsed.data;

  try {
    // 5. Dynamic import for indexer
    const { indexExternalContent } = await import('@/lib/rag/fetcher/liveIndexer');

    // 6. Index
    const result = await indexExternalContent({
      content,
      title,
      sourceUrl,
      tags,
      sourceType: 'web-page',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? 'Indexing failed' },
        { status: 500 },
      );
    }

    log.info('Direct content indexed', {
      id: result.id,
      title,
      contentLength: content.length,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      title,
      contentLength: content.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Direct indexing failed', { error: message });
    return NextResponse.json(
      { success: false, error: `인덱싱 실패 / Indexing failed: ${message}` },
      { status: 500 },
    );
  }
}
