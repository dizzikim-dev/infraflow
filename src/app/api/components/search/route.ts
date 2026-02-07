/**
 * 컴포넌트 검색 API 엔드포인트
 *
 * GET /api/components/search?q=검색어
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SearchQuerySchema } from '@/lib/validations/component';
import { Prisma } from '@/generated/prisma';

/**
 * GET /api/components/search
 * 컴포넌트 검색
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱 및 검증
    const queryResult = SearchQuerySchema.safeParse({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      tier: searchParams.get('tier') || undefined,
      limit: searchParams.get('limit') || 10,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: '잘못된 검색 파라미터', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { q, category, tier, limit } = queryResult.data;

    // 검색 조건 구성
    const where: Prisma.InfraComponentWhereInput = {
      isActive: true,
      AND: [
        // 검색어 조건
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nameKo: { contains: q, mode: 'insensitive' } },
            { componentId: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { descriptionKo: { contains: q, mode: 'insensitive' } },
            { vendors: { hasSome: [q] } },
            { protocols: { hasSome: [q] } },
          ],
        },
        // 카테고리 필터
        ...(category ? [{ category }] : []),
        // 티어 필터
        ...(tier ? [{ tier }] : []),
      ],
    };

    // 검색 결과 조회
    const components = await prisma.infraComponent.findMany({
      where,
      select: {
        id: true,
        componentId: true,
        name: true,
        nameKo: true,
        category: true,
        tier: true,
        description: true,
        descriptionKo: true,
        vendors: true,
      },
      orderBy: [
        // 이름이 검색어로 시작하는 것 우선
        { name: 'asc' },
      ],
      take: limit,
    });

    // 검색 결과에 하이라이트 정보 추가
    const results = components.map((component) => ({
      ...component,
      matchedField: getMatchedField(component, q),
    }));

    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('컴포넌트 검색 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 검색에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * 매칭된 필드 찾기 (하이라이트용)
 */
function getMatchedField(
  component: {
    name: string;
    nameKo: string;
    componentId: string;
    description: string;
    descriptionKo: string;
    vendors: string[];
  },
  query: string
): string | null {
  const q = query.toLowerCase();

  if (component.componentId.toLowerCase().includes(q)) return 'componentId';
  if (component.name.toLowerCase().includes(q)) return 'name';
  if (component.nameKo.includes(query)) return 'nameKo';
  if (component.description.toLowerCase().includes(q)) return 'description';
  if (component.descriptionKo.includes(query)) return 'descriptionKo';
  if (component.vendors.some((v) => v.toLowerCase().includes(q))) return 'vendors';

  return null;
}
