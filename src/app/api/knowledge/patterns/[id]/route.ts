/**
 * 단일 Knowledge Pattern API 엔드포인트
 *
 * GET    /api/knowledge/patterns/[id] - 단일 패턴 조회
 * PUT    /api/knowledge/patterns/[id] - 패턴 수정
 * DELETE /api/knowledge/patterns/[id] - 패턴 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdatePatternSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Pattern');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/patterns/[id]
 * 단일 패턴 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const pattern = await prisma.knowledgePattern.findUnique({
      where: { id },
    });

    if (!pattern) {
      const byPatternId = await prisma.knowledgePattern.findUnique({
        where: { patternId: id },
      });

      if (!byPatternId) {
        return NextResponse.json(
          { error: '패턴을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byPatternId);
    }

    return NextResponse.json(pattern);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('패턴 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '패턴 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/patterns/[id]
 * 패턴 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdatePatternSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgePattern.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '패턴을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.patternId && data.patternId !== existing.patternId) {
      const duplicate = await prisma.knowledgePattern.findUnique({
        where: { patternId: data.patternId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `patternId '${data.patternId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const pattern = await prisma.knowledgePattern.update({
      where: { id },
      data: {
        ...(data.patternId && { patternId: data.patternId }),
        ...(data.name && { name: data.name }),
        ...(data.nameKo && { nameKo: data.nameKo }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionKo && { descriptionKo: data.descriptionKo }),
        ...(data.requiredComponents && { requiredComponents: data.requiredComponents as Prisma.InputJsonValue }),
        ...(data.optionalComponents && { optionalComponents: data.optionalComponents as Prisma.InputJsonValue }),
        ...(data.scalability && { scalability: data.scalability }),
        ...(data.complexity !== undefined && { complexity: data.complexity }),
        ...(data.bestForKo && { bestForKo: data.bestForKo }),
        ...(data.notSuitableForKo && { notSuitableForKo: data.notSuitableForKo }),
        ...(data.evolvesTo && { evolvesTo: data.evolvesTo }),
        ...(data.evolvesFrom && { evolvesFrom: data.evolvesFrom }),
        ...(data.tags && { tags: data.tags }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(pattern);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('패턴 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '패턴 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/patterns/[id]
 * 패턴 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgePattern.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '패턴을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgePattern.delete({
        where: { id },
      });

      return NextResponse.json({ message: '패턴이 영구 삭제되었습니다' });
    } else {
      const pattern = await prisma.knowledgePattern.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '패턴이 비활성화되었습니다',
        data: pattern,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('패턴 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '패턴 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
