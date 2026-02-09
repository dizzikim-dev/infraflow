import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth, AuthError } from '@/lib/auth/authHelpers';
import { CreateDiagramSchema } from '@/lib/validations/diagram';
import { createLogger } from '@/lib/utils/logger';
import type { InputJsonValue } from '@/generated/prisma/runtime/library';

const log = createLogger('DiagramsAPI');

export async function GET() {
  try {
    const session = await requireAuth();

    const diagrams = await prisma.diagram.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ diagrams });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to list diagrams', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '다이어그램 목록을 불러오지 못했습니다' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = CreateDiagramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 유효하지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { spec, nodesJson, edgesJson, ...rest } = parsed.data;
    const diagram = await prisma.diagram.create({
      data: {
        ...rest,
        spec: spec as InputJsonValue,
        nodesJson: nodesJson as InputJsonValue | undefined,
        edgesJson: edgesJson as InputJsonValue | undefined,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    log.info(`Diagram created: ${diagram.id}`);

    return NextResponse.json({ diagram }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to create diagram', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '다이어그램 생성에 실패했습니다' }, { status: 500 });
  }
}
