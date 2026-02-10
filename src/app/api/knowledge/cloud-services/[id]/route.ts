/**
 * 단일 Knowledge Cloud Service API 엔드포인트
 *
 * GET    /api/knowledge/cloud-services/[id] - 단일 클라우드 서비스 조회
 * PUT    /api/knowledge/cloud-services/[id] - 클라우드 서비스 수정
 * DELETE /api/knowledge/cloud-services/[id] - 클라우드 서비스 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateCloudServiceSchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:CloudService');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/cloud-services/[id]
 * 단일 클라우드 서비스 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const cloudService = await prisma.knowledgeCloudService.findUnique({
      where: { id },
    });

    if (!cloudService) {
      const byServiceId = await prisma.knowledgeCloudService.findUnique({
        where: { serviceId: id },
      });

      if (!byServiceId) {
        return NextResponse.json(
          { error: '클라우드 서비스를 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byServiceId);
    }

    return NextResponse.json(cloudService);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('클라우드 서비스 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '클라우드 서비스 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/cloud-services/[id]
 * 클라우드 서비스 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateCloudServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeCloudService.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '클라우드 서비스를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.serviceId && data.serviceId !== existing.serviceId) {
      const duplicate = await prisma.knowledgeCloudService.findUnique({
        where: { serviceId: data.serviceId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `serviceId '${data.serviceId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const cloudService = await prisma.knowledgeCloudService.update({
      where: { id },
      data: {
        ...(data.serviceId && { serviceId: data.serviceId }),
        ...(data.provider && { provider: data.provider }),
        ...(data.componentType && { componentType: data.componentType }),
        ...(data.serviceName && { serviceName: data.serviceName }),
        ...(data.serviceNameKo && { serviceNameKo: data.serviceNameKo }),
        ...(data.status && { status: data.status }),
        ...(data.successor !== undefined && { successor: data.successor }),
        ...(data.features && { features: data.features }),
        ...(data.featuresKo && { featuresKo: data.featuresKo }),
        ...(data.pricingTier && { pricingTier: data.pricingTier }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(cloudService);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('클라우드 서비스 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '클라우드 서비스 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/cloud-services/[id]
 * 클라우드 서비스 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgeCloudService.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '클라우드 서비스를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeCloudService.delete({
        where: { id },
      });

      return NextResponse.json({ message: '클라우드 서비스가 영구 삭제되었습니다' });
    } else {
      const cloudService = await prisma.knowledgeCloudService.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '클라우드 서비스가 비활성화되었습니다',
        data: cloudService,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('클라우드 서비스 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '클라우드 서비스 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
