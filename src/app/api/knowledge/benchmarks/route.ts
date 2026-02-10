/**
 * Knowledge Benchmark API 엔드포인트
 *
 * GET  /api/knowledge/benchmarks - 벤치마크 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/benchmarks - 새 벤치마크 생성
 *
 * Note: Unique composite key is [componentType, trafficTier]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  BenchmarkQuerySchema,
  CreateBenchmarkSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Benchmarks');

/**
 * GET /api/knowledge/benchmarks
 * 벤치마크 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = BenchmarkQuerySchema.safeParse({
      componentType: searchParams.get('componentType') || undefined,
      trafficTier: searchParams.get('trafficTier') || undefined,
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      tags: searchParams.get('tags') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: '잘못된 쿼리 파라미터', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { componentType, trafficTier, search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgeBenchmarkWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (componentType) {
      where.componentType = componentType;
    }

    if (trafficTier) {
      where.trafficTier = trafficTier;
    }

    if (search) {
      where.OR = [
        { componentType: { contains: search, mode: 'insensitive' } },
        { recommendedSpec: { contains: search, mode: 'insensitive' } },
        { recommendedSpecKo: { contains: search, mode: 'insensitive' } },
        { scalingNotes: { contains: search, mode: 'insensitive' } },
        { scalingNotesKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeBenchmark.count({ where });

    const data = await prisma.knowledgeBenchmark.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('벤치마크 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '벤치마크 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/benchmarks
 * 새 벤치마크 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateBenchmarkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 복합 유니크 키 [componentType, trafficTier] 중복 확인
    const existing = await prisma.knowledgeBenchmark.findUnique({
      where: {
        componentType_trafficTier: {
          componentType: data.componentType,
          trafficTier: data.trafficTier,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `벤치마크 '${data.componentType}/${data.trafficTier}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const benchmark = await prisma.knowledgeBenchmark.create({
      data: {
        componentType: data.componentType,
        trafficTier: data.trafficTier,
        recommendedInstanceCount: data.recommendedInstanceCount,
        recommendedSpec: data.recommendedSpec,
        recommendedSpecKo: data.recommendedSpecKo,
        minimumInstanceCount: data.minimumInstanceCount,
        minimumSpec: data.minimumSpec,
        minimumSpecKo: data.minimumSpecKo,
        scalingNotes: data.scalingNotes,
        scalingNotesKo: data.scalingNotesKo,
        estimatedMonthlyCost: data.estimatedMonthlyCost,
        maxRPS: data.maxRPS,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(benchmark, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('벤치마크 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '벤치마크 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
