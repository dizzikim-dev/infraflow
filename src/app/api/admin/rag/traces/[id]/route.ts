/**
 * Admin RAG Trace Detail API
 *
 * GET /api/admin/rag/traces/[id] — Get a single reasoning trace by traceId
 *
 * Security: requireAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { getTrace } from '@/lib/rag/traceStore';

const log = createLogger('AdminRAGTraceDetail');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
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
    const { id: traceId } = await params;

    if (!traceId) {
      return NextResponse.json(
        { success: false, error: 'Trace ID is required' },
        { status: 400 },
      );
    }

    const trace = await getTrace(traceId);

    if (!trace) {
      return NextResponse.json(
        { success: false, error: 'Trace not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: trace,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    log.error('Failed to get trace', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get trace' },
      { status: 500 },
    );
  }
}
