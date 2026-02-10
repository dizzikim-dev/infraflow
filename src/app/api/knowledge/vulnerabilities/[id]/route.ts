/**
 * 단일 Knowledge Vulnerability API 엔드포인트
 *
 * GET    /api/knowledge/vulnerabilities/[id] - 단일 취약점 조회
 * PUT    /api/knowledge/vulnerabilities/[id] - 취약점 수정
 * DELETE /api/knowledge/vulnerabilities/[id] - 취약점 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateVulnerabilitySchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Vulnerability');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/vulnerabilities/[id]
 * 단일 취약점 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const vulnerability = await prisma.knowledgeVulnerability.findUnique({
      where: { id },
    });

    if (!vulnerability) {
      const byVulnId = await prisma.knowledgeVulnerability.findUnique({
        where: { vulnId: id },
      });

      if (!byVulnId) {
        return NextResponse.json(
          { error: '취약점을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(byVulnId);
    }

    return NextResponse.json(vulnerability);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('취약점 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '취약점 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/vulnerabilities/[id]
 * 취약점 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateVulnerabilitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeVulnerability.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '취약점을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.vulnId && data.vulnId !== existing.vulnId) {
      const duplicate = await prisma.knowledgeVulnerability.findUnique({
        where: { vulnId: data.vulnId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `vulnId '${data.vulnId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const vulnerability = await prisma.knowledgeVulnerability.update({
      where: { id },
      data: {
        ...(data.vulnId && { vulnId: data.vulnId }),
        ...(data.cveId !== undefined && { cveId: data.cveId }),
        ...(data.affectedComponents && { affectedComponents: data.affectedComponents }),
        ...(data.severity && { severity: data.severity }),
        ...(data.cvssScore !== undefined && { cvssScore: data.cvssScore }),
        ...(data.title && { title: data.title }),
        ...(data.titleKo && { titleKo: data.titleKo }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionKo && { descriptionKo: data.descriptionKo }),
        ...(data.mitigation && { mitigation: data.mitigation }),
        ...(data.mitigationKo && { mitigationKo: data.mitigationKo }),
        ...(data.publishedDate && { publishedDate: data.publishedDate }),
        ...(data.references && { references: data.references }),
        ...(data.trustMetadata && { trustMetadata: data.trustMetadata as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(vulnerability);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('취약점 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '취약점 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/vulnerabilities/[id]
 * 취약점 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgeVulnerability.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '취약점을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeVulnerability.delete({
        where: { id },
      });

      return NextResponse.json({ message: '취약점이 영구 삭제되었습니다' });
    } else {
      const vulnerability = await prisma.knowledgeVulnerability.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '취약점이 비활성화되었습니다',
        data: vulnerability,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('취약점 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '취약점 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
