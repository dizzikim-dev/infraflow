/**
 * Unrecognized Query Logging API
 *
 * POST-only endpoint for logging parser fallbacks.
 * No authentication required (fire-and-forget from client).
 * Rate-limited per session (10 requests/minute).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logUnrecognizedSchema } from '@/lib/validations/unrecognizedQuery';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('LogUnrecognized');

// Simple in-memory rate limiter (session-based, per-minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(sessionKey: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionKey);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // CSRF protection — check Origin header
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: '허용되지 않은 요청입니다.' },
        { status: 403 }
      );
    }

    // Rate limiting by IP or forwarded-for
    const sessionKey = request.headers.get('x-forwarded-for')
      || request.headers.get('x-real-ip')
      || 'anonymous';

    if (isRateLimited(sessionKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = logUnrecognizedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { query, confidence, sessionId } = parsed.data;
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.unrecognizedQuery.create({
      data: {
        query,
        confidence,
        sessionId,
        userAgent,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    log.error('Failed to log unrecognized query', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
