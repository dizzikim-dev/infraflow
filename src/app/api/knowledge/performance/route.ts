/**
 * Knowledge Performance API 엔드포인트
 *
 * GET  /api/knowledge/performance - 성능 프로파일 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/performance - 새 성능 프로파일 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  PerformanceQuerySchema,
  CreatePerformanceSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Performance');

/**
 * GET /api/knowledge/performance
 * 성능 프로파일 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = PerformanceQuerySchema.safeParse({
      component: searchParams.get('component') || undefined,
      scalingStrategy: searchParams.get('scalingStrategy') || undefined,
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

    const { component, scalingStrategy, search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgePerformanceWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (component) {
      where.component = component;
    }

    if (scalingStrategy) {
      where.scalingStrategy = scalingStrategy;
    }

    if (search) {
      where.OR = [
        { performanceId: { contains: search, mode: 'insensitive' } },
        { component: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgePerformance.count({ where });

    const data = await prisma.knowledgePerformance.findMany({
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
    log.error('성능 프로파일 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '성능 프로파일 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/performance
 * 새 성능 프로파일 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreatePerformanceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // performanceId 중복 확인
    const existing = await prisma.knowledgePerformance.findUnique({
      where: { performanceId: data.performanceId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `performanceId '${data.performanceId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const performance = await prisma.knowledgePerformance.create({
      data: {
        performanceId: data.performanceId,
        component: data.component,
        nameKo: data.nameKo,
        latencyRange: data.latencyRange as Prisma.InputJsonValue,
        throughputRange: data.throughputRange as Prisma.InputJsonValue,
        scalingStrategy: data.scalingStrategy,
        bottleneckIndicators: data.bottleneckIndicators,
        bottleneckIndicatorsKo: data.bottleneckIndicatorsKo,
        optimizationTipsKo: data.optimizationTipsKo,
        tags: data.tags,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(performance, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('성능 프로파일 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '성능 프로파일 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
