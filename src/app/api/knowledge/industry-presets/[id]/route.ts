/**
 * 단일 Knowledge Industry Preset API 엔드포인트
 *
 * GET    /api/knowledge/industry-presets/[id] - 단일 업종 프리셋 조회
 * PUT    /api/knowledge/industry-presets/[id] - 업종 프리셋 수정
 * DELETE /api/knowledge/industry-presets/[id] - 업종 프리셋 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateIndustryPresetSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:IndustryPreset');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/industry-presets/[id]
 * 단일 업종 프리셋 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const preset = await prisma.knowledgeIndustryPreset.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json(
        { error: '업종 프리셋을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(preset);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('업종 프리셋 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '업종 프리셋 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/industry-presets/[id]
 * 업종 프리셋 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateIndustryPresetSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeIndustryPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '업종 프리셋을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.industryType && data.industryType !== existing.industryType) {
      const duplicate = await prisma.knowledgeIndustryPreset.findUnique({
        where: { industryType: data.industryType },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `industryType '${data.industryType}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const preset = await prisma.knowledgeIndustryPreset.update({
      where: { id },
      data: {
        ...(data.industryType && { industryType: data.industryType }),
        ...(data.name && { name: data.name }),
        ...(data.nameKo && { nameKo: data.nameKo }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionKo && { descriptionKo: data.descriptionKo }),
        ...(data.requiredFrameworks && { requiredFrameworks: data.requiredFrameworks }),
        ...(data.requiredComponents && { requiredComponents: data.requiredComponents }),
        ...(data.recommendedComponents && { recommendedComponents: data.recommendedComponents }),
        ...(data.minimumSecurityLevel && { minimumSecurityLevel: data.minimumSecurityLevel }),
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('업종 프리셋 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '업종 프리셋 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/industry-presets/[id]
 * 업종 프리셋 소프트 삭제 (isActive = false)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const existing = await prisma.knowledgeIndustryPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '업종 프리셋을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeIndustryPreset.delete({
        where: { id },
      });

      return NextResponse.json({ message: '업종 프리셋이 영구 삭제되었습니다' });
    } else {
      const preset = await prisma.knowledgeIndustryPreset.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '업종 프리셋이 비활성화되었습니다',
        data: preset,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('업종 프리셋 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '업종 프리셋 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
