/**
 * Reasoning Trace Store
 *
 * Persists ReasoningTrace objects to PostgreSQL via Prisma.
 * When NEXT_PUBLIC_DEMO_MODE=true or DB is unavailable, all operations
 * are no-ops (graceful degradation).
 */

import { createLogger } from '@/lib/utils/logger';
import type { ReasoningTrace } from './types';

const log = createLogger('TraceStore');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

async function getPrisma() {
  const { prisma } = await import('@/lib/db/prisma');
  return prisma;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ListTracesOptions {
  limit?: number;
  offset?: number;
  minScore?: number;
  success?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListTracesResult {
  traces: {
    id: string;
    traceId: string;
    query: string;
    durationMs: number;
    maxScore: number;
    provider: string;
    success: boolean;
    nodeTypes: string[];
    createdAt: Date;
  }[];
  total: number;
}

/**
 * Save a reasoning trace to the database.
 * No-op in demo mode or when DB is unavailable.
 */
export async function saveTrace(trace: ReasoningTrace): Promise<void> {
  if (isDemoMode()) {
    log.debug('Demo mode — trace not persisted', { traceId: trace.id });
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.reasoningTrace.create({
      data: {
        traceId: trace.id,
        query: trace.query,
        traceData: JSON.parse(JSON.stringify(trace)),
        durationMs: trace.durationMs,
        maxScore: trace.ragSearch.maxScore,
        provider: trace.llm.provider,
        success: trace.llm.success,
        nodeTypes: trace.extractedNodeTypes,
      },
    });
    log.debug('Trace saved', { traceId: trace.id, durationMs: trace.durationMs });
  } catch (error) {
    log.warn('Failed to save trace — DB may be unavailable', {
      traceId: trace.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * List traces with optional filtering and pagination.
 */
export async function listTraces(options: ListTracesOptions = {}): Promise<ListTracesResult> {
  if (isDemoMode()) {
    return { traces: [], total: 0 };
  }

  const { limit = 20, offset = 0, minScore, success, dateFrom, dateTo } = options;

  try {
    const prisma = await getPrisma();

    const where: Record<string, unknown> = {};
    if (minScore !== undefined) {
      where.maxScore = { gte: minScore };
    }
    if (success !== undefined) {
      where.success = success;
    }
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = dateFrom;
      if (dateTo) createdAt.lte = dateTo;
      where.createdAt = createdAt;
    }

    const [traces, total] = await Promise.all([
      prisma.reasoningTrace.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          traceId: true,
          query: true,
          durationMs: true,
          maxScore: true,
          provider: true,
          success: true,
          nodeTypes: true,
          createdAt: true,
        },
      }),
      prisma.reasoningTrace.count({ where }),
    ]);

    return { traces, total };
  } catch (error) {
    log.warn('Failed to list traces', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { traces: [], total: 0 };
  }
}

/**
 * Get a single trace by its traceId (the trace-xxxxx ID, not the DB primary key).
 */
export async function getTrace(traceId: string): Promise<ReasoningTrace | null> {
  if (isDemoMode()) {
    return null;
  }

  try {
    const prisma = await getPrisma();
    const row = await prisma.reasoningTrace.findUnique({
      where: { traceId },
    });

    if (!row) return null;
    return row.traceData as unknown as ReasoningTrace;
  } catch (error) {
    log.warn('Failed to get trace', {
      traceId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Delete traces older than the specified number of days.
 * Returns the count of deleted records.
 */
export async function deleteOldTraces(olderThanDays: number): Promise<number> {
  if (isDemoMode()) {
    return 0;
  }

  try {
    const prisma = await getPrisma();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const result = await prisma.reasoningTrace.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    log.info('Deleted old traces', { olderThanDays, count: result.count });
    return result.count;
  } catch (error) {
    log.warn('Failed to delete old traces', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
