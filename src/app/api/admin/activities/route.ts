import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AdminActivitiesAPI');

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const diagramId = url.searchParams.get('diagramId');
    const type = url.searchParams.get('type');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50', 10),
      200
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || '0', 10),
      0
    );

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (diagramId) where.diagramId = diagramId;
    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      prisma.activityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      prisma.activityEvent.count({ where }),
    ]);

    return NextResponse.json({ activities, total, limit, offset });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    log.error(
      '활동 목록 조회 실패',
      error instanceof Error ? error : undefined
    );
    return NextResponse.json(
      { error: '활동 목록을 불러오지 못했습니다' },
      { status: 500 }
    );
  }
}
