/**
 * 단일 Knowledge Relationship API 엔드포인트
 *
 * GET    /api/knowledge/relationships/[id] - 단일 관계 조회
 * PUT    /api/knowledge/relationships/[id] - 관계 수정
 * DELETE /api/knowledge/relationships/[id] - 관계 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateRelationshipSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Relationship');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/relationships/[id]
 * 단일 관계 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const relationship = await prisma.knowledgeRelationship.findUnique({
      where: { id },
    });

    if (!relationship) {
      // knowledgeId로도 시도
      const byKnowledgeId = await prisma.knowledgeRelationship.findUnique({
        where: { knowledgeId: id },
      });

      if (!byKnowledgeId) {
        return NextResponse.json(
          { error: '관계를 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byKnowledgeId);
    }

    return NextResponse.json(relationship);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('관계 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '관계 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/relationships/[id]
 * 관계 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateRelationshipSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeRelationship.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '관계를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // knowledgeId 변경 시 중복 확인
    if (data.knowledgeId && data.knowledgeId !== existing.knowledgeId) {
      const duplicate = await prisma.knowledgeRelationship.findUnique({
        where: { knowledgeId: data.knowledgeId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `knowledgeId '${data.knowledgeId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const relationship = await prisma.knowledgeRelationship.update({
      where: { id },
      data: {
        ...(data.knowledgeId && { knowledgeId: data.knowledgeId }),
        ...(data.sourceComponent && { sourceComponent: data.sourceComponent }),
        ...(data.targetComponent && { targetComponent: data.targetComponent }),
        ...(data.relationshipType && { relationshipType: data.relationshipType }),
        ...(data.strength && { strength: data.strength }),
        ...(data.direction && { direction: data.direction }),
        ...(data.reason && { reason: data.reason }),
        ...(data.reasonKo && { reasonKo: data.reasonKo }),
        ...(data.tags && { tags: data.tags }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(relationship);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('관계 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '관계 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/relationships/[id]
 * 관계 소프트 삭제 (isActive = false)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const existing = await prisma.knowledgeRelationship.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '관계를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeRelationship.delete({
        where: { id },
      });

      return NextResponse.json({ message: '관계가 영구 삭제되었습니다' });
    } else {
      const relationship = await prisma.knowledgeRelationship.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '관계가 비활성화되었습니다',
        data: relationship,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('관계 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '관계 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
