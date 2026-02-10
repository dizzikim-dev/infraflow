/**
 * 단일 Knowledge Performance API 엔드포인트
 *
 * GET    /api/knowledge/performance/[id] - 단일 성능 프로파일 조회
 * PUT    /api/knowledge/performance/[id] - 성능 프로파일 수정
 * DELETE /api/knowledge/performance/[id] - 성능 프로파일 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdatePerformanceSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:PerformanceDetail');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/performance/[id]
 * 단일 성능 프로파일 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const performance = await prisma.knowledgePerformance.findUnique({
      where: { id },
    });

    if (!performance) {
      const byPerformanceId = await prisma.knowledgePerformance.findUnique({
        where: { performanceId: id },
      });

      if (!byPerformanceId) {
        return NextResponse.json(
          { error: '성능 프로파일을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byPerformanceId);
    }

    return NextResponse.json(performance);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('성능 프로파일 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '성능 프로파일 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/performance/[id]
 * 성능 프로파일 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdatePerformanceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgePerformance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '성능 프로파일을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.performanceId && data.performanceId !== existing.performanceId) {
      const duplicate = await prisma.knowledgePerformance.findUnique({
        where: { performanceId: data.performanceId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `performanceId '${data.performanceId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const performance = await prisma.knowledgePerformance.update({
      where: { id },
      data: {
        ...(data.performanceId && { performanceId: data.performanceId }),
        ...(data.component && { component: data.component }),
        ...(data.nameKo && { nameKo: data.nameKo }),
        ...(data.latencyRange && { latencyRange: data.latencyRange as Prisma.InputJsonValue }),
        ...(data.throughputRange && { throughputRange: data.throughputRange as Prisma.InputJsonValue }),
        ...(data.scalingStrategy && { scalingStrategy: data.scalingStrategy }),
        ...(data.bottleneckIndicators && { bottleneckIndicators: data.bottleneckIndicators }),
        ...(data.bottleneckIndicatorsKo && { bottleneckIndicatorsKo: data.bottleneckIndicatorsKo }),
        ...(data.optimizationTipsKo && { optimizationTipsKo: data.optimizationTipsKo }),
        ...(data.tags && { tags: data.tags }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(performance);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('성능 프로파일 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '성능 프로파일 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/performance/[id]
 * 성능 프로파일 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgePerformance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '성능 프로파일을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgePerformance.delete({
        where: { id },
      });

      return NextResponse.json({ message: '성능 프로파일이 영구 삭제되었습니다' });
    } else {
      const performance = await prisma.knowledgePerformance.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '성능 프로파일이 비활성화되었습니다',
        data: performance,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('성능 프로파일 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '성능 프로파일 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
