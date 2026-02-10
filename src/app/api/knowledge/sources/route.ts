/**
 * Knowledge Source Entry API 엔드포인트
 *
 * GET  /api/knowledge/sources - 출처 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/sources - 새 출처 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  KnowledgeListQuerySchema,
  CreateSourceEntrySchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Sources');

/**
 * GET /api/knowledge/sources
 * 출처 목록 조회
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

    const where: Prisma.KnowledgeSourceEntryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { sourceId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { section: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeSourceEntry.count({ where });

    const data = await prisma.knowledgeSourceEntry.findMany({
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
    log.error('출처 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '출처 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/sources
 * 새 출처 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateSourceEntrySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // sourceId 중복 확인
    const existing = await prisma.knowledgeSourceEntry.findUnique({
      where: { sourceId: data.sourceId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `sourceId '${data.sourceId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const source = await prisma.knowledgeSourceEntry.create({
      data: {
        sourceId: data.sourceId,
        sourceType: data.sourceType,
        title: data.title,
        url: data.url,
        section: data.section,
        publishedDate: data.publishedDate,
        accessedDate: data.accessedDate,
        isActive: true,
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('출처 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '출처 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
