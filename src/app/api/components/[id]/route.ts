/**
 * 단일 인프라 컴포넌트 API 엔드포인트
 *
 * GET    /api/components/[id] - 단일 컴포넌트 조회
 * PUT    /api/components/[id] - 컴포넌트 수정
 * DELETE /api/components/[id] - 컴포넌트 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { UpdateComponentSchema } from '@/lib/validations/component';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/components/[id]
 * 단일 컴포넌트 조회 (정책 포함)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const component = await prisma.infraComponent.findUnique({
      where: { id },
      include: {
        policies: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!component) {
      // componentId로도 시도
      const componentById = await prisma.infraComponent.findUnique({
        where: { componentId: id },
        include: {
          policies: {
            orderBy: { priority: 'asc' },
          },
        },
      });

      if (!componentById) {
        return NextResponse.json(
          { error: '컴포넌트를 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(componentById);
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('컴포넌트 조회 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/components/[id]
 * 컴포넌트 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // 입력 데이터 검증
    const validationResult = UpdateComponentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 컴포넌트 존재 확인
    const existing = await prisma.infraComponent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '컴포넌트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // componentId 변경 시 중복 확인
    if (data.componentId && data.componentId !== existing.componentId) {
      const duplicate = await prisma.infraComponent.findUnique({
        where: { componentId: data.componentId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `componentId '${data.componentId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    // 컴포넌트 수정
    const component = await prisma.infraComponent.update({
      where: { id },
      data: {
        ...(data.componentId && { componentId: data.componentId }),
        ...(data.name && { name: data.name }),
        ...(data.nameKo && { nameKo: data.nameKo }),
        ...(data.category && { category: data.category }),
        ...(data.tier && { tier: data.tier }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionKo && { descriptionKo: data.descriptionKo }),
        ...(data.functions && { functions: data.functions }),
        ...(data.functionsKo && { functionsKo: data.functionsKo }),
        ...(data.features && { features: data.features }),
        ...(data.featuresKo && { featuresKo: data.featuresKo }),
        ...(data.ports && { ports: data.ports }),
        ...(data.protocols && { protocols: data.protocols }),
        ...(data.vendors && { vendors: data.vendors }),
      },
      include: {
        policies: true,
      },
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error('컴포넌트 수정 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/components/[id]
 * 컴포넌트 소프트 삭제 (isActive = false)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    // 컴포넌트 존재 확인
    const existing = await prisma.infraComponent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '컴포넌트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      // 하드 삭제 (실제 삭제)
      await prisma.infraComponent.delete({
        where: { id },
      });

      return NextResponse.json({ message: '컴포넌트가 영구 삭제되었습니다' });
    } else {
      // 소프트 삭제 (isActive = false)
      const component = await prisma.infraComponent.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '컴포넌트가 비활성화되었습니다',
        component,
      });
    }
  } catch (error) {
    console.error('컴포넌트 삭제 실패:', error);
    return NextResponse.json(
      { error: '컴포넌트 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
