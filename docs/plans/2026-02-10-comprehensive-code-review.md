# InfraFlow 종합 코드 리뷰 및 개선 계획

> **날짜**: 2026-02-10
> **분석 방법**: 비관/낙관 에이전트 병렬 분석 → 피드백 통합 → PR 계획 수립
> **코드베이스 규모**: 419 소스 파일, ~143K LOC, 93 테스트 파일, 2,615 테스트

---

## 1. 프로젝트 현황 요약

### 코드 분포 분석

```
┌─────────────────────────────────────────────────────────────┐
│                    코드 분포 (LOC)                           │
├──────────────────────────┬──────┬───────────────────────────┤
│ 지식 관리 (Admin + API)  │31K   │ ████████████████████ 47%  │
│ 지식 데이터 모듈         │12K   │ ████████ 18%              │
│ 파서/LLM 파이프라인      │ 5K   │ ███ 8%                    │
│ 에디터/UI 컴포넌트       │ 6K   │ ████ 9%                   │
│ 훅/상태 관리             │ 3K   │ ██ 5%                     │
│ 보안/감사                │ 2K   │ █ 3%                      │
│ 플러그인 시스템          │ 2K   │ █ 3%                      │
│ 학습/피드백              │ 2K   │ █ 3%                      │
│ 기타 유틸리티            │ 3K   │ ██ 4%                     │
└──────────────────────────┴──────┴───────────────────────────┘

핵심 문제: 핵심 제품(인프라 시각화) 코드 ~15K LOC vs
          관리 인프라(Admin/Knowledge) ~43K LOC
          → "꼬리가 몸통을 흔들고 있다"
```

### 테스트 현황
- 93 테스트 파일, 2,615 테스트 (92 파일 통과, 1 파일 실패)
- 실패: `ComponentForm.test.tsx:351` — 비동기 타이밍 이슈
- E2E 테스트: Playwright 설치되어 있으나 실행 가능한 E2E 테스트 **0개**
- 데드 코드에 대한 테스트: ~200+ 테스트가 프로덕션에서 사용되지 않는 모듈을 테스트

---

## 2. 비관 에이전트 분석 결과

### 발견된 이슈: 34개

| 심각도 | 수량 | 주요 내용 |
|--------|------|-----------|
| Critical | 2 | SSoT 3중 중복, 보안 컨트롤 미연결 |
| High | 12 | 데드 코드 모듈, 지식 번들 과부하, E2E 부재, Admin 보일러플레이트 |
| Medium | 14 | 에러 시스템 미사용, 사일런트 catch, MEMORY 정보 불일치 |
| Low | 6 | dotenv 불필요, SWR 과잉, 중복 re-export |

### Critical 이슈 상세

#### C-1: SSoT(Single Source of Truth) 3중 중복
노드 타입 → 카테고리 매핑이 3곳에 별도로 유지됨:

| # | 파일 | 역할 |
|---|------|------|
| 1 | `src/lib/data/infrastructureDB.ts` | SSoT (선언된 진짜 소스) |
| 2 | `src/lib/design/tokens.ts:100-174` | 중복: `nodeCategories` 객체 |
| 3 | `src/components/nodes/nodeConfig.ts:35-180` | 중복: `defaultNodeConfigs` |

새 노드 타입 추가 시 3곳을 모두 수동 업데이트해야 하며, 하나라도 누락되면 노드가 잘못된 색상/스타일로 렌더링됨.

#### C-2: 보안 컨트롤 미연결
`src/lib/security/llmSecurityControls.ts` (652줄, 66개 테스트)가 존재하지만 **어떤 API 라우트나 훅에서도 import하지 않음**. 보안 통제가 있는 것처럼 보이지만 실제로는 전혀 동작하지 않는 상태.

### High 이슈 상세

#### H-1: 데드 코드 모듈 (~2,500줄)

| 파일 | 줄수 | 상태 |
|------|------|------|
| `llmSecurityControls.ts` | 652 | 프로덕션 import 0 |
| `changeRiskAssessor.ts` | 396 | 프로덕션 import 0 |
| `templateRecommender.ts` | 242 | 프로덕션 import 0 |
| `retry.ts` | 174 | 프로덕션 import 0 |
| `llmMetrics.ts` | ~150 | 프로덕션 import 0 |
| `stateClone.ts` | 45 | 프로덕션 import 0 |
| `errors/` (전체 디렉토리) | ~268 | `useErrorHandler`만 import, 그마저도 미사용 |

→ 이 중 **활성화할 것**과 **삭제할 것**을 구분해야 함.

#### H-2: Knowledge Data Source 추상화 계층 (데드 아키텍처)

| 파일 | 줄수 |
|------|------|
| `dataSource.ts` | ~80 |
| `prismaDataSource.ts` | ~200 |
| `staticDataSource.ts` | ~150 |
| `getKnowledgeSource.ts` | ~40 |
| `detectionRegistry.ts` | ~40 |

`KnowledgeDataSource` 인터페이스와 구현체들이 **자체 모듈과 테스트 외에는 아무 곳에서도 사용되지 않음**. 모든 곳에서 정적 배열을 직접 import하고 있음.

#### H-3: Admin Knowledge 보일러플레이트 (14,767줄)
51개 Admin 페이지가 ~80% 구조적 유사성을 가지며, 각 Knowledge 엔티티(patterns, antipatterns, failures 등)마다 List/Detail/Edit/New 페이지를 독립적으로 구현. 공통 패턴 변경 시 모든 페이지를 개별 수정해야 함.

#### H-4: 플러그인 시스템 과잉 (~2,200줄)
`registry.ts`(587줄), `validator.ts`(512줄), `loader.ts`(382줄), `themeManager.ts`(363줄) — 실제 사용되는 플러그인은 `corePlugin` 단 1개.

#### H-5: Knowledge 데이터 클라이언트 번들 포함
~12K줄의 정적 Knowledge 데이터가 클라이언트 사이드 hooks를 통해 JS 번들에 포함됨. `useVulnerabilities`, `useBenchmark`, `useCloudCatalog` 등이 직접 import.

#### H-6: E2E 테스트 부재
핵심 사용자 플로우(프롬프트 입력 → 다이어그램 생성)에 대한 E2E 테스트 0개.

### Medium 이슈 상세

| ID | 이슈 | 파일 |
|----|------|------|
| M-1 | `src/lib/errors/` 전체 미사용 | errors/*.ts, useErrorHandler.ts |
| M-2 | MEMORY.md Phase 5 모듈 존재 주장 vs 실제 미존재 | MEMORY.md |
| M-3 | Silent catch 10곳 (에러 무시) | contextEnricher, antipatterns, responseValidator 등 |
| M-4 | `console.log` 9개 파일에 존재 | kubernetesExport, terraformExport 등 |
| M-5 | 타입 가드 불완전 (텔레콤/SASE 누락) | types/guards.ts |
| M-6 | 심각도 정렬 로직 5곳 중복 | contextEnricher, vulnerabilities, securityAudit 등 |
| M-7 | Header 컴포넌트에 인라인 SVG 7개 (lucide-react 존재) | Header.tsx |
| M-8 | Data barrel re-export 중복 | data/index.ts |

---

## 3. 낙관 에이전트 분석 결과

### 프로젝트 강점 (Top 10)

| # | 강점 | 상세 |
|---|------|------|
| S-1 | 합성 가능한 Hook 아키텍처 | `useInfraState`가 5+ 특화 훅을 합성, 독립 테스트 가능 |
| S-2 | SSoT 인프라 DB | `infrastructureDB` + 헬퍼 함수 (getCategoryForType 등) |
| S-3 | Knowledge Graph 시스템 | 105+ 관계, 32 패턴, 45 안티패턴, 신뢰 점수 시스템 |
| S-4 | 완전한 한/영 이중 언어 | 모든 데이터에 Ko/En 쌍 |
| S-5 | 플러그인 아키텍처 | 노드/파서/내보내기/패널/테마 확장 가능 |
| S-6 | 동적 import 패턴 | InfraEditor의 15+ 패널이 `next/dynamic` 사용 |
| S-7 | 타입 안전성 | `@ts-ignore` 0개, `any` 최소 사용 |
| S-8 | 경쟁 조건 방지 | requestId + AbortController 이중 보호 |
| S-9 | Prisma 스키마 완성도 | 592줄, 인덱스/캐스케이드/소프트 삭제 |
| S-10 | 보안 자세 | OWASP 매핑, XML 구분자, Rate Limiter, CSRF |

### Quick Wins (즉시 적용 가능)

| # | 항목 | 노력 | 영향 |
|---|------|------|------|
| QW-1 | 실패 테스트 수정 (ComponentForm.test.tsx:351) | Small | High |
| QW-2 | `useHistory` → InfraEditor 연결 | Small | High |
| QW-3 | `retry.ts` → LLM API 연결 | Small | High |
| QW-4 | 타입 가드 텔레콤/SASE 타입 추가 | Small | Medium |
| QW-5 | `templateRecommender` → PromptPanel 연결 | Small | Medium |

### 확장 기회

| # | 기회 | 노력 | 영향 |
|---|------|------|------|
| EO-1 | Knowledge Graph 기반 아키텍처 점수/리뷰 | Medium | Very High |
| EO-2 | 학습 시스템 활성화 (이미 구축됨) | Small-Med | High |
| EO-3 | Export 형식 확장 (Mermaid, Draw.io) | Medium | Medium |

---

## 4. 피드백 통합 분석 (Feedback Analyzer)

### 비관/낙관 교차 분석

```
┌─────────────────────────────────────────────────────────────────┐
│                     비관/낙관 교차점                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  양쪽 모두 동의하는 문제:                                        │
│  ├─ SSoT 3중 중복 → 즉시 해결 필요 (비관 Critical, 낙관 QW-4)   │
│  ├─ 데드 코드 모듈 → 연결하거나 삭제 (양쪽 High/P1)             │
│  ├─ E2E 테스트 부재 → 핵심 가치 검증 미비 (양쪽 High/P1)        │
│  └─ Knowledge 번들 → 서버 사이드로 이동 (양쪽 Medium)            │
│                                                                 │
│  비관만 지적한 문제:                                             │
│  ├─ Admin 보일러플레이트 14K줄 → 제네릭화 필요                   │
│  ├─ 플러그인 시스템 과잉 → 단순화 또는 유지                      │
│  ├─ 학습 시스템 복잡성 → 낙관은 "활성화하라"고 권장              │
│  └─ 인증 시스템 조기 → 낙관은 "확장 기반"으로 평가               │
│                                                                 │
│  낙관만 지적한 기회:                                             │
│  ├─ AI 아키텍처 리뷰 패널 → contextEnricher 활용                │
│  ├─ 협업 편집 (WebSocket) → 장기 목표                           │
│  └─ Storybook 도입 → DX 개선                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 우선순위 분류

| 우선순위 | 카테고리 | 항목 수 |
|----------|----------|---------|
| P0 (즉시) | 보안/정합성 위험 | 3개 |
| P1 (이번 주) | 데드 코드 정리 + 핵심 연결 | 6개 |
| P2 (1-2주) | 성능/구조 개선 | 5개 |
| P3 (2-4주) | 기능 확장 + DX | 4개 |

---

## 5. PR 계획 (병렬 처리 가능)

### 병렬 처리 다이어그램

```
시간 ──────────────────────────────────────────────────────────────▶

Phase 1: P0 즉시 수정 (1일)
┌─────────────────────────────────────────────────────────────────┐
│  Stream A                    Stream B                           │
│  ┌─────────────┐             ┌─────────────┐                   │
│  │ PR-1        │             │ PR-2        │                   │
│  │ SSoT 통합   │             │ 보안 연결   │                   │
│  └─────────────┘             └─────────────┘                   │
│         병렬 실행 가능                                           │
└─────────────────────────────────────────────────────────────────┘

Phase 2: P1 데드 코드 정리 + 기능 연결 (2-3일)
┌─────────────────────────────────────────────────────────────────┐
│  Stream A                    Stream B            Stream C       │
│  ┌─────────────┐             ┌─────────────┐     ┌───────────┐ │
│  │ PR-3        │             │ PR-4        │     │ PR-5      │ │
│  │ 데드 코드   │             │ 기능 연결   │     │ 테스트    │ │
│  │ 삭제        │             │ (retry,     │     │ 수정 +    │ │
│  │             │             │  history,   │     │ 타입가드  │ │
│  │             │             │  template)  │     │           │ │
│  └─────────────┘             └─────────────┘     └───────────┘ │
│         3개 모두 병렬 실행 가능                                   │
└─────────────────────────────────────────────────────────────────┘

Phase 3: P2 구조 개선 (3-5일)
┌─────────────────────────────────────────────────────────────────┐
│  Stream A                    Stream B                           │
│  ┌─────────────┐             ┌─────────────┐                   │
│  │ PR-6        │             │ PR-7        │                   │
│  │ Knowledge   │             │ Admin 제네릭│                   │
│  │ 서버 이동   │             │ 컴포넌트    │                   │
│  └─────────────┘             └─────────────┘                   │
│         병렬 실행 가능                                           │
│                                                                 │
│  Stream C (Phase 2 완료 후)                                     │
│  ┌─────────────┐                                               │
│  │ PR-8        │                                               │
│  │ 코드 품질   │                                               │
│  │ (catch, log,│                                               │
│  │  severity)  │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘

Phase 4: P3 기능 확장 (5-7일)
┌─────────────────────────────────────────────────────────────────┐
│  Stream A                    Stream B                           │
│  ┌─────────────┐             ┌─────────────┐                   │
│  │ PR-9        │             │ PR-10       │                   │
│  │ E2E 테스트  │             │ MEMORY.md   │                   │
│  │             │             │ 정리        │                   │
│  └─────────────┘             └─────────────┘                   │
│         병렬 실행 가능                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### PR-1: SSoT 3중 중복 해소 [P0, Critical]

**브랜치**: `fix/ssot-category-dedup`
**예상 작업 시간**: 2-3시간
**병렬 가능**: PR-2와 동시 진행 가능

**문제**:
- `tokens.ts`의 `nodeCategories` 객체가 `infrastructureDB`와 독립적으로 카테고리 매핑 유지
- `nodeConfig.ts`의 `defaultNodeConfigs`가 또 다른 독립 카테고리 매핑 유지
- 새 노드 타입 추가 시 3곳 모두 수동 업데이트 필요

**변경 대상 파일**:
1. `src/lib/design/tokens.ts`
   - `nodeCategories` 객체를 `infrastructureDB`에서 동적 파생하도록 변경
   - `getCategoryForNode()` → `infrastructureDB`의 `getCategoryForType()` 위임
2. `src/components/nodes/nodeConfig.ts`
   - `defaultNodeConfigs`의 category 필드를 `getCategoryForType()`에서 파생
   - 하드코딩된 카테고리 매핑 제거

**검증**:
- [ ] `npx tsc --noEmit` 통과
- [ ] `npx vitest run` 전체 통과
- [ ] 노드 렌더링 색상 변경 없음 확인

---

### PR-2: 보안 컨트롤 LLM 파이프라인 연결 [P0, Critical]

**브랜치**: `feat/wire-security-controls`
**예상 작업 시간**: 3-4시간
**병렬 가능**: PR-1과 동시 진행 가능

**문제**:
- `llmSecurityControls.ts` (652줄, 66개 테스트)가 프로덕션에서 전혀 사용되지 않음
- OWASP LLM Top 10 컨트롤이 있지만 실제 LLM API 호출에 적용 안됨

**변경 대상 파일**:
1. `src/app/api/modify/route.ts` — 요청 전 prompt sanitization 추가
2. `src/hooks/usePromptParser.ts` 또는 `src/hooks/useLLMModifier.ts` — 응답 validation 추가
3. `src/lib/security/llmSecurityControls.ts` — 필요시 API 통합용 헬퍼 추가

**핵심 연결 포인트**:
```typescript
// route.ts에서
import { sanitizePrompt, validateLLMResponse } from '@/lib/security/llmSecurityControls';

// 요청 처리 시
const sanitized = sanitizePrompt(userPrompt);
// LLM 호출 후
const validated = validateLLMResponse(response);
```

**검증**:
- [ ] Prompt injection 테스트 시나리오 통과
- [ ] 기존 LLM 파이프라인 동작 변경 없음
- [ ] `npx vitest run` 전체 통과

---

### PR-3: 데드 코드 삭제 [P1, High]

**브랜치**: `chore/remove-dead-code`
**예상 작업 시간**: 2-3시간
**병렬 가능**: PR-4, PR-5와 동시 진행 가능

**삭제 대상** (프로덕션 import 0, 삭제 안전):

| 파일 | 줄수 | 이유 |
|------|------|------|
| `src/lib/utils/stateClone.ts` | 45 | import 0 |
| `src/lib/errors/AppError.ts` | 58 | import: useErrorHandler만 (미사용) |
| `src/lib/errors/NetworkError.ts` | ~50 | 상동 |
| `src/lib/errors/ParseError.ts` | ~50 | 상동 |
| `src/lib/errors/RateLimitError.ts` | ~30 | 상동 |
| `src/lib/errors/ValidationError.ts` | ~80 | 상동 |
| `src/lib/errors/index.ts` | ~10 | 상동 |
| `src/hooks/useErrorHandler.ts` | ~80 | 어디서도 사용하지 않음 |
| `src/lib/knowledge/dataSource.ts` | ~80 | 자체 모듈 외 import 0 |
| `src/lib/knowledge/prismaDataSource.ts` | ~200 | 상동 |
| `src/lib/knowledge/staticDataSource.ts` | ~150 | 상동 |
| `src/lib/knowledge/getKnowledgeSource.ts` | ~40 | 상동 |
| `src/lib/knowledge/detectionRegistry.ts` | ~40 | 상동 |
| `src/components/panels/PluginPanelRenderer.tsx` | ~60 | import 0 |
| 관련 테스트 파일들 | ~500 | 위 모듈의 테스트 |

**총 삭제**: ~1,500줄 프로덕션 코드 + ~500줄 테스트

**주의 사항**:
- `retry.ts`, `llmMetrics.ts`, `changeRiskAssessor.ts`, `templateRecommender.ts`는 **PR-4에서 연결**하므로 삭제하지 않음
- `llmSecurityControls.ts`는 **PR-2에서 연결**하므로 삭제하지 않음

**검증**:
- [ ] `npx tsc --noEmit` 통과
- [ ] `npx vitest run` 전체 통과
- [ ] 삭제된 모듈의 import가 다른 곳에 없음을 grep으로 확인

---

### PR-4: 미연결 모듈 활성화 [P1, High]

**브랜치**: `feat/wire-unused-modules`
**예상 작업 시간**: 4-5시간
**병렬 가능**: PR-3, PR-5와 동시 진행 가능

**연결 대상**:

#### 4-1: `retry.ts` → LLM API 호출
- `src/hooks/useLLMModifier.ts` 또는 `src/app/api/modify/route.ts`에서 `withRetry` 래핑
- LLM API 호출에 지수 백오프 + 재시도 적용

#### 4-2: `useHistory` → InfraEditor
- `src/components/editor/InfraEditor.tsx`에 Undo/Redo 버튼 추가
- Ctrl+Z/Ctrl+Y 키보드 단축키 연결
- `useHistory` 훅이 이미 구현되어 있으므로 연결만 필요

#### 4-3: `templateRecommender` → PromptPanel
- 사용자 입력 시 실시간 템플릿 추천 표시
- "이 템플릿을 의미하셨나요?" 제안 UI

#### 4-4: `llmMetrics.ts` → LLM 호출 추적
- API route에서 호출 시간, 토큰 수, 성공/실패 기록
- 개발자 도구 또는 Admin 패널에서 조회 가능

**검증**:
- [ ] retry가 실제 LLM 실패 시 재시도하는지 확인
- [ ] Undo/Redo가 노드 추가/삭제/이동에 작동
- [ ] 템플릿 추천이 관련 키워드 입력 시 표시
- [ ] `npx vitest run` 전체 통과

---

### PR-5: 테스트 수정 + 타입 가드 완성 [P1, Medium]

**브랜치**: `fix/tests-and-guards`
**예상 작업 시간**: 2-3시간
**병렬 가능**: PR-3, PR-4와 동시 진행 가능

#### 5-1: 실패 테스트 수정
- `src/__tests__/components/admin/ComponentForm.test.tsx:351`
- 비동기 타이밍 이슈 — `waitFor` 또는 `findByRole`로 수정

#### 5-2: 타입 가드 완성
- `src/types/guards.ts`의 `validNodeTypes`에 누락된 타입 추가:
  - 텔레콤: `central-office`, `base-station`, `olt`, `customer-premise`, `idc`, `pe-router`, `p-router`, `mpls-network`, `dedicated-line`, `metro-ethernet`, `corporate-internet`, `vpn-service`, `sd-wan-service`, `private-5g`, `core-network`, `upf`, `ring-network` (17개)
  - SASE: `sase-gateway`, `ztna-broker`, `casb`, `siem`, `soar` (5개)
- `isValidCategory`에 `telecom`, `wan` 추가
- `isValidFlowType`에 `wan-link`, `wireless`, `tunnel` 추가
- 가능하면 `InfraNodeType` 유니온이나 `infrastructureDB` 키에서 동적 파생

#### 5-3: Header SVG → lucide-react 교체
- `src/components/layout/Header.tsx`의 인라인 SVG 7개를 `lucide-react` 아이콘으로 교체
- PlayIcon → `Play`, LayoutIcon → `Layout`, DownloadIcon → `Download` 등

**검증**:
- [ ] `npx vitest run` 93/93 통과 (0 실패)
- [ ] `npx tsc --noEmit` 통과
- [ ] 텔레콤/SASE 노드 타입에 `isValidNodeType()` true 반환

---

### PR-6: Knowledge 데이터 서버 사이드 이동 [P2, High]

**브랜치**: `perf/knowledge-server-side`
**예상 작업 시간**: 5-6시간
**병렬 가능**: PR-7과 동시 진행 가능
**의존성**: Phase 2 완료 후

**문제**: ~12K줄의 정적 Knowledge 데이터가 클라이언트 번들에 포함됨

**변경 전략**:
1. Knowledge 데이터 모듈에 `'use server'` 또는 API 엔드포인트 래퍼 추가
2. 클라이언트 hooks (`useVulnerabilities`, `useBenchmark`, `useCloudCatalog` 등)를 `fetch` 기반으로 변경
3. 또는 `next/dynamic`으로 패널 import 시점에서 데이터 로드

**변경 대상 파일**:
- `src/hooks/useVulnerabilities.ts` → API fetch 기반
- `src/hooks/useBenchmark.ts` → API fetch 기반
- `src/hooks/useCloudCatalog.ts` → API fetch 기반
- `src/hooks/useIndustryCompliance.ts` → API fetch 기반
- 관련 API 라우트 추가 (이미 존재하는 것 활용)

**예상 효과**: 클라이언트 번들 ~50-100KB 감소

**검증**:
- [ ] 번들 분석기로 Knowledge 데이터 클라이언트 제외 확인
- [ ] 패널 열 때 데이터 정상 로드
- [ ] 로딩 상태 UI 표시
- [ ] `npx vitest run` 전체 통과

---

### PR-7: Admin Knowledge 제네릭 컴포넌트 [P2, High]

**브랜치**: `refactor/admin-generic-components`
**예상 작업 시간**: 6-8시간
**병렬 가능**: PR-6과 동시 진행 가능
**의존성**: Phase 2 완료 후

**문제**: 51개 Admin 페이지, 14,767줄, ~80% 구조 중복

**변경 전략**:
```typescript
// 제네릭 리스트 페이지
interface KnowledgeListConfig<T> {
  entityName: string;
  entityNameKo: string;
  apiPath: string;
  columns: ColumnDef<T>[];
  searchFields: string[];
  filterOptions?: FilterOption[];
}

function KnowledgeListPage<T>({ config }: { config: KnowledgeListConfig<T> }) {
  // 공통 fetch, pagination, filter, table 로직
}
```

**예상 효과**: 14,767줄 → ~4,000줄 (70% 감소)

**변경 대상**:
1. `src/components/admin/KnowledgeListPage.tsx` (새 제네릭 컴포넌트)
2. `src/components/admin/KnowledgeDetailPage.tsx` (새 제네릭 컴포넌트)
3. `src/components/admin/KnowledgeEditPage.tsx` (새 제네릭 컴포넌트)
4. 각 엔티티 페이지를 config 객체 + 제네릭 컴포넌트 조합으로 교체
5. API 라우트도 제네릭 CRUD 핸들러로 통합 가능

**검증**:
- [ ] 모든 Admin 기능 (CRUD) 정상 동작
- [ ] 전체 줄수 50% 이상 감소
- [ ] `npx vitest run` 전체 통과

---

### PR-8: 코드 품질 개선 (Catch, Console, 중복) [P2, Medium]

**브랜치**: `chore/code-quality-cleanup`
**예상 작업 시간**: 3-4시간
**병렬 가능**: Phase 2 이후 단독 진행
**의존성**: PR-3 완료 후 (데드 코드 삭제 후 수정 범위 축소)

#### 8-1: Silent catch → 로거 추가
10곳의 `catch { return false/null }` 패턴에 `logger.warn()` 추가:
- `contextEnricher.ts:355`
- `antipatterns.ts:1440`
- `responseValidator.ts:171,181`
- `jsonParser.ts:28`
- `intelligentParser.ts:154`
- `usageStore.ts:205`
- `feedbackStore.ts:303`
- `calibrationStore.ts:217`
- `changeRiskAssessor.ts:250`

#### 8-2: console.log → createLogger 교체
9개 파일의 `console.log`를 `createLogger` 유틸리티로 교체:
- `kubernetesExport.ts`, `terraformExport.ts`, `intelligentParser.ts`
- `complianceChecker.ts`, `securityAudit.ts`
- `retry.ts`, `core-plugin.ts`, `plugins/index.ts`, `api/parse/route.ts`

#### 8-3: 심각도 정렬 상수 통합
```typescript
// src/lib/utils/severity.ts (신규)
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4
};
export function compareBySeverity(a: string, b: string): number { ... }
```
5곳의 중복 제거하고 이 유틸리티 import.

#### 8-4: barrel re-export 중복 제거
`src/lib/data/index.ts`의 중복 export 정리.

**검증**:
- [ ] `npx vitest run` 전체 통과
- [ ] `console.log` grep 결과 0 (테스트 제외)

---

### PR-9: E2E 테스트 핵심 플로우 [P3, High]

**브랜치**: `test/e2e-core-flows`
**예상 작업 시간**: 6-8시간
**병렬 가능**: PR-10과 동시 진행 가능
**의존성**: Phase 3 완료 후

**테스트 시나리오**:

1. **다이어그램 생성 플로우**
   - 프롬프트 입력 → "3티어 웹 아키텍처" → 다이어그램 렌더링 확인
   - 노드 개수, 엣지 개수, 카테고리 검증

2. **다이어그램 편집 플로우**
   - 노드 드래그 → 위치 변경
   - 노드 삭제 → 확인
   - 프롬프트로 수정 → "WAF 추가해줘"

3. **내보내기 플로우**
   - PNG 다운로드
   - PlantUML 내보내기

4. **패널 상호작용**
   - HealthCheck 패널 열기
   - 템플릿 갤러리 열기

**변경 대상 파일**:
- `e2e/diagram.spec.ts` (기존 파일 확장)
- `e2e/export.spec.ts` (기존 파일 확장)
- `e2e/panels.spec.ts` (신규)
- `playwright.config.ts` (필요시 설정 조정)

**검증**:
- [ ] `npx playwright test` 전체 통과
- [ ] CI 파이프라인에서 실행 가능

---

### PR-10: MEMORY.md 정리 + 문서 정합성 [P3, Low]

**브랜치**: `docs/memory-cleanup`
**예상 작업 시간**: 1-2시간
**병렬 가능**: PR-9와 동시 진행 가능

**문제**: MEMORY.md가 존재하지 않는 Phase 5 모듈(RAG Search, Trust Scorer, Conflict Detector, User Contributions, Graph Visualizer, Organization Config, Source Validator)을 존재하는 것처럼 기술.

**변경 대상**:
1. `.claude/projects/-Users-hyunkikim-dev-infraflow/memory/MEMORY.md`
   - Phase 5 모듈 상태를 "구현됨" → "미구현 (계획)"으로 수정
   - 실제 파일 목록 기반으로 정확한 상태 반영
   - 이 코드 리뷰 결과 반영

2. `docs/INFRASTRUCTURE_KNOWLEDGE_DB_GUIDE.md`
   - 실제 모듈 상태와 일치하도록 업데이트
   - 데드 코드 삭제 결과 반영

**검증**:
- [ ] MEMORY.md 기술 내용이 실제 파일 시스템과 일치
- [ ] 가이드 문서의 모듈 상태가 정확

---

## 6. 의존성 매트릭스

```
PR-1 (SSoT 통합)          ──── 독립 ────── PR-2 (보안 연결)
       │                                          │
       ▼                                          ▼
PR-3 (데드 코드 삭제) ── 독립 ── PR-4 (기능 연결) ── 독립 ── PR-5 (테스트+가드)
       │                         │
       ▼                         ▼
PR-8 (코드 품질)        PR-6 (Knowledge 서버) ── 독립 ── PR-7 (Admin 제네릭)
                                                          │
                                                          ▼
                         PR-9 (E2E 테스트) ── 독립 ── PR-10 (문서 정리)
```

| PR | 의존하는 PR | 블록하는 PR |
|----|------------|------------|
| PR-1 | 없음 | 없음 |
| PR-2 | 없음 | 없음 |
| PR-3 | 없음 | PR-8 |
| PR-4 | 없음 | 없음 |
| PR-5 | 없음 | 없음 |
| PR-6 | PR-3 (데드 코드 먼저 제거) | 없음 |
| PR-7 | 없음 | 없음 |
| PR-8 | PR-3 | 없음 |
| PR-9 | Phase 3 전체 | 없음 |
| PR-10 | PR-3 (삭제 결과 반영) | 없음 |

---

## 7. 예상 결과

### 정량적 개선

| 지표 | 현재 | 목표 | 변화 |
|------|------|------|------|
| 프로덕션 코드 LOC | ~112K | ~95K | -15% |
| Admin 보일러플레이트 | 14.7K | ~4K | -73% |
| 데드 코드 | ~2.5K | 0 | -100% |
| SSoT 중복 매핑 | 3곳 | 1곳 | -67% |
| 보안 컨트롤 활성 | 0% | 100% | +100% |
| 테스트 통과율 | 99.96% | 100% | +0.04% |
| E2E 테스트 | 0개 | 4+ 시나리오 | 신규 |
| 타입 가드 커버리지 | 31/53 타입 | 53/53 | +71% |
| Client 번들 | 기준 | -50~100KB | 감소 |

### 정성적 개선

- **보안**: LLM 보안 컨트롤이 실제 파이프라인에 적용
- **유지보수성**: SSoT 원칙 준수, 새 노드 타입 추가 시 1곳만 수정
- **개발자 경험**: MEMORY.md가 실제 상태 반영, 데드 코드 혼란 제거
- **신뢰성**: retry 패턴 적용, E2E 테스트로 핵심 플로우 검증
- **사용자 경험**: Undo/Redo, 템플릿 추천, 메트릭 추적

---

## 8. 실행 체크리스트

### Phase 1 시작 전
- [ ] 현재 `main` 브랜치에서 `npx vitest run` 실행하여 기준선 확인
- [ ] `npx tsc --noEmit` 클린 빌드 확인

### 각 PR 완료 시
- [ ] `npx tsc --noEmit` 통과
- [ ] `npx vitest run` 전체 통과 (실패 수 기준선 이하)
- [ ] 변경된 파일에 대한 `import` 참조 확인 (삭제 시)
- [ ] 코드 리뷰 (상호 검증)

### 전체 완료 시
- [ ] 모든 PR 머지 후 통합 테스트
- [ ] MEMORY.md 최종 업데이트
- [ ] 이 문서의 체크리스트 업데이트

---

## 9. 참고: 유지할 것 (과잉 정리 방지)

> 비관 에이전트가 지적했지만 **현재 삭제/변경하지 않을 항목**:

| 항목 | 유지 이유 |
|------|-----------|
| 플러그인 시스템 | 아키텍처 확장성 위한 의도적 투자, 단기 ROI는 낮지만 장기 가치 |
| 학습/피드백 시스템 | Phase C에서 구축, 활성화만 하면 가치 제공 |
| 인증 시스템 | 멀티유저 협업의 기반, 이미 안정화됨 |
| SWR 의존성 | 1곳 사용이지만 향후 data fetching 확장 시 활용 |
| Knowledge Graph 규모 | 프로젝트의 핵심 차별 요소, 서버 이동은 하되 데이터 자체는 유지 |

---

*이 문서는 InfraFlow 프로젝트의 종합 코드 리뷰 결과이며, 다른 Claude 세션에서도 이를 참조하여 작업을 이어갈 수 있습니다.*
*비관/낙관 에이전트 분석 기반, 2026-02-10 작성*
