/**
 * Admin RAG Traces API
 *
 * GET /api/admin/rag/traces — List reasoning traces with pagination and filters
 *
 * Security: requireAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { listTraces } from '@/lib/rag/traceStore';

const log = createLogger('AdminRAGTraces');

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (authErr) {
    if (authErr instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: authErr.message },
        { status: authErr.statusCode },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 },
    );
  }

  try {
    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
    const minScore = url.searchParams.has('minScore')
      ? Number(url.searchParams.get('minScore'))
      : undefined;
    const success = url.searchParams.has('success')
      ? url.searchParams.get('success') === 'true'
      : undefined;
    const dateFrom = url.searchParams.get('dateFrom')
      ? new Date(url.searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = url.searchParams.get('dateTo')
      ? new Date(url.searchParams.get('dateTo')!)
      : undefined;

    const result = await listTraces({ limit, offset, minScore, success, dateFrom, dateTo });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    log.error('Failed to list traces', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list traces' },
      { status: 500 },
    );
  }
}
