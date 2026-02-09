import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AdminUsersAPI');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { diagrams: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to get user', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '사용자를 불러오지 못했습니다' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    // Prevent self-role change
    if (session.user.id === id) {
      return NextResponse.json(
        { error: '자기 자신의 역할은 변경할 수 없습니다' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: '유효하지 않은 역할입니다' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    log.info(`User role updated: ${user.email} → ${role}`);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Failed to update user', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: '사용자 정보 수정에 실패했습니다' }, { status: 500 });
  }
}
