import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { RegisterSchema } from '@/lib/validations/auth';
import { createLogger } from '@/lib/utils/logger';
import { checkRateLimit, DEFAULT_RATE_LIMIT } from '@/lib/middleware/rateLimiter';

const log = createLogger('RegisterAPI');

export async function POST(req: NextRequest) {
  const { allowed, response } = checkRateLimit(req, DEFAULT_RATE_LIMIT);
  if (!allowed) return response!;

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 유효하지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    log.info(`User registered: ${user.email}`);

    return NextResponse.json(
      { user },
      { status: 201 }
    );
  } catch (error) {
    log.error('Registration failed', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '회원가입에 실패했습니다' },
      { status: 500 }
    );
  }
}
