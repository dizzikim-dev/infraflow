/**
 * 단일 정책 API 엔드포인트
 *
 * PUT    /api/components/[id]/policies/[policyId] - 정책 수정
 * DELETE /api/components/[id]/policies/[policyId] - 정책 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { UpdatePolicySchema } from '@/lib/validations/component';

interface RouteContext {
  params: Promise<{ id: string; policyId: string }>;
}

/**
 * PUT /api/components/[id]/policies/[policyId]
 * 정책 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, policyId } = await context.params;
    const body = await request.json();

    // 입력 데이터 검증
    const validationResult = UpdatePolicySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // 정책 존재 확인
    const existing = await prisma.policyRecommendation.findFirst({
      where: {
        id: policyId,
        componentId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '정책을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // 정책 수정
    const policy = await prisma.policyRecommendation.update({
      where: { id: policyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameKo && { nameKo: data.nameKo }),
        ...(data.description && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.category && { category: data.category }),
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('정책 수정 실패:', error);
    return NextResponse.json(
      { error: '정책 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/components/[id]/policies/[policyId]
 * 정책 삭제
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, policyId } = await context.params;

    // 정책 존재 확인
    const existing = await prisma.policyRecommendation.findFirst({
      where: {
        id: policyId,
        componentId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '정책을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 정책 삭제
    await prisma.policyRecommendation.delete({
      where: { id: policyId },
    });

    return NextResponse.json({ message: '정책이 삭제되었습니다' });
  } catch (error) {
    console.error('정책 삭제 실패:', error);
    return NextResponse.json(
      { error: '정책 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
