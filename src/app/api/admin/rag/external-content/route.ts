/**
 * Admin RAG External Content API
 *
 * GET  /api/admin/rag/external-content  — List indexed external content
 * DELETE /api/admin/rag/external-content — Delete external content by IDs
 *
 * Security: requireAdmin (GET), CSRF + requireAdmin (DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AdminRAGExternalContent');

// ---------------------------------------------------------------------------
// CSRF check (inline, same pattern as crawl/index routes)
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
// Auth guard (shared by GET and DELETE)
// ---------------------------------------------------------------------------

async function guardAdmin(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
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
}

// ---------------------------------------------------------------------------
// GET handler — list external content
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Auth
  const authError = await guardAdmin();
  if (authError) return authError;

  // 2. Parse pagination params
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

  try {
    const { getChromaClient, COLLECTIONS } = await import('@/lib/rag/chromaClient');

    const client = await getChromaClient();
    if (!client) {
      return NextResponse.json({
        success: true,
        data: { items: [], total: 0, limit, offset },
      });
    }

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    const total = await collection.count();

    if (total === 0) {
      return NextResponse.json({
        success: true,
        data: { items: [], total: 0, limit, offset },
      });
    }

    // ChromaDB get() with limit/offset
    const result = await collection.get({
      limit,
      offset,
      include: ['metadatas', 'documents'],
    });

    const items = (result.ids || []).map((id: string, i: number) => {
      const meta = result.metadatas?.[i] ?? {};
      const doc = result.documents?.[i] ?? '';
      return {
        id,
        title: meta.title ?? '',
        sourceUrl: meta.sourceUrl ?? '',
        sourceType: meta.sourceType ?? 'web-page',
        fetchedAt: meta.fetchedAt ?? 0,
        contentLength: meta.contentLength ?? 0,
        tags: typeof meta.tags === 'string' ? (meta.tags as string).split(',').filter(Boolean) : [],
        contentPreview: typeof doc === 'string' ? doc.slice(0, 200) : '',
      };
    });

    return NextResponse.json({
      success: true,
      data: { items, total, limit, offset },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Failed to list external content', { error: message });
    return NextResponse.json(
      { success: false, error: `목록 조회 실패 / List failed: ${message}` },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE handler — delete external content by IDs
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // 1. CSRF
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  // 2. Auth
  const authError = await guardAdmin();
  if (authError) return authError;

  // 3. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: '잘못된 JSON 형식입니다 / Invalid JSON' },
      { status: 400 },
    );
  }

  // 4. Validate ids
  if (
    !body ||
    typeof body !== 'object' ||
    !('ids' in body) ||
    !Array.isArray((body as { ids: unknown }).ids) ||
    (body as { ids: unknown[] }).ids.length === 0
  ) {
    return NextResponse.json(
      { success: false, error: '삭제할 ID 목록이 필요합니다 / ids array required' },
      { status: 400 },
    );
  }

  const ids = (body as { ids: string[] }).ids.filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );

  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, error: '유효한 ID가 없습니다 / No valid IDs provided' },
      { status: 400 },
    );
  }

  try {
    const { getChromaClient, COLLECTIONS } = await import('@/lib/rag/chromaClient');

    const client = await getChromaClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'ChromaDB를 사용할 수 없습니다 / ChromaDB unavailable' },
        { status: 503 },
      );
    }

    const collection = await client.getOrCreateCollection({
      name: COLLECTIONS.EXTERNAL_CONTENT,
    });

    await collection.delete({ ids });

    log.info('Deleted external content', { count: ids.length, ids });

    return NextResponse.json({
      success: true,
      deleted: ids.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('Failed to delete external content', { error: message });
    return NextResponse.json(
      { success: false, error: `삭제 실패 / Delete failed: ${message}` },
      { status: 500 },
    );
  }
}
