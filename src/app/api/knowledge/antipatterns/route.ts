/**
 * Knowledge AntiPattern API 엔드포인트
 *
 * GET  /api/knowledge/antipatterns - 안티패턴 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/antipatterns - 새 안티패턴 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  AntiPatternQuerySchema,
  CreateAntiPatternSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:AntiPatterns');

/**
 * GET /api/knowledge/antipatterns
 * 안티패턴 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = AntiPatternQuerySchema.safeParse({
      severity: searchParams.get('severity') || undefined,
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

    const { severity, search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgeAntiPatternWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (severity) {
      where.severity = severity;
    }

    if (search) {
      where.OR = [
        { antiPatternId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
        { problemKo: { contains: search, mode: 'insensitive' } },
        { solutionKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeAntiPattern.count({ where });

    const data = await prisma.knowledgeAntiPattern.findMany({
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
    log.error('안티패턴 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '안티패턴 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/antipatterns
 * 새 안티패턴 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateAntiPatternSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // antiPatternId 중복 확인
    const existing = await prisma.knowledgeAntiPattern.findUnique({
      where: { antiPatternId: data.antiPatternId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `antiPatternId '${data.antiPatternId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const antiPattern = await prisma.knowledgeAntiPattern.create({
      data: {
        antiPatternId: data.antiPatternId,
        name: data.name,
        nameKo: data.nameKo,
        severity: data.severity,
        detectionRuleId: data.detectionRuleId,
        detectionDescriptionKo: data.detectionDescriptionKo,
        problemKo: data.problemKo,
        impactKo: data.impactKo,
        solutionKo: data.solutionKo,
        tags: data.tags,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(antiPattern, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('안티패턴 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '안티패턴 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
