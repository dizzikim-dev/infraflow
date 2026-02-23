import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/config/env';

const VALID_TYPES = [
  'prompt_submit', 'llm_modify', 'template_select',
  'node_add', 'node_delete', 'node_duplicate', 'node_update',
  'edge_add', 'edge_delete', 'edge_reverse',
  'diagram_create', 'diagram_update', 'export',
] as const;

const hasDb = !!getEnv().DATABASE_URL;

export async function POST(req: Request) {
  // No DB configured — silently accept (activity tracking is non-critical)
  if (!hasDb) {
    return NextResponse.json({ ok: true });
  }

  // CSRF check
  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { auth } = await import('@/lib/auth/auth');
  const { prisma } = await import('@/lib/db/prisma');

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type, sessionId, diagramId, prompt, detail } = body;

  if (!type || !sessionId) {
    return NextResponse.json({ error: 'type and sessionId required' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
  }

  await prisma.activityEvent.create({
    data: {
      userId: session.user.id,
      type,
      sessionId,
      diagramId: diagramId || null,
      prompt: prompt || null,
      detail: detail || null,
    },
  });

  return NextResponse.json({ ok: true });
}
