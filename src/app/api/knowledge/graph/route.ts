/**
 * Knowledge Graph API - Full graph data
 *
 * GET /api/knowledge/graph
 * Returns the complete knowledge graph with nodes, edges, and stats.
 * Supports optional filters via query parameters.
 *
 * Query params:
 * - categories: comma-separated category filter (e.g., "security,network")
 * - relationshipTypes: comma-separated relationship type filter
 * - tiers: comma-separated tier filter (e.g., "internal,dmz")
 * - includeIsolated: "true" to include nodes with no relationships
 *
 * Note: Knowledge graph data is static TypeScript (not Prisma).
 * This route is read-only — no CSRF check needed for GET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { buildKnowledgeGraph } from '@/lib/knowledge/graphVisualizer';
import type { GraphFilterOptions } from '@/lib/knowledge/graphVisualizer';
import type { RelationshipType } from '@/lib/knowledge/types';

const log = createLogger('KnowledgeAPI:Graph');

const VALID_RELATIONSHIP_TYPES = new Set<string>([
  'requires',
  'recommends',
  'conflicts',
  'enhances',
  'protects',
]);

/**
 * GET /api/knowledge/graph
 * Returns the full knowledge graph with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;

    // Parse filter options from query params
    const options: GraphFilterOptions = {};

    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      options.categories = categoriesParam.split(',').filter(Boolean);
    }

    const relTypesParam = searchParams.get('relationshipTypes');
    if (relTypesParam) {
      const types = relTypesParam.split(',').filter(Boolean);
      const validTypes = types.filter((t) => VALID_RELATIONSHIP_TYPES.has(t));
      if (validTypes.length > 0) {
        options.relationshipTypes = validTypes as RelationshipType[];
      }
    }

    const tiersParam = searchParams.get('tiers');
    if (tiersParam) {
      options.tiers = tiersParam.split(',').filter(Boolean);
    }

    const includeIsolated = searchParams.get('includeIsolated');
    if (includeIsolated === 'true') {
      options.includeIsolated = true;
    }

    const graph = await buildKnowledgeGraph(options);

    return NextResponse.json({
      success: true,
      data: graph,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    log.error('지식 그래프 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '지식 그래프 조회에 실패했습니다' },
      { status: 500 },
    );
  }
}
