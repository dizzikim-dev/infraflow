/**
 * 인프라 컴포넌트 API 엔드포인트
 *
 * GET  /api/components - 목록 조회 (페이지네이션, 필터링)
 * POST /api/components - 새 컴포넌트 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  CreateComponentSchema,
  ListQuerySchema,
  type CreateComponentInput,
} from '@/lib/validations/component';
import { Prisma } from '@/generated/prisma';

/**
 * GET /api/components
 * 컴포넌트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱 및 검증
    const queryResult = ListQuerySchema.safeParse({
      category: searchParams.get('category') || undefined,
      tier: searchParams.get('tier') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: '잘못된 쿼리 파라미터', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, tier, isActive, search, page, limit, sortBy, sortOrder } = queryResult.data;

    // 필터 조건 구성
    const where: Prisma.InfraComponentWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (tier) {
      where.tier = tier;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
        { componentId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 총 개수 조회
    const total = await prisma.infraComponent.count({ where });

    // 데이터 조회
    const components = await prisma.infraComponent.findMany({
      where,
      include: {
        policies: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: components,
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
    console.error('컴포넌트 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/components
 * 새 컴포넌트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 데이터 검증
    const validationResult = CreateComponentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data: CreateComponentInput = validationResult.data;

    // componentId 중복 확인
    const existing = await prisma.infraComponent.findUnique({
      where: { componentId: data.componentId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `componentId '${data.componentId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    // 컴포넌트 생성
    const component = await prisma.infraComponent.create({
      data: {
        componentId: data.componentId,
        name: data.name,
        nameKo: data.nameKo,
        category: data.category,
        tier: data.tier,
        description: data.description,
        descriptionKo: data.descriptionKo,
        functions: data.functions,
        functionsKo: data.functionsKo,
        features: data.features,
        featuresKo: data.featuresKo,
        ports: data.ports,
        protocols: data.protocols,
        vendors: data.vendors,
        isActive: true,
      },
      include: {
        policies: true,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('컴포넌트 생성 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
