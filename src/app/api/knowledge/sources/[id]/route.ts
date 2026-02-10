/**
 * 단일 Knowledge Source Entry API 엔드포인트
 *
 * GET    /api/knowledge/sources/[id] - 단일 출처 조회
 * PUT    /api/knowledge/sources/[id] - 출처 수정
 * DELETE /api/knowledge/sources/[id] - 출처 삭제 (소프트 삭제)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import { UpdateSourceEntrySchema } from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Source');

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/knowledge/sources/[id]
 * 단일 출처 조회
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const source = await prisma.knowledgeSourceEntry.findUnique({
      where: { id },
    });

    if (!source) {
      const bySourceId = await prisma.knowledgeSourceEntry.findUnique({
        where: { sourceId: id },
      });

      if (!bySourceId) {
        return NextResponse.json(
          { error: '출처를 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(bySourceId);
    }

    return NextResponse.json(source);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('출처 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '출처 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge/sources/[id]
 * 출처 수정
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const validationResult = UpdateSourceEntrySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existing = await prisma.knowledgeSourceEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '출처를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (data.sourceId && data.sourceId !== existing.sourceId) {
      const duplicate = await prisma.knowledgeSourceEntry.findUnique({
        where: { sourceId: data.sourceId },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `sourceId '${data.sourceId}'가 이미 존재합니다` },
          { status: 409 }
        );
      }
    }

    const source = await prisma.knowledgeSourceEntry.update({
      where: { id },
      data: {
        ...(data.sourceId && { sourceId: data.sourceId }),
        ...(data.sourceType && { sourceType: data.sourceType }),
        ...(data.title && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.section !== undefined && { section: data.section }),
        ...(data.publishedDate !== undefined && { publishedDate: data.publishedDate }),
        ...(data.accessedDate && { accessedDate: data.accessedDate }),
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('출처 수정 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '출처 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/sources/[id]
 * 출처 소프트 삭제 (isActive = false)
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

    const existing = await prisma.knowledgeSourceEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '출처를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (hard) {
      await prisma.knowledgeSourceEntry.delete({
        where: { id },
      });

      return NextResponse.json({ message: '출처가 영구 삭제되었습니다' });
    } else {
      const source = await prisma.knowledgeSourceEntry.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: '출처가 비활성화되었습니다',
        data: source,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('출처 삭제 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '출처 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
