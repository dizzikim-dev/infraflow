/**
 * Knowledge Industry Preset API 엔드포인트
 *
 * GET  /api/knowledge/industry-presets - 업종 프리셋 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/industry-presets - 새 업종 프리셋 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  KnowledgeListQuerySchema,
  CreateIndustryPresetSchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:IndustryPresets');

/**
 * GET /api/knowledge/industry-presets
 * 업종 프리셋 목록 조회
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

    const where: Prisma.KnowledgeIndustryPresetWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeIndustryPreset.count({ where });

    const data = await prisma.knowledgeIndustryPreset.findMany({
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
    log.error('업종 프리셋 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '업종 프리셋 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/industry-presets
 * 새 업종 프리셋 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateIndustryPresetSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // industryType 중복 확인
    const existing = await prisma.knowledgeIndustryPreset.findUnique({
      where: { industryType: data.industryType },
    });

    if (existing) {
      return NextResponse.json(
        { error: `industryType '${data.industryType}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const preset = await prisma.knowledgeIndustryPreset.create({
      data: {
        industryType: data.industryType,
        name: data.name,
        nameKo: data.nameKo,
        description: data.description,
        descriptionKo: data.descriptionKo,
        requiredFrameworks: data.requiredFrameworks,
        requiredComponents: data.requiredComponents,
        recommendedComponents: data.recommendedComponents,
        minimumSecurityLevel: data.minimumSecurityLevel,
        isActive: true,
      },
    });

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('업종 프리셋 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '업종 프리셋 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
