/**
 * 컴포넌트 정책 API 엔드포인트
 *
 * GET  /api/components/[id]/policies - 정책 목록 조회
 * POST /api/components/[id]/policies - 새 정책 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CreatePolicySchema } from '@/lib/validations/component';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('PolicyAPI');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/components/[id]/policies
 * 컴포넌트의 정책 목록 조회
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 컴포넌트 존재 확인
    const component = await prisma.infraComponent.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json(
        { error: '컴포넌트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 정책 목록 조회
    const policies = await prisma.policyRecommendation.findMany({
      where: { componentId: id },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      componentId: id,
      componentName: component.name,
      policies,
    });
  } catch (error) {
    log.error('정책 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '정책 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/components/[id]/policies
 * 새 정책 생성
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // 입력 데이터 검증
    const validationResult = CreatePolicySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // 컴포넌트 존재 확인
    const component = await prisma.infraComponent.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json(
        { error: '컴포넌트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // 정책 생성
    const policy = await prisma.policyRecommendation.create({
      data: {
        name: data.name,
        nameKo: data.nameKo,
        description: data.description,
        priority: data.priority,
        category: data.category,
        componentId: id,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    log.error('정책 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '정책 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
