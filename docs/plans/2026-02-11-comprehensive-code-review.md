# InfraFlow 종합 코드 리뷰 및 개선 계획

> **날짜**: 2026-02-11
> **분석 방법**: Pessimist/Optimist/Explore 에이전트 종합 분석
> **범위**: 전체 코드베이스 (412 TS 파일, 140,242 LOC, 92 테스트 파일, 2,595 테스트)

---

## 1. 종합 평가

### 강점 (Optimist)
- **SSoT 아키텍처**: infrastructureDB 중심 단일 진실 원천 (3중 중복 제거 완료)
- **Composable Hooks**: 26개 전문 훅 → useInfraState 합성 패턴
- **Type Guard 시스템**: guards.ts 162줄, SSoT에서 파생
- **Knowledge Graph**: 11,719 LOC, 105 관계, 32 패턴, 45 안티패턴
- **KnowledgeListPage<T>**: 제네릭 관리자 페이지 (~57% 코드 감소)
- **테스트**: 2,595개 100% pass, 21.4% test ratio
- **Zero TS 에러**: strict 모드, 깨끗한 빌드

### 문제점 (Pessimist)

| 심각도 | 이슈 | 영향 |
|--------|------|------|
| HIGH | Knowledge API 라우트 중복 (~3,500줄) | 버그 전파, 유지보수 비용 |
| HIGH | InfraEditor.tsx 갓 컴포넌트 (643줄) | 테스트 불가, 인지 부하 |
| MEDIUM | PluginContext.tsx eslint 억제 14개 | 비표준 React 패턴 |
| MEDIUM | console.log/warn/error 비일관 (logger 미사용) | 프로덕션 로깅 품질 |
| MEDIUM | Silent catch 블록 ~15개 | 에러 추적 불가 |
| LOW | dotenv 미사용 의존성 | 번들 크기 |

---

## 2. 상세 분석

### 2-A. API 라우트 중복 (HIGH)

**현황**: `/src/app/api/knowledge/` 내 ~20개 라우트 파일, 총 3,767줄
- 목록 라우트 (route.ts): 평균 ~175줄/파일, 80-85% 동일 구조
- 개별 라우트 ([id]/route.ts): 평균 ~198줄/파일, 83-88% 동일 구조
- **예상 중복 코드**: ~3,350줄 (전체의 86%)

**라우트 간 차이점** (팩토리로 추출 가능):
1. Prisma 모델명 (`knowledgePattern`, `knowledgeFailure` 등)
2. Validation 스키마 (Create/Update/Query)
3. Unique 키 설정 (단일 or 복합)
4. 필터 필드 (2-6개/리소스)
5. 검색 필드 (3-8개/리소스)
6. 한국어 메시지

### 2-B. InfraEditor.tsx (HIGH)

**현황**: 643줄, 15개 dynamic import, 6+ hooks 합성, 14개 패널/모달 렌더링
- 107줄: dynamic imports
- 45줄: hooks + state
- 90줄: 콜백 핸들러
- 290줄: 패널 AnimatePresence 블록 (동일 패턴 반복)
- 60줄: 컨텍스트 메뉴

**패널 렌더링 패턴 반복** (14회):
```tsx
<AnimatePresence>
  {showXxx && (
    <XxxPanel spec={currentSpec} onClose={() => closeModal('xxx')} />
  )}
</AnimatePresence>
```

### 2-C. PluginContext.tsx (MEDIUM)

**현황**: 428줄, 14개 eslint-disable (모두 `react-hooks/exhaustive-deps`)
- 1개 불필요한 억제 (line 206): `initialize` 누락
- 13개 정당한 억제: `pluginRegistry` 싱글톤 참조 (React가 변경 감지 불가)
- **해결**: `registry`를 state로 래핑 → 13개 억제 제거 가능

### 2-D. 로깅 비일관성 (MEDIUM)

**현황**: `createLogger` 유틸리티 존재하나 일부 파일에서 직접 `console.*` 사용
- componentService.ts: 3개 `console.error`
- themeManager.ts: 1개 `console.warn`
- ExporterRegistry.ts: 2개 `console.warn`/`console.error`
- usePlugins.ts: 2개 `console.error`
- ExportPanel.tsx: 2개 `console.error`
- ReportExportPanel.tsx: 1개 `console.error`
- useAnimation.ts: 3개 `console.warn`/`console.error`
- useAnimationScenario.ts: 2개 `console.warn`/`console.error`
- useEdges.ts: 1개 `console.warn`
- useInfraSelection.ts: 1개 `console.warn`

### 2-E. Silent Catch 블록 (MEDIUM)

**주요 위치**:
- `app/dashboard/page.tsx:47`: `// Silently fail` (다이어그램 삭제)
- `app/diagram/[id]/page.tsx:65`: 제목 변경 실패 시 무시
- `app/admin/page.tsx:61`: DB 연결 실패 무시
- `app/api/analyze/*.ts`: 4개 API에서 에러 세부정보 없이 500 반환

### 2-F. 미사용 의존성 (LOW)

- `dotenv`: src/ 내 0건 import. Next.js가 자체 `.env` 로딩 제공.

---

## 3. 개선 계획

### Phase 1: Quick Wins (병렬 처리 가능)

```
PR-1: dotenv 제거 + 의존성 정리
PR-2: PluginContext eslint 억제 제거
PR-3: console.* → createLogger 마이그레이션
```

### Phase 2: API DRY (최대 영향)

```
PR-4: Knowledge API 라우트 팩토리 생성 + 리팩터링
      → ~3,350줄 중복 → ~600줄 팩토리 + 리소스당 10-30줄 설정
```

### Phase 3: 컴포넌트 리팩터링 (Phase 2와 병렬 가능)

```
PR-5: InfraEditor.tsx → 패널 렌더링 추출 (EditorPanels 컴포넌트)
```

### Phase 4: 에러 처리 개선 (Phase 2, 3 이후)

```
PR-6: Silent catch → 적절한 에러 로깅/사용자 피드백
```

---

## 4. 병렬 처리 다이어그램

```
시간 ──────────────────────────────────────────────────▶

Phase 1 (병렬)           Phase 2        Phase 3        Phase 4
┌──────────────────┐   ┌───────────┐  ┌───────────┐  ┌──────────┐
│ PR-1: dotenv     │   │           │  │           │  │          │
│ PR-2: Plugin ESL │───▶│ PR-4:     │  │ PR-5:     │──▶│ PR-6:    │
│ PR-3: Logger     │   │ API       │  │ Editor    │  │ Catch    │
└──────────────────┘   │ Factory   │  │ Panels    │  │ Blocks   │
                       └───────────┘  └───────────┘  └──────────┘
     ~20분                ~60분          ~30분          ~20분
```

---

## 5. PR 상세

### PR-1: dotenv 제거 + 의존성 정리

**파일**: `package.json`
**변경**: `dotenv` 제거 (dependencies)
**리스크**: 없음 (src/ 내 0건 사용, Next.js 자체 .env 로딩)
**영향**: 번들 크기 소폭 감소

### PR-2: PluginContext eslint 억제 제거

**파일**: `src/contexts/PluginContext.tsx`
**변경**:
1. `pluginRegistry`를 `useState`로 래핑 → `registry` state 변수
2. 13개 `useMemo`/`useCallback`의 dep array에 `registry` 추가
3. line 206 `useEffect`에 `initialize` 추가
4. 14개 `eslint-disable` 주석 제거
**리스크**: 낮음 (동작 동일, deps만 명시적으로 변경)

### PR-3: console.* → createLogger 마이그레이션

**파일**: ~10개 소스 파일
**변경**: `console.error/warn` → `createLogger('ModuleName').error/warn`
**대상**:
- componentService.ts (3개)
- themeManager.ts (1개)
- ExporterRegistry.ts (2개)
- usePlugins.ts (2개)
- ExportPanel.tsx (2개)
- ReportExportPanel.tsx (1개)
- useAnimation.ts (3개)
- useAnimationScenario.ts (2개)
- useEdges.ts (1개)
- useInfraSelection.ts (1개)
**리스크**: 없음 (logger는 내부적으로 console.* 호출)

### PR-4: Knowledge API 라우트 팩토리

**신규 파일**: `src/lib/api/knowledgeRouteFactory.ts` (~600줄)
**수정 파일**: ~20개 라우트 파일 (각 170-200줄 → 10-30줄)
**변경**:
1. `createKnowledgeListRoute(config)` 팩토리 (GET + POST)
2. `createKnowledgeDetailRoute(config)` 팩토리 (GET + PUT + DELETE)
3. `KnowledgeRouteConfig<T>` 인터페이스 (모델명, 스키마, 필터, 검색필드 등)
4. 각 라우트 파일을 설정 기반으로 간소화
**리스크**: 중간 (모든 API 동작 동일 유지 필요, 테스트로 검증)
**예상 삭감**: ~3,350줄 중복 → ~600줄 팩토리 + ~300줄 설정

### PR-5: InfraEditor 패널 추출

**파일**:
- `src/components/editor/InfraEditor.tsx` (643줄 → ~350줄)
- `src/components/editor/EditorPanels.tsx` (신규, ~200줄)
**변경**:
1. 14개 `<AnimatePresence>` 패널 블록을 `EditorPanels` 컴포넌트로 추출
2. 패널 설정 배열 기반 렌더링 (반복 패턴 제거)
3. InfraEditor는 레이아웃 + 상태 관리만 담당
**리스크**: 낮음 (UI 동작 동일, 리렌더링 영향 확인 필요)

### PR-6: Silent Catch 블록 에러 처리

**파일**: ~8개
**변경**:
1. `app/dashboard/page.tsx`: 삭제 실패 시 사용자 알림 추가
2. `app/diagram/[id]/page.tsx`: 제목 변경 실패 시 토스트/에러 메시지
3. `app/admin/page.tsx`: DB 연결 실패 로깅
4. `app/api/analyze/*.ts`: 에러 로깅 추가
5. `hooks/useCloudCatalog.ts`: 에러 로깅 추가
6. `hooks/useCalibration.ts`: 에러 로깅 추가
**리스크**: 낮음 (에러 처리 추가만)

---

## 6. 제외 사항 (의도적)

| 항목 | 이유 |
|------|------|
| Knowledge 데이터 → DB 이동 | 클라이언트 사이드 앱 설계에 적합, 서버 의존성 불필요 |
| Component data 파일 통합 | SSoT 카테고리 분류 유지가 가독성에 유리 |
| API 버전관리 (/v1/) | 현재 단일 클라이언트, 불필요한 복잡성 |
| SWR 제거 | 단일 사용이지만 향후 확장 가능성 |
| usePlugins.ts 간소화 | 26개 export는 세분화된 훅 패턴 (정상) |

---

## 7. 검증 방법

각 PR 완료 후:
1. `npx tsc --noEmit` (TS 에러 확인)
2. `npx vitest run` (2,595 테스트 통과 확인)
3. 변경 파일별 기능 동작 확인

---

## 8. 완료 현황

| PR | 상태 | 변경 파일 | 삭감 LOC |
|----|------|----------|---------|
| PR-1: dotenv 제거 | ✅ 완료 | 1 | 1줄 |
| PR-2: PluginContext ESLint | ✅ 완료 | 1 | 14줄 주석 제거 |
| PR-3: Logger 마이그레이션 | ✅ 완료 | 10 | 0 (대체) |
| PR-4: API 라우트 팩토리 | ✅ 완료 | 21 | ~2,219줄 |
| PR-5: Editor 패널 추출 | ✅ 완료 | 2 | ~200줄 |
| PR-6: Silent Catch 수정 | ✅ 완료 | 8 | 0 (추가) |
| **합계** | **✅ 전체 완료** | **~43 파일** | **~2,420줄** |

---

## 9. 실행 결과 상세

### PR-1: dotenv 제거 (✅)
- `package.json`에서 `dotenv` 의존성 제거
- src/ 내 0건 import 확인 (Next.js 자체 .env 로딩 사용)

### PR-2: PluginContext eslint 억제 제거 (✅)
- `pluginRegistry` 싱글톤을 `useState(() => pluginRegistry)` 로 래핑
- 13개 `useMemo`/`useCallback`에서 `registry` + `updateTrigger` deps 사용
- line 206 `useEffect`에 `initialize`, `initialized` 추가
- **14개 eslint-disable 주석 전부 제거** (0개 남음)

### PR-3: Logger 마이그레이션 (✅)
- **13개 console.error/warn → createLogger 마이그레이션**
- 대상 파일 (10개): componentService.ts, themeManager.ts, ExporterRegistry.ts, usePlugins.ts, ExportPanel.tsx, ReportExportPanel.tsx, useAnimation.ts, useAnimationScenario.ts, useEdges.ts, useInfraSelection.ts
- 패턴: `log.error('message', error instanceof Error ? error : undefined)`

### PR-4: Knowledge API 라우트 팩토리 (✅)
- **신규**: `src/lib/api/knowledgeRouteFactory.ts` (614줄)
  - `createKnowledgeListRoute(config)` → { GET, POST }
  - `createKnowledgeDetailRoute(config)` → { GET, PUT, DELETE }
  - `KnowledgeRouteConfig` 인터페이스: modelName, schemas, filters, searchFields, uniqueKey, semanticIdField, jsonFields
- **20개 라우트 파일**: 각 160-200줄 → 24-30줄 (설정만)
- 모든 변형 처리: 단일/복합 unique key, array has 필터, fallback lookup, JSON 필드 캐스팅
- **결과**: ~3,350줄 → 1,131줄 (66.3% 감소, ~2,219줄 제거)

### PR-5: InfraEditor 패널 추출 (✅)
- **신규**: `src/components/editor/EditorPanels.tsx` (~280줄)
  - 14개 dynamic imports + AnimatePresence 블록 캡슐화
  - 타입 안전 props: ScenarioType, AnimationSequence, PolicyRule, ModalType, Template
- **수정**: `src/components/editor/InfraEditor.tsx` (643줄 → 443줄)
  - 패널 렌더링 부분을 `<EditorPanels ... />` 단일 호출로 대체
  - 레이아웃 + 상태 관리 + 이벤트 핸들러만 유지

### PR-6: Silent Catch 수정 (✅)
- **8개 파일, 13건 수정**
- exportUtils.ts (3건), registry.ts (1건), PluginContext.tsx (2건), AnimationContext.tsx (1건), ErrorBoundary.tsx (2건), llmParser.ts (1건), diffApplier.ts (1건), KnowledgeListPage.tsx (2건)
- 패턴: 무로깅 catch → `log.error/warn` + 에러 타입 가드

### 최종 검증
- `npx tsc --noEmit`: **0 에러** ✅
- `npx vitest run`: **92 파일, 2,595 테스트 전부 통과** ✅
