# User Activity Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 유저별 시간순 행동 이력(프롬프트, 노드 수정, 다이어그램 전환 등)을 서버에 저장하여 관리자가 이용 패턴을 분석할 수 있게 한다.

**Architecture:** Prisma 스키마에 `activity_events` 테이블 추가 → 경량 `trackActivity()` 유틸리티 함수로 모든 유저 액션을 서버로 전송 (fire-and-forget POST) → 관리자 대시보드에서 유저별/다이어그램별 타임라인 조회.

**Tech Stack:** Prisma (PostgreSQL), Next.js API Route, React hooks, vitest

---

### Task 1: Prisma 스키마 — ActivityEvent 테이블 추가

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: 스키마에 enum + model 추가**

`prisma/schema.prisma` 파일 끝에 추가:

```prisma
enum ActivityType {
  prompt_submit       // 프롬프트 입력으로 다이어그램 생성
  llm_modify          // LLM 수정 요청
  template_select     // 템플릿 선택
  node_add            // 노드 추가
  node_delete         // 노드 삭제
  node_duplicate      // 노드 복제
  node_update         // 노드 라벨/설명 수정
  edge_add            // 엣지 추가
  edge_delete         // 엣지 삭제
  edge_reverse        // 엣지 방향 반전
  diagram_create      // 다이어그램 생성 (DB 저장)
  diagram_update      // 다이어그램 업데이트
  export              // 내보내기 (PDF, Terraform 등)
}

model ActivityEvent {
  id         String       @id @default(cuid())
  userId     String
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  type       ActivityType
  diagramId  String?      // 관련 다이어그램 ID (nullable)
  prompt     String?      @db.Text   // 프롬프트 텍스트 (prompt_submit, llm_modify)
  detail     Json?        // 액션별 상세 정보

  sessionId  String       // 프론트엔드 세션 ID (탭 단위)
  createdAt  DateTime     @default(now())

  @@index([userId])
  @@index([diagramId])
  @@index([type])
  @@index([createdAt])
  @@index([sessionId])
  @@map("activity_events")
}
```

`detail` JSON 예시 (타입별):
- `prompt_submit`: `{ confidence: 0.85, nodeCount: 5, templateUsed: "3tier" }`
- `node_add`: `{ nodeId: "fw-abc123", nodeType: "firewall", category: "security" }`
- `node_update`: `{ nodeId: "fw-abc123", field: "label", oldValue: "FW", newValue: "Main Firewall" }`
- `node_delete`: `{ nodeId: "fw-abc123", nodeType: "firewall" }`
- `edge_add`: `{ edgeId: "e_a_b", source: "fw-abc", target: "lb-def" }`
- `export`: `{ format: "terraform", filename: "infra.tf" }`
- `template_select`: `{ templateId: "3tier-web", templateName: "3-Tier Web" }`
- `llm_modify`: `{ operations: ["add-node", "modify-node"], reasoning: "..." }`

**Step 2: User 모델에 relation 추가**

`User` 모델에 추가:
```prisma
  activities ActivityEvent[]
```

**Step 3: 마이그레이션 실행**

Run: `npx prisma migrate dev --name add_activity_events`
Expected: Migration created and applied successfully

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add ActivityEvent schema for user activity tracking"
```

---

### Task 2: API Route — POST /api/activity

**Files:**
- Create: `src/app/api/activity/route.ts`
- Test: `src/__tests__/api/activity.test.ts`

**Step 1: 테스트 작성**

```typescript
// src/__tests__/api/activity.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    activityEvent: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth/auth.config', () => ({
  auth: vi.fn(),
}));

describe('POST /api/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated requests', async () => {
    const { auth } = await import('@/lib/auth/auth.config');
    vi.mocked(auth).mockResolvedValue(null);

    const { POST } = await import('@/app/api/activity/route');
    const req = new Request('http://localhost/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: JSON.stringify({
        type: 'prompt_submit',
        sessionId: 'test-session',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should validate required fields', async () => {
    const { auth } = await import('@/lib/auth/auth.config');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', role: 'USER' },
    } as any);

    const { POST } = await import('@/app/api/activity/route');
    const req = new Request('http://localhost/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: JSON.stringify({}), // missing type and sessionId
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should create activity event for authenticated user', async () => {
    const { auth } = await import('@/lib/auth/auth.config');
    const { prisma } = await import('@/lib/db/prisma');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', role: 'USER' },
    } as any);

    const { POST } = await import('@/app/api/activity/route');
    const req = new Request('http://localhost/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: JSON.stringify({
        type: 'prompt_submit',
        sessionId: 'sess-123',
        prompt: '3티어 웹 아키텍처',
        diagramId: 'diag-1',
        detail: { confidence: 0.9, nodeCount: 5 },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.activityEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        type: 'prompt_submit',
        sessionId: 'sess-123',
        prompt: '3티어 웹 아키텍처',
      }),
    });
  });
});
```

**Step 2: 테스트 실패 확인**

Run: `npx vitest run src/__tests__/api/activity.test.ts`
Expected: FAIL — module not found

**Step 3: API Route 구현**

```typescript
// src/app/api/activity/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

const VALID_TYPES = [
  'prompt_submit', 'llm_modify', 'template_select',
  'node_add', 'node_delete', 'node_duplicate', 'node_update',
  'edge_add', 'edge_delete', 'edge_reverse',
  'diagram_create', 'diagram_update', 'export',
] as const;

export async function POST(req: Request) {
  // CSRF check
  const origin = req.headers.get('origin');
  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
```

**Step 4: 테스트 통과 확인**

Run: `npx vitest run src/__tests__/api/activity.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/activity/ src/__tests__/api/activity.test.ts
git commit -m "feat: add POST /api/activity route for user action tracking"
```

---

### Task 3: 클라이언트 유틸리티 — trackActivity()

**Files:**
- Create: `src/lib/activity/trackActivity.ts`
- Test: `src/lib/activity/__tests__/trackActivity.test.ts`

**Step 1: 테스트 작성**

```typescript
// src/lib/activity/__tests__/trackActivity.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackActivity, getSessionId } from '../trackActivity';

describe('trackActivity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate consistent session ID within same module load', () => {
    const id1 = getSessionId();
    const id2 = getSessionId();
    expect(id1).toBe(id2);
    expect(id1).toHaveLength(8);
  });

  it('should send POST to /api/activity with correct payload', async () => {
    await trackActivity('prompt_submit', {
      prompt: 'test prompt',
      diagramId: 'diag-1',
      detail: { confidence: 0.9 },
    });

    expect(fetch).toHaveBeenCalledWith('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"type":"prompt_submit"'),
    });
  });

  it('should not throw on fetch failure (fire-and-forget)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    // Should not throw
    await expect(
      trackActivity('node_add', { detail: { nodeId: 'n1' } })
    ).resolves.toBeUndefined();
  });

  it('should include sessionId in every request', async () => {
    await trackActivity('node_delete', {});

    const body = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(body.sessionId).toHaveLength(8);
  });
});
```

**Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/activity/__tests__/trackActivity.test.ts`
Expected: FAIL — module not found

**Step 3: 구현**

```typescript
// src/lib/activity/trackActivity.ts
import { nanoid } from 'nanoid';

// Session ID: unique per browser tab (module-level singleton)
const SESSION_ID = nanoid(8);

export function getSessionId(): string {
  return SESSION_ID;
}

type ActivityType =
  | 'prompt_submit' | 'llm_modify' | 'template_select'
  | 'node_add' | 'node_delete' | 'node_duplicate' | 'node_update'
  | 'edge_add' | 'edge_delete' | 'edge_reverse'
  | 'diagram_create' | 'diagram_update' | 'export';

interface ActivityPayload {
  diagramId?: string | null;
  prompt?: string;
  detail?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity tracking.
 * Never throws — silently swallows errors to avoid disrupting UX.
 */
export async function trackActivity(
  type: ActivityType,
  payload: ActivityPayload = {},
): Promise<void> {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sessionId: SESSION_ID,
        diagramId: payload.diagramId ?? null,
        prompt: payload.prompt,
        detail: payload.detail,
      }),
    });
  } catch {
    // Fire-and-forget: never disrupt user flow
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/activity/__tests__/trackActivity.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/activity/
git commit -m "feat: add trackActivity() fire-and-forget client utility"
```

---

### Task 4: 훅에 trackActivity 삽입 — 프롬프트/LLM/템플릿

**Files:**
- Modify: `src/hooks/useLocalParser.ts` (prompt_submit, template_select)
- Modify: `src/hooks/useLLMModifier.ts` (llm_modify)

**Step 1: useLocalParser.ts — prompt_submit 추적**

`handlePromptSubmit` 성공 후 (`onDiagramGenerated` 호출 부근)에 추가:

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// 파싱 성공 후 (onDiagramGenerated 호출 부근):
trackActivity('prompt_submit', {
  prompt: trimmedPrompt,
  detail: {
    confidence: result.confidence,
    nodeCount: result.spec.nodes?.length ?? 0,
    templateUsed: result.templateUsed ?? null,
  },
});
```

**Step 2: useLocalParser.ts — template_select 추적**

`handleTemplateSelect` 성공 후에 추가:

```typescript
trackActivity('template_select', {
  detail: {
    templateId: template.id,
    templateName: template.name,
    nodeCount: template.spec.nodes?.length ?? 0,
  },
});
```

**Step 3: useLLMModifier.ts — llm_modify 추적**

`handleLLMModify` 성공 후에 추가:

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// LLM 수정 성공 후:
trackActivity('llm_modify', {
  prompt: trimmedPrompt,
  detail: {
    operations: result.operations?.map((op: any) => op.type) ?? [],
    reasoning: result.reasoning?.slice(0, 200),
    nodeCount: result.spec.nodes?.length ?? 0,
  },
});
```

**Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/hooks/useLocalParser.ts src/hooks/useLLMModifier.ts
git commit -m "feat: track prompt_submit, llm_modify, template_select activities"
```

---

### Task 5: 훅에 trackActivity 삽입 — 노드/엣지 CRUD

**Files:**
- Modify: `src/hooks/useNodes.ts` (node_add, node_delete, node_duplicate, node_update)
- Modify: `src/hooks/useEdges.ts` (edge_add, edge_delete, edge_reverse)
- Modify: `src/components/shared/FlowCanvas.tsx` (edge_add via onConnect)

**Step 1: useNodes.ts — 4개 액션 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// addNode (line ~102 이후):
trackActivity('node_add', {
  detail: { nodeId, nodeType, category: nodeData.category },
});

// deleteNode (line ~154 이후):
trackActivity('node_delete', {
  detail: { nodeId, nodeType: deletedNodeSpec?.type },
});

// duplicateNode (line ~199 이후):
trackActivity('node_duplicate', {
  detail: { sourceNodeId: nodeId, newNodeId: newId, nodeType: sourceNode.data.nodeType },
});

// updateNodeData (line ~262 이후):
trackActivity('node_update', {
  detail: { nodeId, field, value: value.slice(0, 100) },
});
```

**Step 2: useEdges.ts — edge_delete, edge_reverse 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// deleteEdge:
trackActivity('edge_delete', {
  detail: { edgeId, source: edge?.source, target: edge?.target },
});

// reverseEdge:
trackActivity('edge_reverse', {
  detail: { edgeId, oldSource: edge.source, oldTarget: edge.target },
});
```

**Step 3: FlowCanvas.tsx — edge_add (onConnect) 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// onConnect 함수 내:
trackActivity('edge_add', {
  detail: { source: params.source, target: params.target },
});
```

**Step 4: 타입 체크 + 테스트**

Run: `npx tsc --noEmit && npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/hooks/useNodes.ts src/hooks/useEdges.ts src/components/shared/FlowCanvas.tsx
git commit -m "feat: track node and edge CRUD activities"
```

---

### Task 6: 훅에 trackActivity 삽입 — 다이어그램 저장/내보내기

**Files:**
- Modify: `src/hooks/useDbHistory.ts` (diagram_create, diagram_update)
- Modify: `src/components/panels/ExportPanel.tsx` (export)
- Modify: `src/components/panels/ReportExportPanel.tsx` (export)

**Step 1: useDbHistory.ts — diagram_create/update 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// CREATE 성공 후 (POST /api/diagrams 성공 시):
trackActivity('diagram_create', {
  diagramId: newId,
  detail: { title: diagramTitle, nodeCount: spec.nodes?.length ?? 0 },
});

// UPDATE 성공 후 (PUT /api/diagrams/[id] 성공 시):
trackActivity('diagram_update', {
  diagramId: id,
  detail: { title: diagramTitle },
});
```

**Step 2: ExportPanel.tsx — export 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// handleExport 성공 후, downloadFile 호출 직후:
trackActivity('export', {
  detail: { format, filename },
});
```

**Step 3: ReportExportPanel.tsx — PDF report export 추적**

```typescript
import { trackActivity } from '@/lib/activity/trackActivity';

// handleGenerateReport 성공 후:
trackActivity('export', {
  detail: {
    format: 'pdf-report',
    title: options.title,
    sections: {
      architecture: options.includeArchitecture,
      security: options.includeSecurityAudit,
      compliance: options.includeCompliance,
      cost: options.includeCostEstimate,
    },
  },
});
```

**Step 4: 타입 체크 + 테스트**

Run: `npx tsc --noEmit && npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/hooks/useDbHistory.ts src/components/panels/ExportPanel.tsx src/components/panels/ReportExportPanel.tsx
git commit -m "feat: track diagram save and export activities"
```

---

### Task 7: 관리자 API — 활동 조회

**Files:**
- Create: `src/app/api/admin/activities/route.ts`
- Test: `src/__tests__/api/admin/activities.test.ts`

**Step 1: 테스트 작성**

```typescript
// src/__tests__/api/admin/activities.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    activityEvent: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

vi.mock('@/lib/auth/auth.config', () => ({
  auth: vi.fn(),
}));

describe('GET /api/admin/activities', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should reject non-admin users', async () => {
    const { auth } = await import('@/lib/auth/auth.config');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', role: 'USER' },
    } as any);

    const { GET } = await import('@/app/api/admin/activities/route');
    const req = new Request('http://localhost/api/admin/activities');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('should return activities for admin', async () => {
    const { auth } = await import('@/lib/auth/auth.config');
    const { prisma } = await import('@/lib/db/prisma');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.activityEvent.findMany).mockResolvedValue([]);
    vi.mocked(prisma.activityEvent.count).mockResolvedValue(0);

    const { GET } = await import('@/app/api/admin/activities/route');
    const req = new Request('http://localhost/api/admin/activities?limit=20');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('activities');
    expect(data).toHaveProperty('total');
  });
});
```

**Step 2: API 구현**

```typescript
// src/app/api/admin/activities/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const diagramId = url.searchParams.get('diagramId');
  const type = url.searchParams.get('type');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

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
}
```

**Step 3: 테스트 통과 확인**

Run: `npx vitest run src/__tests__/api/admin/activities.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/api/admin/activities/ src/__tests__/api/admin/
git commit -m "feat: add admin activities API with filtering"
```

---

### Task 8: 최종 검증

**Step 1: 타입 체크**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: 전체 테스트**

Run: `npx vitest run`
Expected: All pass (기존 3,889 + 새 테스트)

**Step 3: 최종 Commit**

```bash
git add -A
git commit -m "feat: user activity tracking — schema, API, client hooks, admin endpoint"
```

---

## 데이터 활용 예시

### 유저별 타임라인 조회
```
GET /api/admin/activities?userId=user-123&limit=100
→ 시간순으로 프롬프트 입력 → 노드 수정 → 내보내기 등 전체 행동 이력
```

### 다이어그램별 수정 이력
```
GET /api/admin/activities?diagramId=diag-456
→ 해당 다이어그램에서 어떤 노드를 추가/삭제/수정했는지 전체 이력
```

### 이용 패턴 분석
```
GET /api/admin/activities?type=prompt_submit&limit=200
→ 유저들이 어떤 프롬프트를 주로 사용하는지 확인
```
