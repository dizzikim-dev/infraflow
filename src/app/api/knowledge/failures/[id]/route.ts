/**
 * 단일 Knowledge Failure API 엔드포인트
 *
 * GET    /api/knowledge/failures/[id] - 단일 장애 시나리오 조회
 * PUT    /api/knowledge/failures/[id] - 장애 시나리오 수정
 * DELETE /api/knowledge/failures/[id] - 장애 시나리오 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateFailureSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Failure');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/failures/[id]
 * 단일 장애 시나리오 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const failure = await prisma.knowledgeFailure.findUnique({
      where: { id },
    });

    if (!failure) {
      const byFailureId = await prisma.knowledgeFailure.findUnique({
        where: { failureId: id },
      });

      if (!byFailureId) {
        return NextResponse.json(
          { error: '장애 시나리오를 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byFailureId);
    }

    return NextResponse.json(failure);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('장애 시나리오 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '장애 시나리오 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/failures/[id]
 * 장애 시나리오 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateFailureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeFailure.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '장애 시나리오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.failureId && data.failureId !== existing.failureId) {
      const duplicate = await prisma.knowledgeFailure.findUnique({
        where: { failureId: data.failureId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `failureId '${data.failureId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const failure = await prisma.knowledgeFailure.update({
      where: { id },
      data: {
        ...(data.failureId && { failureId: data.failureId }),
        ...(data.component && { component: data.component }),
        ...(data.titleKo && { titleKo: data.titleKo }),
        ...(data.scenarioKo && { scenarioKo: data.scenarioKo }),
        ...(data.impact && { impact: data.impact }),
        ...(data.likelihood && { likelihood: data.likelihood }),
        ...(data.affectedComponents && { affectedComponents: data.affectedComponents }),
        ...(data.preventionKo && { preventionKo: data.preventionKo }),
        ...(data.mitigationKo && { mitigationKo: data.mitigationKo }),
        ...(data.estimatedMTTR && { estimatedMTTR: data.estimatedMTTR }),
        ...(data.tags && { tags: data.tags }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(failure);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('장애 시나리오 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '장애 시나리오 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/failures/[id]
 * 장애 시나리오 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgeFailure.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '장애 시나리오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeFailure.delete({
        where: { id },
      });

      return NextResponse.json({ message: '장애 시나리오가 영구 삭제되었습니다' });
    } else {
      const failure = await prisma.knowledgeFailure.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '장애 시나리오가 비활성화되었습니다',
        data: failure,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('장애 시나리오 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '장애 시나리오 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
