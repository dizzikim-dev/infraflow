/**
 * Knowledge Pattern API 엔드포인트
 *
 * GET  /api/knowledge/patterns - 패턴 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/patterns - 새 패턴 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  KnowledgeListQuerySchema,
  CreatePatternSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Patterns');

/**
 * GET /api/knowledge/patterns
 * 패턴 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = KnowledgeListQuerySchema.safeParse({
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

    const { search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgePatternWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { patternId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgePattern.count({ where });

    const data = await prisma.knowledgePattern.findMany({
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
    log.error('패턴 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '패턴 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/patterns
 * 새 패턴 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreatePatternSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // patternId 중복 확인
    const existing = await prisma.knowledgePattern.findUnique({
      where: { patternId: data.patternId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `patternId '${data.patternId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const pattern = await prisma.knowledgePattern.create({
      data: {
        patternId: data.patternId,
        name: data.name,
        nameKo: data.nameKo,
        description: data.description,
        descriptionKo: data.descriptionKo,
        requiredComponents: data.requiredComponents as Prisma.InputJsonValue,
        optionalComponents: data.optionalComponents as Prisma.InputJsonValue,
        scalability: data.scalability,
        complexity: data.complexity,
        bestForKo: data.bestForKo,
        notSuitableForKo: data.notSuitableForKo,
        evolvesTo: data.evolvesTo,
        evolvesFrom: data.evolvesFrom,
        tags: data.tags,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(pattern, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('패턴 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '패턴 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
