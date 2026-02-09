import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth, AuthError } from '@/lib/auth/authHelpers';
import { UpdateDiagramSchema } from '@/lib/validations/diagram';
import { createLogger } from '@/lib/utils/logger';
import type { InputJsonValue } from '@/generated/prisma/runtime/library';
import { Prisma } from '@/generated/prisma';

const log = createLogger('DiagramAPI');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const diagram = await prisma.diagram.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

    if (!diagram) {
      return NextResponse.json({ error: '다이어그램을 찾을 수 없습니다' }, { status: 404 });
    }

    // Check access: public diagrams are readable by anyone, private only by owner
    if (!diagram.isPublic) {
      const session = await requireAuth();
      if (diagram.userId !== session.user.id) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
      }
    }

    return NextResponse.json({ diagram });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to get diagram', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '다이어그램을 불러오지 못했습니다' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.diagram.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: '다이어그램을 찾을 수 없습니다' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateDiagramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 유효하지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { spec, nodesJson, edgesJson, ...rest } = parsed.data;
    const diagram = await prisma.diagram.update({
      where: { id },
      data: {
        ...rest,
        ...(spec !== undefined && { spec: spec as InputJsonValue }),
        ...(nodesJson !== undefined && {
          nodesJson: nodesJson === null ? Prisma.JsonNull : (nodesJson as InputJsonValue),
        }),
        ...(edgesJson !== undefined && {
          edgesJson: edgesJson === null ? Prisma.JsonNull : (edgesJson as InputJsonValue),
        }),
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ diagram });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to update diagram', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '다이어그램 수정에 실패했습니다' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.diagram.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: '다이어그램을 찾을 수 없습니다' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    await prisma.diagram.delete({ where: { id } });

    log.info(`Diagram deleted: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to delete diagram', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '다이어그램 삭제에 실패했습니다' }, { status: 500 });
  }
}
