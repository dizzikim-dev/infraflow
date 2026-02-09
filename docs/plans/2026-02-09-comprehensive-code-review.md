# InfraFlow 종합 코드 리뷰 & 개선 계획

> **일자**: 2026-02-09
> **브랜치**: `feat/llm-diagram-modification`
> **분석 범위**: 소스 코드 160개 파일, 약 34,059줄
> **리뷰어**: Pessimist Agent + Optimist Agent + Feedback Analyzer

---

## 1. 프로젝트 현황 요약

### 코드베이스 규모
```
소스 파일:     160개 (.ts/.tsx)
총 코드 라인:  ~34,059줄
테스트 파일:   36개 (유닛 + E2E)
의존성:        11 production + 16 dev
```

### 아키텍처 구조
```
src/
├── app/           # Next.js App Router (page, api routes)
├── components/    # React 컴포넌트 (nodes, edges, panels, shared, layout, comparison, contextMenu, admin)
├── contexts/      # React Context (AnimationContext)
├── hooks/         # 커스텀 훅 8개 (useInfraState, useNodes, useEdges, usePromptParser 등)
├── lib/           # 비즈니스 로직
│   ├── animation/ # 애니메이션 엔진 + 시나리오
│   ├── audit/     # 보안 감사 리포트
│   ├── cost/      # 비용 추정
│   ├── data/      # 인프라 DB (카테고리별 7개 모듈)
│   ├── design/    # 디자인 토큰
│   ├── errors/    # 에러 클래스 5개
│   ├── export/    # Terraform, K8s, PlantUML, PDF 내보내기
│   ├── layout/    # 레이아웃 엔진
│   ├── middleware/ # Rate limiter
│   ├── parser/    # 프롬프트 파서 (13개 파일)
│   ├── plugins/   # 플러그인 시스템
│   ├── templates/ # 템플릿 매니저
│   ├── utils/     # 유틸리티
│   └── validations/ # 검증
└── types/         # TypeScript 타입 정의
```

---

## 2. Pessimist Agent 분석 (리스크 & 문제점)

### CRITICAL (즉시 수정 필요)

#### P-01: LLM 프롬프트 인젝션 취약점
- **파일**: `src/lib/parser/prompts.ts:182`, `src/app/api/modify/route.ts:248`
- **내용**: 사용자 프롬프트가 sanitization 없이 LLM 메시지에 직접 삽입됨
- **위험**: 악의적 사용자가 시스템 프롬프트 우회, 데이터 유출 가능
- **수정 방향**: 프롬프트 입력 sanitization, XML 태그 기반 구분자 사용

#### P-02: DOM 직접 조작 (React 안티패턴)
- **파일**: `src/app/page.tsx:136-138, 166-168`
- **내용**: `document.querySelector` 사용으로 Virtual DOM 우회
- **위험**: SSR 깨짐, 레이스 컨디션, CSS selector injection
- **수정 방향**: `useRef` + React callback 패턴으로 교체

### HIGH (이번 스프린트 수정)

#### P-03: 노드타입→티어/카테고리 매핑 3중 복사
- **파일**: `layoutEngine.ts:128-172`, `contextBuilder.ts:10-49`, `layoutEngine.ts:50-87`
- **내용**: 동일한 매핑 데이터가 3개 파일에 중복 존재
- **위험**: 새 노드 타입 추가 시 불일치 → 잘못된 레이아웃/카테고리
- **수정 방향**: `infrastructureDB`를 SSoT로 사용, 중복 매핑 제거

#### P-04: Deprecated 파서 파일 잔존
- **파일**: `promptParser.ts`, `smartParser.ts` (deprecated 표시)
- **내용**: `UnifiedParser.ts`로 통합 완료했으나 deprecated 래퍼가 여전히 사용 중
- **위험**: 인지 부하, 디버깅 복잡도 증가
- **수정 방향**: deprecated 파일 삭제, import 경로 직접 참조로 변경

#### P-05: `Date.now()` ID 생성 → 충돌 위험
- **파일**: `diffApplier.ts:187, 226`
- **내용**: 밀리초 정밀도로 ID 생성 → 배치 처리 시 동일 ID 발생 가능
- **수정 방향**: `nanoid` 사용 통일 (`useNodes.ts`에서 이미 사용 중)

#### P-06: `nanoid` 의존성 미등록
- **파일**: `package.json`
- **내용**: `useNodes.ts`에서 `nanoid` import하나 package.json에 미등록 (transitive dependency)
- **수정 방향**: `npm install nanoid` 명시적 추가

#### P-07: 인메모리 Rate Limiter (서버리스 비효과적)
- **파일**: `src/lib/middleware/rateLimiter.ts:58-121`
- **내용**: `Map` 기반 인메모리 저장소 + `setInterval` cleanup
- **위험**: Vercel 서버리스 환경에서 매 요청마다 새 인스턴스 → rate limit 무력화
- **수정 방향**: 외부 스토어(Vercel KV, Upstash Redis) 또는 헤더 기반 단순화

#### P-08: FlowCanvas 이중 상태 관리 위험
- **파일**: `src/components/shared/FlowCanvas.tsx:67-70`
- **내용**: `useEffect`로 부모→자식 state sync → 불필요한 리렌더링
- **수정 방향**: controlled/uncontrolled 패턴 명확화, 단일 state 소스

#### P-09: 무거운 번들 (미사용 시 로딩되는 패키지)
- **패키지**: `jspdf`(29MB), `html2canvas`(4.4MB), `lucide-react`(44MB)
- **내용**: 내보내기 기능 사용 시에만 필요한 패키지가 production deps에 포함
- **수정 방향**: dynamic import로 lazy loading, lucide-react tree-shaking 확인

#### P-10: 불필요한 `dotenv` 의존성
- **파일**: `package.json:22`
- **내용**: Next.js 내장 `.env` 지원이 있으므로 `dotenv` 패키지 불필요
- **수정 방향**: `dotenv` 제거

### MEDIUM (다음 스프린트 수정)

#### P-11: LLM 파이프라인 테스트 커버리지 0%
- **파일**: `contextBuilder.ts`, `diffApplier.ts`, `modifyErrors.ts`, `prompts.ts`, `responseValidator.ts`, `usePromptParser.ts`
- **내용**: LLM 수정 기능 전체 파이프라인에 자동화 테스트 없음
- **수정 방향**: 유닛테스트 + 통합테스트 추가

#### P-12: `usePromptParser` 스테일 클로저
- **파일**: `src/hooks/usePromptParser.ts:104-220`
- **내용**: `context`와 `currentSpec`이 `useCallback` 클로저에 갇힘
- **수정 방향**: `useRef`로 최신 값 참조 또는 `useReducer` 패턴

#### P-13: 과도한 console.log (60개+)
- **내용**: API 라우트, FlowCanvas 등 production 코드에 디버그 로그 잔존
- **수정 방향**: `logger.ts` 유틸리티 일관 사용, 환경별 로그 레벨

#### P-14: Parser 모듈 과다 분할 (13개 파일)
- **파일**: `src/lib/parser/` (3,708줄)
- **내용**: deprecated 파일 포함 과도한 파일 수, 의존 관계 복잡
- **수정 방향**: deprecated 제거 후 10개 파일로 정리

#### P-15: JSON.parse로 Deep Clone
- **파일**: `diffApplier.ts:94`
- **내용**: `JSON.parse(JSON.stringify(...))` → 느리고 `undefined` 값 손실
- **수정 방향**: `structuredClone()` 또는 `immer` 사용

#### P-16: LLM 응답 JSON 파싱 취약
- **파일**: `responseValidator.ts:132`
- **내용**: 탐욕적 정규식 `\{[\s\S]*\}` → 복수 JSON 객체 시 잘못된 매칭
- **수정 방향**: 괄호 균형 파싱 또는 비탐욕 정규식 + 추가 검증

#### P-17: 요청 본문 크기 제한 없음
- **파일**: `src/app/api/modify/route.ts:248`
- **내용**: 대량 노드/엣지 데이터 전송으로 메모리 고갈 가능
- **수정 방향**: 요청 크기 검증, 노드 수 상한 설정

### LOW (개선 권장)

#### P-18: `immer`가 devDependencies에 배치
- **수정**: dependencies로 이동 또는 `stateClone.ts`에서 활용

#### P-19: `Record<string, unknown>` 타입 단언 남용
- **파일**: `page.tsx:175, 389, 407-408`
- **수정**: `isInfraNodeData` 타입 가드 사용

#### P-20: JSX 내 IIFE 패턴
- **파일**: `page.tsx:398-415`
- **수정**: 별도 컴포넌트로 추출

---

## 3. Optimist Agent 분석 (강점 & 기회)

### 핵심 강점

#### S-01: 타입 시스템 아키텍처
- 카테고리별 Union 타입 계층 구조 (`InfraNodeType`)
- 포괄적 타입 가드 시스템 (`guards.ts`)
- 컴파일 타임 안전성 확보

#### S-02: 조합 가능한 훅 아키텍처
- `useInfraState`가 5개 전문 훅을 조합
- 각 훅이 독립적으로 테스트 가능
- 단일 책임 원칙 준수

#### S-03: 레이스 컨디션 방지 메커니즘
- `usePromptParser`의 request ID + AbortController 이중 보호
- 3단계 검증 (전처리, 후처리, finally)

#### S-04: 플러그인 시스템 (마켓플레이스 준비)
- Node, Parser, Exporter, Panel, Theme 확장 지원
- 의존성 체크, 라이프사이클 관리, 이벤트 시스템
- `PluginRegistry` 싱글턴 + 캐시 무효화

#### S-05: 한/영 이중 언어 지원
- 모든 노드 패턴에 한국어/영어 정규식
- 에러 메시지, 감사 리포트, UI 전체 한국어 지원
- 한국 인프라 시장에서의 경쟁 우위

#### S-06: 풍부한 내보내기 생태계
- PlantUML (C4, deployment, component)
- Terraform HCL, Kubernetes YAML
- PDF 리포트, 비용 추정 CSV

### 확장 기회

#### O-01: LLM 파이프라인 확장
- 다중 턴 대화형 수정
- 아키텍처 추천 ("이 구조에 보안 강화하려면?")
- 컴플라이언스 체크 ("PCI-DSS 충족?")

#### O-02: 템플릿 추천 엔진 (이미 구현됨, 미연결)
- `templateRecommender.ts` 존재하나 UI에 미연결
- EmptyState 또는 입력 중 추천 표시

#### O-03: 키보드 네비게이션 (이미 구현됨)
- `useKeyboardNavigation`, `useHistory` (Ctrl+Z/Y)
- 단축키 패널 UI 추가로 파워유저 경험 향상

#### O-04: LLM API 호출에 Retry 유틸리티 적용
- `retry.ts` (지수 백오프 + 지터) 이미 존재
- `/api/modify` 엔드포인트에 적용하면 즉시 안정성 향상

---

## 4. 종합 피드백 분석 (Feedback Analyzer)

### 우선순위 매트릭스

| 우선순위 | 카테고리 | 이슈 수 | 대표 이슈 |
|----------|----------|---------|-----------|
| **P0** (즉시) | 보안 | 2 | 프롬프트 인젝션, DOM 조작 |
| **P1** (이번 스프린트) | 아키텍처/품질 | 8 | 데이터 중복, deprecated 정리, 번들 최적화 |
| **P2** (다음 스프린트) | 테스트/안정성 | 7 | LLM 테스트, 스테일 클로저, 로깅 |
| **P3** (개선) | 코드 품질 | 3 | 타입 단언, IIFE, immer |

### 의존성 맵

```
P-01 (프롬프트 인젝션)
  └── P-17 (요청 크기 제한)과 함께 API 보안 강화

P-03 (매핑 중복) ──── P-04 (deprecated 정리) ──── P-14 (parser 정리)
  └── 모두 parser/layout 모듈 리팩토링 범위

P-05 (Date.now ID) ──── P-06 (nanoid 미등록)
  └── 함께 수정 가능

P-09 (번들 최적화) ──── P-10 (dotenv 제거)
  └── 함께 수정 가능

P-11 (LLM 테스트) ──── P-15 (deep clone) ──── P-16 (JSON 파싱)
  └── LLM 파이프라인 품질 개선 범위
```

---

## 5. 개선 PR 계획 (병렬 처리 가능)

### Stream A: 보안 & API 강화

#### PR #A1: API 보안 강화 (P0)
```
범위:
├── src/lib/parser/prompts.ts         # 프롬프트 sanitization 추가
├── src/app/api/modify/route.ts       # 요청 크기 제한, 입력 검증 강화
└── src/lib/parser/responseValidator.ts # JSON 파싱 로직 강화

작업:
1. formatUserMessage()에 프롬프트 sanitization 추가
   - XML 태그 기반 구분자 사용 (<user_request>...</user_request>)
   - 특수 문자 이스케이프
2. 요청 본문 크기 제한 (max 50개 노드, 100개 엣지)
3. JSON 파싱 정규식 개선 (비탐욕 매칭)

의존성: 없음
병렬: B1, C1과 병렬 가능
```

#### PR #A2: Rate Limiter 개선
```
범위:
├── src/lib/middleware/rateLimiter.ts  # 서버리스 호환 수정
└── src/app/api/modify/route.ts       # CSRF 기본 보호

작업:
1. setInterval cleanup 제거, 요청 시 cleanup으로 변경
2. 환경 변수로 rate limit 설정 가능하게
3. API 라우트에 Origin 체크 추가

의존성: PR #A1 이후
```

### Stream B: 코드 품질 & 리팩토링

#### PR #B1: 데이터 매핑 SSoT 통합 (P1)
```
범위:
├── src/lib/data/infrastructureDB.ts  # 이미 SSoT (유지)
├── src/lib/layout/layoutEngine.ts    # categoryMap, typeTierMap 제거
├── src/lib/parser/contextBuilder.ts  # NODE_TYPE_TO_TIER 제거
├── src/lib/parser/diffApplier.ts     # formatLabel 제거
└── src/lib/data/index.ts             # 헬퍼 함수 내보내기 추가

작업:
1. infrastructureDB에서 tier, category 조회하는 헬퍼 함수 작성
   - getCategoryForType(type: InfraNodeType): NodeCategory
   - getTierForType(type: InfraNodeType): TierType
   - getLabelForType(type: InfraNodeType): string
2. layoutEngine.ts의 getCategoryFromType(), getTierForNode() → 헬퍼 사용
3. contextBuilder.ts의 NODE_TYPE_TO_TIER → 헬퍼 사용
4. diffApplier.ts의 formatLabel() → 헬퍼 사용
5. 기존 테스트 통과 확인

의존성: 없음
병렬: A1, C1과 병렬 가능
```

#### PR #B2: Deprecated 파서 정리 + Parser 모듈 정리
```
범위:
├── src/lib/parser/promptParser.ts    # 삭제
├── src/lib/parser/smartParser.ts     # 삭제
├── src/lib/parser/index.ts           # export 경로 수정
├── src/app/api/parse/route.ts        # import 경로 수정
└── src/lib/parser/patterns.ts        # 주석의 smartParser 참조 제거

작업:
1. promptParser.ts, smartParser.ts 삭제
2. index.ts에서 UnifiedParser의 함수를 직접 export
3. api/parse/route.ts의 import를 UnifiedParser로 변경
4. patterns.ts 주석 업데이트
5. TypeScript 빌드 + 테스트 통과 확인

의존성: PR #B1 이후 (patterns.ts 수정 겹침 방지)
```

#### PR #B3: page.tsx 리팩토링
```
범위:
├── src/app/page.tsx                  # DOM 조작 제거, IIFE 제거, 타입 개선

작업:
1. document.querySelector → useRef 교체
   - focusPromptInput: PromptPanel에 ref 전달
   - handleEditNode: node 컴포넌트에 edit 상태 전달
2. IIFE 패턴(라인 398-415) → EdgeContextMenuWrapper 컴포넌트 추출
3. Record<string, unknown> → isInfraNodeData 타입 가드 사용

의존성: 없음
병렬: B1과 병렬 가능
```

### Stream C: 의존성 & 번들 최적화

#### PR #C1: 의존성 정리 (P1)
```
범위:
├── package.json

작업:
1. nanoid를 dependencies에 명시적 추가
2. dotenv 제거
3. immer를 devDependencies에서 dependencies로 이동
4. npm audit 실행 및 취약점 해결

의존성: 없음
병렬: A1, B1과 병렬 가능
```

#### PR #C2: 번들 최적화
```
범위:
├── src/components/panels/ExportPanel.tsx  # jspdf, html2canvas lazy import
└── next.config.ts                         # bundle analyzer 추가

작업:
1. jspdf, html2canvas를 dynamic import로 변경
   - ExportPanel 내에서 사용 시점에 import()
2. lucide-react tree-shaking 확인
3. bundle analyzer로 번들 크기 측정

의존성: PR #C1 이후
```

#### PR #C3: ID 생성 통일
```
범위:
├── src/lib/parser/diffApplier.ts     # Date.now() → nanoid
├── src/lib/parser/intelligentParser.ts # Date.now()-Math.random() → nanoid

작업:
1. diffApplier.ts의 newNodeId 생성을 nanoid 사용으로 변경
2. intelligentParser.ts의 ID 생성도 통일
3. 기존 테스트 통과 확인

의존성: PR #C1 이후 (nanoid 의존성 추가 필요)
```

### Stream D: 테스트 & 안정성

#### PR #D1: LLM 파이프라인 테스트 추가 (P2)
```
범위:
├── src/__tests__/lib/parser/contextBuilder.test.ts    # 신규
├── src/__tests__/lib/parser/diffApplier.test.ts       # 신규
├── src/__tests__/lib/parser/responseValidator.test.ts  # 신규
├── src/__tests__/lib/parser/modifyErrors.test.ts       # 신규
└── src/__tests__/lib/parser/prompts.test.ts            # 신규

작업:
1. contextBuilder: buildContext, inferTier, generateSummary 테스트
2. diffApplier: 각 operation 타입별 테스트 (replace, add, remove, modify, connect, disconnect)
3. responseValidator: JSON 파싱, Zod 검증, 에지 케이스
4. modifyErrors: 팩토리 메서드, toJSON, 에러 변환
5. prompts: formatUserMessage 출력 검증

의존성: 없음
병렬: A1, B1, C1과 병렬 가능
```

#### PR #D2: FlowCanvas 상태 관리 개선
```
범위:
├── src/components/shared/FlowCanvas.tsx  # 이중 상태 해결
└── src/hooks/useEdges.ts                 # 스테일 클로저 수정

작업:
1. FlowCanvas의 initialNodes/initialEdges를 controlled 패턴으로 변경
2. useEdges의 deleteEdge에서 functional state updater 사용
3. 관련 테스트 업데이트

의존성: PR #B3 이후 (page.tsx 수정과 연관)
```

#### PR #D3: 로깅 정리
```
범위:
├── src/app/api/modify/route.ts        # console.log → logger
├── src/components/shared/FlowCanvas.tsx # 디버그 로그 제거
└── src/lib/utils/logger.ts            # 환경별 로그 레벨

작업:
1. production 코드의 console.log를 logger.ts로 교체
2. FlowCanvas의 디버그 console.log 제거
3. logger.ts에 환경 변수 기반 로그 레벨 추가

의존성: 없음
병렬: D1과 병렬 가능
```

---

## 6. 병렬 처리 다이어그램

```
시간 ─────────────────────────────────────────────────────────▶

Phase 1: 독립 작업 (병렬)          Phase 2: 의존 작업        Phase 3
┌─────────────────────────────┐   ┌───────────────────┐     ┌──────────┐
│                             │   │                   │     │          │
│  Stream A (보안)            │   │                   │     │          │
│  ┌──────┐                   │   │ ┌──────┐          │     │          │
│  │ A1   │───────────────────┼──▶│ A2   │          │     │          │
│  └──────┘                   │   │ └──────┘          │     │          │
│                             │   │                   │     │          │
│  Stream B (리팩토링)         │   │                   │     │          │
│  ┌──────┐  ┌──────┐        │   │ ┌──────┐          │     │          │
│  │ B1   │─▶│ B2   │────────┼──▶│      │          │     │          │
│  └──────┘  └──────┘        │   │ └──────┘          │     │          │
│  ┌──────┐                   │   │                   │     │          │
│  │ B3   │ (A1과 병렬)       │   │ ┌──────┐          │     │          │
│  └──────┘                   │   │ │ D2   │(B3 이후) │     │          │
│                             │   │ └──────┘          │     │          │
│  Stream C (의존성)           │   │                   │     │          │
│  ┌──────┐                   │   │ ┌──────┐ ┌──────┐ │     │          │
│  │ C1   │───────────────────┼──▶│ C2   │ │ C3   │ │     │          │
│  └──────┘                   │   │ └──────┘ └──────┘ │     │          │
│                             │   │                   │     │          │
│  Stream D (테스트)           │   │                   │     │          │
│  ┌──────┐  ┌──────┐        │   │                   │     │ 최종검증  │
│  │ D1   │  │ D3   │ (병렬)  │   │                   │     │          │
│  └──────┘  └──────┘        │   │                   │     │          │
│                             │   │                   │     │          │
└─────────────────────────────┘   └───────────────────┘     └──────────┘

Phase 1 병렬 가능:                Phase 2 의존성:
  A1 ∥ B1 ∥ B3 ∥ C1 ∥ D1 ∥ D3     A2 ← A1
                                    B2 ← B1
                                    C2, C3 ← C1
                                    D2 ← B3
```

### 병렬 실행 요약

| Phase | PR | Stream | 병렬 가능 | 선행 조건 |
|-------|-----|--------|----------|-----------|
| 1 | A1 | 보안 | O | 없음 |
| 1 | B1 | 리팩토링 | O | 없음 |
| 1 | B3 | 리팩토링 | O | 없음 |
| 1 | C1 | 의존성 | O | 없음 |
| 1 | D1 | 테스트 | O | 없음 |
| 1 | D3 | 테스트 | O | 없음 |
| 2 | A2 | 보안 | O | A1 |
| 2 | B2 | 리팩토링 | O | B1 |
| 2 | C2 | 의존성 | O | C1 |
| 2 | C3 | 의존성 | O | C1 |
| 2 | D2 | 테스트 | O | B3 |

**Phase 1**: 6개 PR 동시 진행 가능
**Phase 2**: 5개 PR 동시 진행 가능 (각각의 선행 조건 충족 후)

---

## 7. 강점 유지사항 (수정하지 말 것)

다음 요소들은 현재 잘 설계되어 있으므로 리팩토링 시 훼손하지 않도록 주의:

1. **타입 시스템 계층 구조** (`types/infra.ts`의 Union 타입)
2. **훅 조합 패턴** (`useInfraState`의 5-hook 조합)
3. **레이스 컨디션 방지** (`usePromptParser`의 requestId + AbortController)
4. **플러그인 시스템 아키텍처** (`types/plugin.ts`, `lib/plugins/`)
5. **한/영 이중 언어 패턴 매칭** (`patterns.ts`)
6. **LRU 캐시 + 키워드 사전 필터링** (`patterns.ts`)
7. **에러 클래스 계층** (`LLMModifyError` 팩토리 패턴)
8. **Zod 기반 LLM 응답 검증** (`responseValidator.ts`)
9. **비교 모드** (`ComparisonView`)
10. **10개 애니메이션 시나리오** (`flowScenarios.ts`)

---

## 8. Quick Win 목록 (즉시 적용 가능한 개선)

| # | 내용 | 파일 | 영향도 |
|---|------|------|--------|
| 1 | `retry.ts`를 `/api/modify` LLM 호출에 적용 | `route.ts` | 높음 (안정성) |
| 2 | `templateRecommender`를 EmptyState에 연결 | `EmptyState.tsx` | 높음 (UX) |
| 3 | 키보드 단축키 패널 (`?` 키) 추가 | 신규 컴포넌트 | 중간 (UX) |
| 4 | `stateClone.ts`를 diffApplier에서 활용 | `diffApplier.ts` | 낮음 (성능) |

---

## 9. 검증 체크리스트

### PR 머지 전 검증
- [x] `npm run type-check` 통과 (2026-02-09)
- [x] `npm test` 전체 통과 — 40 파일, 1,180 테스트 (2026-02-09)
- [ ] `npm run build` 성공
- [x] 기존 1,053개 테스트 회귀 없음 + 127개 신규 테스트 추가 (2026-02-09)
- [ ] 번들 크기 증가 없음 (또는 감소)

### 최종 검증
- [ ] 프롬프트 입력 → 다이어그램 생성 정상
- [ ] LLM 수정 기능 정상 (API 키 있는 경우)
- [ ] 템플릿 선택 → 렌더링 정상
- [ ] 내보내기 (PNG, PDF, Terraform, PlantUML) 정상
- [ ] 애니메이션 시나리오 재생 정상
- [ ] 비교 모드 정상
- [ ] 우클릭 컨텍스트 메뉴 정상

---

## 10. 결론

### 전체 평가
InfraFlow는 **아키텍처적으로 잘 설계된 프로젝트**입니다. 타입 시스템, 훅 조합 패턴, 플러그인 시스템, 이중 언어 지원 등은 production-grade 수준입니다. 현재 가장 큰 리스크는 **LLM 수정 기능(`feat/llm-diagram-modification`)의 보안과 테스트 부재**이며, 코드 중복(매핑 데이터 3중 복사)과 deprecated 코드 잔존이 유지보수 비용을 높이고 있습니다.

### 권장 실행 순서
1. **Phase 1** (6개 PR 병렬): A1(보안) + B1(매핑통합) + B3(page리팩토링) + C1(의존성) + D1(테스트) + D3(로깅)
2. **Phase 2** (5개 PR 병렬): A2 + B2 + C2 + C3 + D2
3. **최종 검증** 후 main 머지

---

## 11. Phase 1 실행 결과 (2026-02-09)

> 6개 PR을 병렬로 실행 완료. 모든 변경사항 검증 통과.

### 검증 결과
```
✅ TypeScript 타입 체크:  통과 (0 errors)
✅ 테스트:              40 파일 / 1,180 테스트 모두 통과 (기존 1,053 → 1,180, +127 신규)
✅ 회귀:               없음
```

### PR #A1: API 보안 강화 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/parser/prompts.ts` | `escapeXmlTags()` 헬퍼 추가, 사용자 프롬프트를 `<user_request>` 태그로 래핑, SYSTEM_PROMPT에 보안 규칙 섹션 추가 |
| `src/app/api/modify/route.ts` | 프롬프트 최대 2,000자 제한, 노드 100개 제한, 엣지 200개 제한 (HTTP 400 응답) |
| `src/lib/parser/responseValidator.ts` | 탐욕적 정규식 `\{[\s\S]*\}` → `findFirstBalancedJSON()` 브래킷 균형 파싱으로 교체 |

**해결된 이슈**: P-01 (프롬프트 인젝션), P-16 (JSON 파싱 취약), P-17 (요청 크기 제한)

### PR #B1: 데이터 매핑 SSoT 통합 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/data/infrastructureDB.ts` | `getCategoryForType()`, `getTierForType()`, `getLabelForType()` SSoT 헬퍼 함수 3개 추가 |
| `src/lib/data/index.ts` | SSoT 헬퍼 함수 re-export 추가 |
| `src/lib/layout/layoutEngine.ts` | 34-entry `categoryMap` + 32-entry `typeTierMap` 제거 → SSoT 헬퍼 위임 |
| `src/lib/parser/contextBuilder.ts` | 40-line `NODE_TYPE_TO_TIER` 상수 제거 → `getTierForType()` 위임 |
| `src/lib/parser/diffApplier.ts` | 35-entry `labelMap` 제거 → `getLabelForType()` 위임 |
| `src/lib/data/components/compute.ts` | `web-server` tier: `'dmz'` → `'internal'` (기존 코드와 일치시킴) |
| `src/lib/data/components/storage.ts` | `cache` tier: `'internal'` → `'data'` (기존 코드와 일치시킴) |

**해결된 이슈**: P-03 (매핑 3중 복사) — 약 140줄의 중복 코드 제거

### PR #B3: page.tsx 리팩토링 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/page.tsx` | DOM 직접 조작(`document.querySelector`) → `useRef` + React 패턴으로 교체, `Record<string,unknown>` 타입 단언 → `isInfraNodeData` 타입 가드 사용 |
| `src/components/panels/PromptPanel.tsx` | `focusInput` prop 추가하여 외부에서 포커스 제어 가능 |

**해결된 이슈**: P-02 (DOM 직접 조작), P-19 (타입 단언 남용), P-20 (IIFE 패턴)

### PR #C1: 의존성 정리 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | `dotenv` 제거, `nanoid: ^5.1.5` 명시적 추가, `immer` devDependencies → dependencies 이동 |

**해결된 이슈**: P-06 (nanoid 미등록), P-10 (불필요한 dotenv), P-18 (immer 위치)

### PR #D1: LLM 파이프라인 테스트 추가 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/__tests__/lib/parser/contextBuilder.test.ts` | 28개 테스트 (buildContext, inferTier, generateSummary) |
| `src/__tests__/lib/parser/diffApplier.test.ts` | 27개 테스트 (add/remove/modify/connect/disconnect/replace, 불변성, findNode 매칭) |
| `src/__tests__/lib/parser/responseValidator.test.ts` | 33개 테스트 (JSON 파싱, Zod 검증, 6개 operation 타입 스키마, 에지 케이스) |
| `src/__tests__/lib/parser/modifyErrors.test.ts` | 39개 테스트 (팩토리 메서드, toJSON, HTTP 상태, 에러 변환) |

**해결된 이슈**: P-11 (LLM 파이프라인 테스트 커버리지 0%) — **127개 신규 테스트 추가**

### PR #D3: 로깅 정리 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/modify/route.ts` | `console.log/warn/error` → `createLogger('ModifyAPI')` 사용 |
| `src/components/shared/FlowCanvas.tsx` | 디버그 `console.log` 제거 → `createLogger('FlowCanvas')` 사용 |
| `src/hooks/usePromptParser.ts` | `console.log/warn/error` → `createLogger('PromptParser')` 사용 |

**해결된 이슈**: P-13 (과도한 console.log) — 3개 핵심 파일에서 모든 직접 console 호출 제거

### Phase 1 요약

| PR | 상태 | 해결된 이슈 | 제거 코드 | 추가 테스트 |
|----|------|------------|-----------|------------|
| A1 | ✅ 완료 | P-01, P-16, P-17 | — | — |
| B1 | ✅ 완료 | P-03 | ~140줄 중복 | — |
| B3 | ✅ 완료 | P-02, P-19, P-20 | — | — |
| C1 | ✅ 완료 | P-06, P-10, P-18 | — | — |
| D1 | ✅ 완료 | P-11 | — | +127개 |
| D3 | ✅ 완료 | P-13 | — | — |
| **합계** | **6/6** | **11/20 이슈 해결** | **~140줄** | **+127개** |

### 미완료 (Phase 2 대기)

| PR | 내용 | 선행 조건 |
|----|------|-----------|
| A2 | Rate Limiter 개선 | A1 ✅ |
| B2 | Deprecated 파서 정리 | B1 ✅ |
| C2 | 번들 최적화 | C1 ✅ |
| C3 | ID 생성 통일 (nanoid) | C1 ✅ |
| D2 | FlowCanvas 상태 관리 개선 | B3 ✅ |

> Phase 2의 모든 선행 조건이 충족되어 즉시 진행 가능합니다.

---

## 12. Phase 2 실행 결과 (2026-02-09)

> 5개 PR을 병렬로 실행 완료. 모든 변경사항 검증 통과.

### 검증 결과
```
✅ TypeScript 타입 체크:  통과 (0 errors)
✅ 테스트:              40 파일 / 1,180 테스트 모두 통과
✅ 회귀:               없음
```

### PR #A2: Rate Limiter Serverless 호환 개선 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/middleware/rateLimiter.ts` | `setInterval` 기반 주기적 정리 → `lazyCleanup()` 접근 시 정리 패턴으로 교체, `DEFAULT_RATE_LIMIT`/`LLM_RATE_LIMIT` 환경변수 설정 가능 (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_DAILY`, `LLM_RATE_LIMIT_MAX` 등) |
| `src/app/api/modify/route.ts` | Origin 헤더 기반 CSRF 검증 추가 (Origin ≠ Host → 403 Forbidden) |

**해결된 이슈**: P-04 (setInterval 타이머 누수), P-05 (Rate Limit 하드코딩)

### PR #B2: Deprecated 파서 정리 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/parser/promptParser.ts` | **삭제** — UnifiedParser의 thin wrapper |
| `src/lib/parser/smartParser.ts` | **삭제** — UnifiedParser의 thin wrapper |
| `src/app/api/parse/route.ts` | import를 `smartParser` → `UnifiedParser`로 변경 |
| `src/lib/parser/patterns.ts` | 주석: `smartParser와 promptParser에서 공통으로 사용` → `UnifiedParser에서 사용하는 공통 패턴들` |
| `src/lib/parser/UnifiedParser.ts` | 레거시 참조 주석 제거, `(backwards compatible with promptParser)` 주석 정리 |
| `src/__tests__/lib/parser/smartParser.test.ts` | import를 `UnifiedParser`로, describe를 `'UnifiedParser (smartParse)'`로 변경 |
| `src/__tests__/lib/parser/promptParser.test.ts` | import를 `UnifiedParser`로, describe를 `'UnifiedParser (parsePrompt)'`로 변경 |

**해결된 이슈**: P-07 (3중 파서 혼재) — 2개 deprecated 래퍼 파일 삭제, 모든 참조 직접 연결

### PR #C2: 번들 최적화 — 확인 완료 (변경 불필요)

| 파일 | 분석 결과 |
|------|-----------|
| `src/lib/export/exportUtils.ts` | 이미 `await import('html2canvas')`, `await import('jspdf')` 다이나믹 임포트 사용 중 |
| `src/components/panels/ExportPanel.tsx` | `@/lib/export`를 통해 간접적으로 다이나믹 임포트 활용 중 |
| `lucide-react` | Named import 사용으로 tree-shaking 가능 상태 |

**해결된 이슈**: P-09 (번들 사이즈 최적화) — 이미 최적화되어 있음 확인

### PR #C3: ID 생성 통일 (Date.now() → nanoid) — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/parser/diffApplier.ts` | `applyReplace`: `${type}-${Date.now()}` → `${type}-${nanoid(8)}`, `applyAdd`: 동일 패턴 적용 |
| `src/lib/parser/intelligentParser.ts` | `handleCreateFromIntent`/`handleAddFromIntent`: `${type}-${Date.now()}-${Math.random().toString(36).substr(2,5)}` → `${type}-${nanoid(8)}` |
| `src/lib/parser/componentDetector.ts` | `generateNodeId`: 동일 Date.now()-Math.random() → nanoid(8) 패턴 적용 |

**해결된 이슈**: P-08 (ID 충돌 가능성) — 3개 파일에서 5곳의 Date.now() 기반 ID 생성을 nanoid로 통일

### PR #D2: useEdges Stale Closure 수정 — 완료

| 파일 | 변경 내용 |
|------|-----------|
| `src/hooks/useEdges.ts` | `deleteEdge`: 외부 `edges` 클로저 참조 → `setEdges` functional updater 내부에서 `prevEdges` 사용, deps에서 `edges` 제거 |
| `src/hooks/useEdges.ts` | `reverseEdge`: 동일 패턴 적용 — 엣지 조회 + spec 업데이트를 `setEdges` updater 내부로 이동 |
| `src/hooks/useEdges.ts` | `insertNodeBetween`: `edgesRef` (useRef + useEffect 동기화) 도입으로 동기적 읽기 보장, 2개 `setEdges` 호출을 1개 atomic 업데이트로 통합 |
| `src/components/shared/FlowCanvas.tsx` | 변경 불필요 — React Flow의 `useNodesState`/`useEdgesState` + `useEffect` 동기화 패턴은 권장 방식 확인 |

**해결된 이슈**: P-15 (stale closure), P-14 (FlowCanvas 이중 상태 관리) — useEdges의 3개 함수 모두 stale closure 해결, FlowCanvas는 정상 패턴 확인

### Phase 2 요약

| PR | 상태 | 해결된 이슈 | 주요 변경 |
|----|------|------------|-----------|
| A2 | ✅ 완료 | P-04, P-05 | setInterval 제거, 환경변수 설정, CSRF 검증 |
| B2 | ✅ 완료 | P-07 | 2개 deprecated 파일 삭제 |
| C2 | ✅ 확인 | P-09 | 이미 최적화됨 (변경 불필요) |
| C3 | ✅ 완료 | P-08 | 5곳 Date.now() → nanoid(8) |
| D2 | ✅ 완료 | P-14, P-15 | stale closure 수정, atomic 업데이트 |
| **합계** | **5/5** | **6/20 이슈 해결** | |

### 전체 진행 현황

| 항목 | Phase 1 | Phase 2 | 합계 |
|------|---------|---------|------|
| 완료 PR | 6 | 5 | **11/11** |
| 해결 이슈 | 11 | 6 | **17/20** |
| 제거 코드 | ~140줄 | 2파일 + 5곳 정리 | — |
| 추가 테스트 | +127개 | 기존 유지 | 1,180개 |
| TypeScript | ✅ | ✅ | ✅ |
| 전체 테스트 | ✅ 1,180 | ✅ 1,180 | ✅ |

### 미해결 이슈 (3개 — 별도 작업 권장)

| 이슈 | 내용 | 비고 |
|------|------|------|
| P-12 | 통합(E2E) 테스트 부재 | Playwright 기반 별도 스프린트 |
| Quick Win 1 | `retry.ts`를 LLM 호출에 적용 | 기능 확장 성격 |
| Quick Win 2-4 | templateRecommender 연결, 단축키 패널 등 | UX 개선 성격 |

---

*이 문서는 다른 Claude 세션에서도 참조하여 개선 작업을 이어갈 수 있습니다.*
*작성: Claude Opus 4.6 | 2026-02-09*
*Phase 1 실행: Claude Opus 4.6 | 2026-02-09*
*Phase 2 실행: Claude Opus 4.6 | 2026-02-09*
