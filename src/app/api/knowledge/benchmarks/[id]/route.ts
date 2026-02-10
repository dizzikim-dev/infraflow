/**
 * 단일 Knowledge Benchmark API 엔드포인트
 *
 * GET    /api/knowledge/benchmarks/[id] - 단일 벤치마크 조회
 * PUT    /api/knowledge/benchmarks/[id] - 벤치마크 수정
 * DELETE /api/knowledge/benchmarks/[id] - 벤치마크 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateBenchmarkSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Benchmark');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/benchmarks/[id]
 * 단일 벤치마크 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const benchmark = await prisma.knowledgeBenchmark.findUnique({
      where: { id },
    });

    if (!benchmark) {
      return NextResponse.json(
        { error: '벤치마크를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(benchmark);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('벤치마크 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '벤치마크 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/benchmarks/[id]
 * 벤치마크 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateBenchmarkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeBenchmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '벤치마크를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 복합 유니크 키 변경 시 중복 확인
    const newComponentType = data.componentType ?? existing.componentType;
    const newTrafficTier = data.trafficTier ?? existing.trafficTier;

    if (newComponentType !== existing.componentType || newTrafficTier !== existing.trafficTier) {
      const duplicate = await prisma.knowledgeBenchmark.findUnique({
        where: {
          componentType_trafficTier: {
            componentType: newComponentType,
            trafficTier: newTrafficTier,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: `벤치마크 '${newComponentType}/${newTrafficTier}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const benchmark = await prisma.knowledgeBenchmark.update({
      where: { id },
      data: {
        ...(data.componentType && { componentType: data.componentType }),
        ...(data.trafficTier && { trafficTier: data.trafficTier }),
        ...(data.recommendedInstanceCount !== undefined && { recommendedInstanceCount: data.recommendedInstanceCount }),
        ...(data.recommendedSpec && { recommendedSpec: data.recommendedSpec }),
        ...(data.recommendedSpecKo && { recommendedSpecKo: data.recommendedSpecKo }),
        ...(data.minimumInstanceCount !== undefined && { minimumInstanceCount: data.minimumInstanceCount }),
        ...(data.minimumSpec && { minimumSpec: data.minimumSpec }),
        ...(data.minimumSpecKo && { minimumSpecKo: data.minimumSpecKo }),
        ...(data.scalingNotes && { scalingNotes: data.scalingNotes }),
        ...(data.scalingNotesKo && { scalingNotesKo: data.scalingNotesKo }),
        ...(data.estimatedMonthlyCost !== undefined && { estimatedMonthlyCost: data.estimatedMonthlyCost }),
        ...(data.maxRPS !== undefined && { maxRPS: data.maxRPS }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(benchmark);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('벤치마크 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '벤치마크 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/benchmarks/[id]
 * 벤치마크 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgeBenchmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '벤치마크를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeBenchmark.delete({
        where: { id },
      });

      return NextResponse.json({ message: '벤치마크가 영구 삭제되었습니다' });
    } else {
      const benchmark = await prisma.knowledgeBenchmark.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '벤치마크가 비활성화되었습니다',
        data: benchmark,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('벤치마크 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '벤치마크 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
