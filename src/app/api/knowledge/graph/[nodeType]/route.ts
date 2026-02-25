/**
 * Knowledge Graph API - Node detail
 *
 * GET /api/knowledge/graph/[nodeType]
 * Returns detailed knowledge for a specific infrastructure node type,
 * including relationships, patterns, antipatterns, failures,
 * performance profile, and vendor products.
 *
 * Note: Knowledge graph data is static TypeScript (not Prisma).
 * This route is read-only — no CSRF check needed for GET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { getNodeDetail } from '@/lib/knowledge/graphVisualizer';
import { infrastructureDB } from '@/lib/data/infrastructureDB';
import type { InfraNodeType } from '@/types/infra';

const log = createLogger('KnowledgeAPI:GraphDetail');

/**
 * GET /api/knowledge/graph/[nodeType]
 * Returns detailed knowledge for a single node type.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nodeType: string }> },
) {
  try {
    await requireAdmin();

    const { nodeType } = await params;

    // Validate that the nodeType exists in the infrastructure database
    if (!infrastructureDB[nodeType]) {
      return NextResponse.json(
        { success: false, error: `노드 타입을 찾을 수 없습니다: ${nodeType}` },
        { status: 404 },
      );
    }

    const detail = await getNodeDetail(nodeType as InfraNodeType);

    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode },
      );
    }
    log.error('지식 그래프 노드 상세 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: '지식 그래프 노드 상세 조회에 실패했습니다' },
      { status: 500 },
    );
  }
}
