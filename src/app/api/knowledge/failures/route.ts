/**
 * Knowledge Failure API 엔드포인트
 *
 * GET  /api/knowledge/failures - 장애 시나리오 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/failures - 새 장애 시나리오 생성
 *
 * Note: FailureImpact Prisma enum uses underscores (service_down)
 *       while the TS/Zod type uses hyphens (service-down). Conversion is handled here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  FailureQuerySchema,
  CreateFailureSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Failures');

/**
 * GET /api/knowledge/failures
 * 장애 시나리오 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = FailureQuerySchema.safeParse({
      component: searchParams.get('component') || undefined,
      impact: searchParams.get('impact') || undefined,
      likelihood: searchParams.get('likelihood') || undefined,
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

    const { component, impact, likelihood, search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgeFailureWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (component) {
      where.component = component;
    }

    if (impact) {
      // Zod uses underscores matching the Prisma enum directly
      where.impact = impact;
    }

    if (likelihood) {
      where.likelihood = likelihood;
    }

    if (search) {
      where.OR = [
        { failureId: { contains: search, mode: 'insensitive' } },
        { component: { contains: search, mode: 'insensitive' } },
        { titleKo: { contains: search, mode: 'insensitive' } },
        { scenarioKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeFailure.count({ where });

    const data = await prisma.knowledgeFailure.findMany({
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
    log.error('장애 시나리오 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '장애 시나리오 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/failures
 * 새 장애 시나리오 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateFailureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // failureId 중복 확인
    const existing = await prisma.knowledgeFailure.findUnique({
      where: { failureId: data.failureId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `failureId '${data.failureId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const failure = await prisma.knowledgeFailure.create({
      data: {
        failureId: data.failureId,
        component: data.component,
        titleKo: data.titleKo,
        scenarioKo: data.scenarioKo,
        impact: data.impact,
        likelihood: data.likelihood,
        affectedComponents: data.affectedComponents,
        preventionKo: data.preventionKo,
        mitigationKo: data.mitigationKo,
        estimatedMTTR: data.estimatedMTTR,
        tags: data.tags,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(failure, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('장애 시나리오 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '장애 시나리오 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
