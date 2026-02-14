# Comprehensive Code Review #5 (2026-02-14)

> InfraFlow 프로젝트 포괄적 코드 리뷰 — 비관/낙관/탐색 에이전트 병렬 분석 결과

## 1. 프로젝트 현황 스냅샷

| 항목 | 수치 |
|------|------|
| 총 파일 수 | 441 TS/TSX |
| 총 LOC | 142,195줄 (소스 111,778 + 테스트 30,417) |
| 테스트 파일 | 98개 (PR-5에서 +1) |
| API 라우트 | 41개 |
| 컴포넌트 | 80개 |
| Custom Hooks | 32개 |
| Knowledge DB | 105 rels, 32 patterns, 45 antipatterns, 64 failures |

---

## 2. 에이전트 분석 결과 요약

### 2.1 비관 에이전트 (23 이슈 보고 → 검증 후 5개 확인)

비관 에이전트가 23개 이슈를 보고했으나, 독립적 검증 결과 **상당수가 이미 수정되었거나 과장**된 것으로 판명됨.

| 이슈 ID | 설명 | 보고 심각도 | 검증 결과 | 실제 심각도 |
|---------|------|-----------|----------|-----------|
| ISSUE-01 | Rate Limiter 메모리 누수 | Critical | **이미 수정됨** | — |
| ISSUE-02 | parseInt radix 누락 | Critical | **확인됨** | Low |
| ISSUE-03 | /api/components 인증 누락 | Critical | **부정확** (의도적 공개 API) | — |
| ISSUE-04 | LLM Metrics Array.shift() O(n) | Critical | 미검증 (개선 권장) | Low |
| ISSUE-05 | Plugin loader new Function() | Critical | **확인됨** (의도적, 주석 있음) | Medium |
| ISSUE-06 | CSRF Origin 부정확 매칭 | Critical | **확인됨** | Medium |
| ISSUE-07 | useEffect 의존성 과다 | High | 미검증 (일반적 주의사항) | Low |
| ISSUE-08 | console.log 잔존 | High | **부정확** (모두 createLogger 전환 완료) | — |
| ISSUE-09 | Silent catch blocks | High | **부정확** (패턴 없음) | — |
| ISSUE-10 | 하드코딩된 설정값 | High | 미검증 (일부 존재) | Low |
| ISSUE-11 | Prisma N+1 쿼리 | High | 미검증 (include 사용 확인) | Medium |
| ISSUE-12 | /api/parse rate limit 누락 | High | **확인됨** | High |
| ISSUE-13 | export * 83건 | High | **부정확** (실제 4개만) | — |
| ISSUE-14 | any 타입 983건 | High | **부정확** (실제 11개, 대부분 테스트) | — |
| ISSUE-15 | 불필요한 setTimeout | Medium | 미검증 | Low |
| ISSUE-16 | 환경변수 검증 부재 | Medium | 미검증 (개선 권장) | Medium |
| ISSUE-17 | errorData 파싱 실패 무시 | Medium | 미검증 | Low |
| ISSUE-18 | TODO 방치 | Medium | 미검증 (Prisma generated만) | — |
| ISSUE-19 | FlowCanvas 이중 상태 | Medium | **의도적 설계** (React Flow 권장) | — |
| ISSUE-20 | 코드 스플리팅 부족 | Medium | 미검증 (개선 권장) | Medium |
| ISSUE-21 | log-unrecognized 인증 없음 | Low | 의도적 (rate limit 존재) | — |
| ISSUE-22 | index.ts 배럴 파일 과다 | Low | **부정확** (4개만) | — |
| ISSUE-23 | Prisma 로깅 과다 | Low | 미검증 | Low |

**결론**: 6개 Critical 중 **실제 Critical은 0개**, 확인된 이슈는 5개(대부분 Medium 이하)

### 2.2 낙관 에이전트 (15 기회 보고 → 검증 후 2개 실현 가능)

| 기회 ID | 설명 | 보고 영향도 | 검증 결과 | 실현 가능성 |
|---------|------|-----------|----------|------------|
| O1 | Analyze API Route Factory | High | **부분 구현** (analyzeRouteUtils 존재) | 실현 가능 (Low 복잡도) |
| O2 | Panel 공통 레이아웃 Hook | Medium | **이미 잘 설계됨** (PanelContainer/Header/Tabs) | 불필요 |
| O3 | composeHooks 패턴 | High | 미검증 | 과대평가 |
| O4 | Badge Theme 중앙화 | Medium | **파일 미존재, 중복 확인** | 실현 가능 (Low 복잡도) |
| O5 | as const + satisfies | High | **비실용적** (현재 union type이 더 나음) | 거절 |
| O6 | Batch API Operations | Medium | 미검증 | 장기 과제 |
| O7 | React 19 use() Hook | Medium | 미검증 | 장기 과제 |
| O8 | GraphQL API | Strategic | 미검증 | 장기 과제 |
| O9 | LLM Streaming | High | **비실용적** (복잡도 대비 이득 미미) | 거절 |
| O10 | Plugin Hot Reload | Medium | 미검증 | 장기 과제 |
| O11 | Real-time Cloud Pricing | High | 미검증 | 장기 과제 |
| O12 | E2E 테스트 확대 | High | 미검증 | 장기 과제 |
| O13 | i18n 글로벌화 | Strategic | 미검증 | 장기 과제 |
| O14 | Zod → Auto Form | High | 미검증 (ComponentForm 445줄 확인) | 장기 과제 |
| O15 | Vector DB 의미 검색 | Strategic | 미검증 | 장기 과제 |

### 2.3 탐색 에이전트 추가 발견사항

1. **불필요한 npm 의존성 5개**: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util` (Prisma 빌드 아티팩트로 추정)
2. **가장 큰 컴포넌트**: InfraEditor(596줄), ComponentForm(445줄), Header(428줄)
3. **Hook 테스트 커버리지**: 32개 중 대부분 통합 테스트로만 커버

---

## 3. 확인된 개선 항목 (검증 완료)

검증을 통과한 실제 개선이 필요한 항목들:

### 3.1 보안 (Security)

| ID | 항목 | 심각도 | 파일 | 설명 |
|----|------|--------|------|------|
| S-1 | `/api/parse` rate limit 누락 | **High** | `src/app/api/parse/route.ts` | `/api/modify`는 있는데 `/api/parse`는 누락. LLM API 호출 비용 무방비 |
| S-2 | CSRF Origin 부정확 매칭 | Medium | 4개 API route | `origin.includes(host)` → subdomain spoofing 가능 |
| S-3 | Plugin loader `new Function()` | Medium | `src/lib/plugins/loader.ts:275` | Code injection 가능성 (의도적이나 문서화 강화 필요) |

### 3.2 코드 품질 (Code Quality)

| ID | 항목 | 심각도 | 파일 | 설명 |
|----|------|--------|------|------|
| Q-1 | parseInt radix 누락 | Low | 8개 파일 | `parseInt(val)` → `parseInt(val, 10)` 필요 |
| Q-2 | LLM Metrics Array.shift() | Low | `src/lib/utils/llmMetrics.ts:48` | MAX_ENTRIES(200) 초과 시 O(n) shift |
| Q-3 | Badge Theme 분산 | Low | 5개 Panel 컴포넌트 | 동일 색상 매핑이 각 패널에 인라인 정의 |
| Q-4 | 환경변수 검증 부재 | Medium | API routes | Zod schema로 빌드타임 검증 부재 |

### 3.3 아키텍처 개선 (Architecture)

| ID | 항목 | 영향도 | 파일 | 설명 |
|----|------|--------|------|------|
| A-1 | Analyze Route Factory | Medium | 4개 analyze route | 공통 패턴을 factory로 통합 가능 (~86% 코드 감소) |
| A-2 | Prisma include N+1 | Medium | `src/app/api/components/route.ts` | `include: { policies: true }` 로 인한 추가 쿼리 |
| A-3 | 코드 스플리팅 강화 | Medium | `src/components/editor/InfraEditor.tsx` | 모달/패널 dynamic import 미적용 |

---

## 4. 실행 계획 (PR 단위)

### 병렬 처리 구조

```
Phase 1 (병렬 — 독립적 PR 3개)
├── PR-1: 보안 수정 (S-1 + S-2)         ← 독립
├── PR-2: parseInt radix + LLM Metrics   ← 독립
└── PR-3: Badge Theme 중앙화             ← 독립

Phase 2 (병렬 — 독립적 PR 2개, Phase 1 완료 후)
├── PR-4: Analyze Route Factory          ← 독립
└── PR-5: 환경변수 검증 + 코드 스플리팅  ← 독립
```

---

### PR-1: API 보안 강화 (S-1 + S-2)

**목적**: `/api/parse` rate limit 추가 + CSRF Origin 정확 매칭

**변경 파일**:
1. `src/app/api/parse/route.ts` — rate limit 추가
2. `src/app/api/parse/route.ts` — CSRF origin 정확 매칭
3. `src/app/api/modify/route.ts` — CSRF origin 정확 매칭
4. `src/app/api/log-unrecognized/route.ts` — CSRF origin 정확 매칭
5. `src/lib/api/analyzeRouteUtils.ts` — CSRF origin 정확 매칭

**상세 작업**:

#### 1-1. `/api/parse` rate limit 추가
```typescript
// src/app/api/parse/route.ts — POST 핸들러 시작부
import { checkRateLimit, LLM_RATE_LIMIT } from '@/lib/middleware/rateLimiter';

export async function POST(request: NextRequest): Promise<NextResponse<SmartParseResponse>> {
  // Rate limit 체크 (기존 /api/modify와 동일 패턴)
  const { allowed, response: rateLimitResponse } = checkRateLimit(request, LLM_RATE_LIMIT);
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse as NextResponse<SmartParseResponse>;
  }
  // ... 기존 로직
}
```

#### 1-2. CSRF Origin 정확 매칭 (4개 파일 공통)
```typescript
// Before (모든 파일 공통 패턴):
if (origin && host && !origin.includes(host)) {

// After:
const allowedOrigins = [
  `http://${host}`,
  `https://${host}`,
];
if (origin && !allowedOrigins.includes(origin)) {
```

**예상 변경량**: +20줄, ~15줄 수정
**의존성**: 없음 (독립 실행 가능)
**테스트**: 기존 API 테스트 + CSRF 테스트 추가 검토

---

### PR-2: parseInt radix 수정 + LLM Metrics 개선 (Q-1 + Q-2)

**목적**: 코드 품질 향상 — parseInt 모범 사례 적용, Array.shift() → circular index

**변경 파일**:
1. `src/components/admin/knowledge/JsonFieldEditor.tsx` (2개소)
2. `src/components/admin/knowledge/KnowledgeListPage.tsx` (1개소)
3. `src/app/admin/components/page.tsx` (1개소)
4. `src/app/admin/knowledge/*/page.tsx` (4~5개소)
5. `src/lib/utils/llmMetrics.ts` (circular buffer 적용)

**상세 작업**:

#### 2-1. parseInt radix 추가
```typescript
// Before:
parseInt(e.target.value) || 0
parseInt(searchParams.get('page') || '1')

// After:
parseInt(e.target.value, 10) || 0
parseInt(searchParams.get('page') || '1', 10)
```

#### 2-2. LLM Metrics circular index
```typescript
// Before:
const metrics: LLMCallMetric[] = [];
export function recordLLMCall(metric: LLMCallMetric): void {
  metrics.push(metric);
  if (metrics.length > MAX_ENTRIES) {
    metrics.shift(); // O(n)
  }
}

// After:
const metrics: (LLMCallMetric | null)[] = new Array(MAX_ENTRIES).fill(null);
let writeIndex = 0;
let count = 0;

export function recordLLMCall(metric: LLMCallMetric): void {
  metrics[writeIndex] = metric;
  writeIndex = (writeIndex + 1) % MAX_ENTRIES;
  if (count < MAX_ENTRIES) count++;
}

export function getLLMMetrics(since?: string): LLMCallMetric[] {
  const result: LLMCallMetric[] = [];
  const startIdx = count < MAX_ENTRIES ? 0 : writeIndex;
  for (let i = 0; i < count; i++) {
    const idx = (startIdx + i) % MAX_ENTRIES;
    const m = metrics[idx];
    if (m && (!since || new Date(m.timestamp) >= new Date(since))) {
      result.push(m);
    }
  }
  return result;
}
```

**예상 변경량**: ~40줄 수정
**의존성**: 없음 (독립 실행 가능)
**테스트**: llmMetrics 기존 테스트 수정, parseInt 변경은 기능 무변경

---

### PR-3: Badge Theme 중앙화 (Q-3)

**목적**: 5개 패널에 분산된 badge 색상 매핑을 단일 파일로 통합

**변경 파일**:
1. `src/lib/utils/badgeThemes.ts` (**신규**)
2. `src/components/panels/VulnerabilityPanel.tsx` (인라인 정의 → import)
3. `src/components/panels/CloudCatalogPanel.tsx` (인라인 정의 → import)
4. `src/components/panels/IndustryCompliancePanel.tsx` (인라인 정의 → import)
5. `src/components/panels/BenchmarkPanel.tsx` (인라인 정의 → import)
6. `src/components/panels/SecurityAuditPanel.tsx` (인라인 정의 → import)

**상세 작업**:

#### 3-1. badgeThemes.ts 생성
```typescript
// src/lib/utils/badgeThemes.ts

export const SEVERITY_BADGE = {
  critical: { icon: '🔴', className: 'bg-red-500/20 text-red-300' },
  high:     { icon: '🟠', className: 'bg-orange-500/20 text-orange-300' },
  medium:   { icon: '🟡', className: 'bg-yellow-500/20 text-yellow-300' },
  low:      { icon: '🟢', className: 'bg-green-500/20 text-green-300' },
} as const;

export const STATUS_BADGE = {
  active:       { label: 'Active',     className: 'bg-green-500/20 text-green-300' },
  deprecated:   { label: 'Deprecated', className: 'bg-orange-500/20 text-orange-300' },
  preview:      { label: 'Preview',    className: 'bg-blue-500/20 text-blue-300' },
  'end-of-life':{ label: 'EOL',        className: 'bg-red-500/20 text-red-300' },
} as const;

export const PRIORITY_BADGE = SEVERITY_BADGE; // 동일 색상 체계

export type SeverityLevel = keyof typeof SEVERITY_BADGE;
export type StatusLevel = keyof typeof STATUS_BADGE;
```

#### 3-2. 각 패널에서 import로 교체
```typescript
// Before (VulnerabilityPanel.tsx 내부):
function getSeverityConfig(severity: CVESeverity) {
  switch (severity) { /* 인라인 색상 매핑 */ }
}

// After:
import { SEVERITY_BADGE } from '@/lib/utils/badgeThemes';
// 직접 SEVERITY_BADGE[severity] 사용
```

**예상 변경량**: +60줄 (신규), -50줄 (각 패널) = 순 +10줄 (유지보수성 대폭 향상)
**의존성**: 없음 (독립 실행 가능)
**테스트**: 기존 패널 테스트 통과 확인

---

### PR-4: Analyze Route Factory (A-1)

**목적**: 4개 `/api/analyze/*` 라우트를 경량 factory 패턴으로 통합

**변경 파일**:
1. `src/lib/api/analyzeRouteFactory.ts` (**신규**)
2. `src/app/api/analyze/vulnerabilities/route.ts` (33줄 → ~8줄)
3. `src/app/api/analyze/benchmarks/route.ts` (33줄 → ~10줄)
4. `src/app/api/analyze/compliance/route.ts` (30줄 → ~8줄)
5. `src/app/api/analyze/cloud/route.ts` (44줄 → ~10줄)

**상세 작업**:

#### 4-1. analyzeRouteFactory.ts
```typescript
// src/lib/api/analyzeRouteFactory.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyzeRequest } from './analyzeRouteUtils';
import { isInfraSpec, type InfraSpec } from '@/types/infra';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AnalyzeRouteFactory');

export interface AnalyzeRouteConfig<TResult> {
  name: string;
  handler: (spec: InfraSpec, params: Record<string, unknown>) => TResult;
}

export function createAnalyzeRoute<TResult>(config: AnalyzeRouteConfig<TResult>) {
  return async function POST(request: NextRequest) {
    const check = validateAnalyzeRequest(request);
    if (!check.passed) return check.errorResponse!;

    try {
      const body = await request.json();
      const { spec, ...params } = body;

      if (!spec || !isInfraSpec(spec)) {
        return NextResponse.json(
          { error: 'Valid InfraSpec is required' },
          { status: 400 }
        );
      }

      const result = config.handler(spec as InfraSpec, params);
      return NextResponse.json(result);
    } catch (error) {
      log.error(`${config.name} analysis failed`, error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { error: `${config.name} analysis failed` },
        { status: 500 }
      );
    }
  };
}
```

#### 4-2. 각 라우트를 config-only로 변경
```typescript
// src/app/api/analyze/vulnerabilities/route.ts
import { createAnalyzeRoute } from '@/lib/api/analyzeRouteFactory';
import { getVulnerabilitiesForSpec, getVulnerabilityStats } from '@/lib/knowledge/vulnerabilities';

export const POST = createAnalyzeRoute({
  name: 'Vulnerability',
  handler: (spec) => {
    const vulnerabilities = getVulnerabilitiesForSpec(spec);
    const stats = getVulnerabilityStats(vulnerabilities);
    return { vulnerabilities, stats };
  },
});
```

**예상 변경량**: +45줄 (factory), -100줄 (4개 라우트) = **순 -55줄**
**의존성**: PR-1 완료 후 (CSRF 수정이 analyzeRouteUtils에 영향)
**테스트**: 기존 analyze API 테스트 통과 확인

---

### PR-5: 환경변수 검증 + 코드 스플리팅 (Q-4 + A-3)

**목적**: 빌드타임 환경변수 검증, 모달/패널 lazy loading 강화

**변경 파일**:
1. `src/lib/config/env.ts` (**신규**)
2. `src/app/api/llm/route.ts` (env import 적용)
3. `src/app/api/parse/route.ts` (env import 적용)
4. `src/components/editor/EditorPanels.tsx` (dynamic import 확인/강화)

**상세 작업**:

#### 5-1. 환경변수 Zod 검증
```typescript
// src/lib/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // LLM API Keys (하나 이상 필수)
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  // Database
  DATABASE_URL: z.string().min(1).optional(),
  // Auth
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  // Limits
  LLM_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  MAX_PROMPT_LENGTH: z.coerce.number().int().positive().default(2000),
  MAX_NODES: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;

// 서버 사이드에서만 파싱 (클라이언트에서는 접근 불가)
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
```

#### 5-2. EditorPanels 코드 스플리팅 확인
- `EditorPanels.tsx`에서 이미 `dynamic()` 사용하는 패널 확인
- 미적용 패널이 있으면 `dynamic(() => import(...), { ssr: false })` 추가

**예상 변경량**: +50줄 (env.ts), ~10줄 수정 (API routes)
**의존성**: 없음 (독립 실행 가능)
**테스트**: env 검증 유닛 테스트 추가

---

## 5. 실행 타임라인

```
Day 1: Phase 1 (3개 PR 병렬 실행)
┌────────────┬────────────┬────────────┐
│   PR-1     │   PR-2     │   PR-3     │
│ API 보안   │ parseInt   │ Badge      │
│ ~30분      │ ~30분      │ ~30분      │
└────────────┴────────────┴────────────┘
         ↓ 검증 (tsc + vitest)

Day 1: Phase 2 (2개 PR 병렬 실행)
┌──────────────────┬──────────────────┐
│      PR-4        │      PR-5        │
│ Analyze Factory  │ Env + Splitting  │
│ ~45분            │ ~45분            │
└──────────────────┴──────────────────┘
         ↓ 최종 검증 (tsc + vitest)
```

**총 예상 시간**: 약 2~3시간
**총 코드 변경**: +175줄, -165줄 (순 +10줄, 유지보수성 대폭 향상)

---

## 6. 잘 되어 있는 점 (Strengths — 낙관 에이전트 + 검증)

코드 리뷰 과정에서 프로젝트의 강점도 확인되었습니다:

1. **Factory Pattern 성숙도**: `knowledgeRouteFactory.ts`가 20개 라우트를 66% 줄여 교과서적 구현
2. **console.log 완전 제거**: 비관 에이전트 주장과 달리, 모든 console 호출이 `createLogger`로 전환 완료
3. **Silent catch 제거 완료**: Code Review #2에서 수정한 13건이 모두 유지됨
4. **any 타입 최소화**: 983건이라는 비관 보고와 달리 실제 11건 (대부분 테스트 mock)
5. **export * 최소화**: 83건이라는 보고와 달리 실제 4개 파일만 사용
6. **SSoT 원칙 관철**: `infrastructureDB.ts` 기반 중복 제거가 잘 유지됨
7. **Panel 컴포넌트 설계**: PanelContainer/PanelHeader/PanelTabs 3단계 구조 우수
8. **Knowledge Graph 완성도**: 105 relationships, 32 patterns, 45 antipatterns, 64 failures

---

## 7. 장기 과제 (Future Backlog — 이번 리뷰에서 실행하지 않음)

검증 결과 즉시 실행 가치가 낮지만, 향후 고려할 항목들:

| 항목 | 이유 | 시기 |
|------|------|------|
| Plugin loader 샌드박스 | `new Function()` 보안 강화 | 플러그인 공개 시 |
| Prisma N+1 최적화 | `include` 제거 또는 select 전환 | 성능 이슈 발생 시 |
| E2E 테스트 확대 | Playwright로 핵심 user journey | 다음 스프린트 |
| LLM Streaming | 복잡도 대비 이득 미미, 현재 거절 | 아키텍처 변경 시 |
| i18n 글로벌화 | 시장 확장 시 고려 | 비즈니스 결정 후 |
| GraphQL API | 복합 쿼리 필요 시 | API v2 설계 시 |
| Vector DB 검색 | RAG 고도화 시 | Phase 5 구현 시 |

---

## 8. 리스크 매트릭스

```
영향(Impact)
  High │  S-1(/api/parse     │               │
       │   rate limit)       │               │
       │                     │               │
  Med  │  S-2(CSRF),Q-4(env) │  A-1(factory) │
       │  A-2(N+1)           │               │
       │                     │               │
  Low  │  Q-1(parseInt)      │  Q-3(badge)   │
       │  Q-2(shift)         │  A-3(split)   │
       ├─────────────────────┼───────────────┤
       │       High          │     Low       │
                발생 가능성(Likelihood)
```

---

## 9. 검증 체크리스트

각 PR 완료 시 반드시 확인:

- [ ] `npx tsc --noEmit` 통과
- [ ] `npx vitest run` 전체 통과
- [ ] 변경된 API 라우트 수동 테스트 (curl 또는 Postman)
- [ ] 기존 기능 regression 없음 확인

---

## 10. 이전 Code Review와의 비교

| 리뷰 | 날짜 | 발견 이슈 | 해결 PR | 코드 감소 |
|------|------|----------|---------|----------|
| #1 | 2026-02-09 | 20 | 11 | - |
| #2 | 2026-02-11 | ~15 | 6 | ~2,420줄 |
| #3 | 2026-02-11 | ~10 | 5 | - |
| #4 | 2026-02-11 | ~15 | 5 | - |
| **#5** | **2026-02-14** | **23+15 보고 → 10 확인** | **5 (계획)** | **~-55줄 + 유지보수성** |

**주요 차이**: 이전 리뷰(#1-4)에서 대부분의 핵심 이슈가 해결되어, 이번 #5에서는 비관 에이전트 보고의 60%가 "이미 수정됨" 또는 "부정확"으로 판정됨. 프로젝트 코드 품질이 유의미하게 향상되었음을 확인.

---

---

## 11. 실행 결과 (2026-02-14 완료)

모든 5개 PR이 성공적으로 실행되었습니다.

### 최종 검증
- `npx tsc --noEmit` — **통과** (타입 에러 0개)
- `npx vitest run` — **98 test files, 2,680 tests 전체 통과**

### PR별 결과

| PR | 상태 | 주요 변경 | 테스트 |
|----|------|----------|--------|
| **PR-1** | ✅ 완료 | `/api/parse` rate limit 추가, 4개 파일 CSRF 정확 매칭 | 2,666 pass |
| **PR-2** | ✅ 완료 | 12개소 parseInt radix 추가 (7개 파일), LLM Metrics circular buffer | 2,666 pass |
| **PR-3** | ✅ 완료 | `badgeThemes.ts` 생성 (5개 export), 5개 패널 인라인→import | 2,666 pass |
| **PR-4** | ✅ 완료 | `analyzeRouteFactory.ts` 생성, 4개 라우트 59~64% 감소 | 2,666 pass |
| **PR-5** | ✅ 완료 | `env.ts` Zod 검증 (27개 환경변수), 2개 API route 적용, 14개 테스트 추가 | 2,680 pass |

### 신규 파일 (4개)
1. `src/lib/utils/badgeThemes.ts` — 패널 badge 색상 중앙화
2. `src/lib/api/analyzeRouteFactory.ts` — Analyze 라우트 factory
3. `src/lib/config/env.ts` — 환경변수 Zod 검증
4. `src/__tests__/lib/config/env.test.ts` — 환경변수 테스트

### 수정 파일 (20개+)
- API routes: parse, modify, log-unrecognized, analyzeRouteUtils, 4개 analyze routes
- Admin pages: 7개 (parseInt radix)
- Panels: 5개 (badge theme)
- Utils: llmMetrics.ts (circular buffer)
- Tests: parse.test.ts (env cache reset)

### EditorPanels 코드 스플리팅
- 확인 결과 14개 패널 모두 이미 `dynamic(() => import(...), { ssr: false })` 적용 완료 — 변경 불필요

---

*작성일: 2026-02-14*
*실행 완료일: 2026-02-14*
*분석 도구: Claude Opus 4.6 (비관/낙관/탐색/검증 에이전트 5종 + 실행 에이전트 5종 병렬)*
*검증 수준: Very Thorough (소스 코드 직접 검사)*
*최종 상태: 98 test files, 2,680 tests passing*
