# InfraFlow 프로젝트 종합 리뷰 및 개선 플랜

> **작성일**: 2026-02-06
> **목적**: 코드 품질 개선 및 기술 부채 해소를 위한 상세 분석 및 실행 계획
> **대상**: 현재 및 미래 Claude 인스턴스, 개발팀

---

## 목차

1. [프로젝트 현황 요약](#1-프로젝트-현황-요약)
2. [비관적 분석 (Pessimist Agent)](#2-비관적-분석-pessimist-agent)
3. [낙관적 분석 (Optimist Agent)](#3-낙관적-분석-optimist-agent)
4. [종합 분석 및 권장사항](#4-종합-분석-및-권장사항)
5. [PR 기반 개선 플랜](#5-pr-기반-개선-플랜)
6. [병렬 처리 다이어그램](#6-병렬-처리-다이어그램)
7. [검증 체크리스트](#7-검증-체크리스트)

---

## 1. 프로젝트 현황 요약

### 기술 스택
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **다이어그램**: React Flow (@xyflow/react)
- **애니메이션**: Framer Motion
- **스타일링**: Tailwind CSS
- **데이터베이스**: PostgreSQL + Prisma ORM
- **데이터 페칭**: SWR

### 파일 통계
| 항목 | 수량 |
|------|------|
| TypeScript/TSX 파일 | 113+ |
| 테스트 파일 | 5 |
| 컴포넌트 | 50+ |
| 커스텀 훅 | 10+ |
| API 라우트 | 8+ |

### 최근 구현 완료 기능
1. **인라인 편집**: 노드 더블클릭으로 라벨/설명 수정
2. **컨텍스트 메뉴**: 우클릭으로 노드 CRUD, 엣지 삽입
3. **비교 뷰**: 화면 이분할 전후 비교, Diff 시각화

---

## 2. 비관적 분석 (Pessimist Agent)

### 2.1 심각도 높음 (Critical)

#### 2.1.1 LLM 의존성 - 단일 실패 지점
**파일**: `src/lib/parser/llmParser.ts`

```
문제: LLM API 호출 실패 시 전체 파싱 파이프라인 중단
현재 상태: 폴백 메커니즘 없음, 재시도 로직 없음
영향: 사용자 경험 심각 저하, 서비스 불안정
```

**증거**:
- `llmParser.ts:38` - 에러 시 빈 객체 반환만 함
- 네트워크 타임아웃 처리 없음
- Rate limiting 대응 없음

#### 2.1.2 거대 훅 (God Hook) - useInfraState
**파일**: `src/hooks/useInfraState.ts` (614줄)

```
문제: 단일 훅이 너무 많은 책임을 담당
현재 상태:
- 노드/엣지 상태 관리
- 히스토리 (Undo/Redo)
- LLM 파싱
- CRUD 작업
- 애니메이션 시퀀스
- 정책 오버레이
- 템플릿 처리
영향: 테스트 어려움, 유지보수 복잡성, 리렌더링 최적화 불가
```

#### 2.1.3 타입 안전성 부재
**통계**: `any` 타입 사용 348회

```
분포:
- 컴포넌트: 89회
- 훅: 156회
- 유틸리티: 67회
- API: 36회
```

**주요 위치**:
- `useInfraState.ts` - 45회
- `ComponentPicker.tsx` - 23회
- `specToFlow.ts` - 18회

### 2.2 심각도 중간 (High)

#### 2.2.1 Race Condition 위험
**파일**: `src/hooks/useInfraState.ts`

```typescript
// 문제 코드 패턴
const handlePromptSubmit = async (prompt) => {
  setIsLoading(true);
  const result = await parsePrompt(prompt);  // 비동기
  setNodes(result.nodes);  // 이전 상태 참조 가능
  setEdges(result.edges);
  saveToHistory();  // 불일치 상태 저장 가능
};
```

**문제점**:
- 빠른 연속 호출 시 상태 불일치
- 히스토리 손상 가능성

#### 2.2.2 메모리 누수 가능성
**파일**: `src/components/shared/FlowCanvas.tsx`

```
문제: 이벤트 리스너 정리 불완전
위치:
- onPaneContextMenu 핸들러
- 윈도우 리사이즈 리스너
- 마우스 이벤트 리스너
```

#### 2.2.3 테스트 커버리지 부족
```
현재: 5개 테스트 파일 / 113+ 소스 파일
커버리지: ~4%
누락 영역:
- 훅 테스트 0개
- 통합 테스트 0개
- E2E 테스트 0개
```

### 2.3 심각도 낮음 (Medium)

#### 2.3.1 하드코딩된 값
```typescript
// 예시
const MAX_HISTORY_SIZE = 50;  // 매직 넘버
const ANIMATION_DURATION = 500;  // 설정 불가
const DEFAULT_ZOOM = 0.8;  // 환경별 다를 수 있음
```

#### 2.3.2 불일치하는 에러 처리
```
패턴 1: try-catch + console.error (43회)
패턴 2: 에러 무시 (12회)
패턴 3: 빈 배열 반환 (8회)
패턴 4: null 반환 (15회)
→ 일관된 에러 처리 전략 부재
```

#### 2.3.3 중복 코드
```
위치:
- specToFlow.ts와 useInfraState.ts의 노드 생성 로직
- FlowCanvas.tsx와 ComparisonPanel.tsx의 렌더링 로직
- 여러 컴포넌트의 스타일 정의
```

---

## 3. 낙관적 분석 (Optimist Agent)

### 3.1 아키텍처 강점

#### 3.1.1 체계적인 파일 구조
```
src/
├── components/     # UI 컴포넌트 (명확한 분리)
│   ├── nodes/      # 인프라 노드
│   ├── edges/      # 연결선
│   ├── panels/     # 패널 UI
│   ├── comparison/ # 비교 뷰
│   └── contextMenu/# 컨텍스트 메뉴
├── hooks/          # 상태 관리 (단일 책임)
├── lib/            # 비즈니스 로직
│   ├── parser/     # 파싱 계층
│   └── animation/  # 애니메이션 엔진
├── types/          # 타입 정의 (중앙 집중)
└── app/            # Next.js 라우팅
```

#### 3.1.2 정교한 파싱 파이프라인
```
사용자 입력 → promptParser → templateMatcher → llmParser → specToFlow
     │              │              │              │           │
     │              │              │              │           └→ React Flow
     │              │              │              └→ AI 보강
     │              │              └→ 템플릿 매칭 (빠른 경로)
     │              └→ 의도 파악
     └→ 자연어
```

**강점**:
- 다단계 폴백 메커니즘
- 템플릿 우선 매칭으로 성능 최적화
- 한국어/영어 이중 언어 지원

#### 3.1.3 강력한 애니메이션 엔진
**파일**: `src/lib/animation/`

```
지원 시나리오:
- 요청/응답 흐름
- 장애 전파
- 보안 침해
- 데이터 복제
- 로드밸런싱

특징:
- 시퀀스 기반 실행
- 속도 조절 가능
- 일시정지/재개
- 시각적 피드백 (색상, 두께, 점선)
```

### 3.2 코드 품질 강점

#### 3.2.1 TypeScript 활용
```typescript
// 우수 사례: 타입 가드
export function isInfraNodeData(data: unknown): data is InfraNodeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'nodeType' in data &&
    'label' in data
  );
}

// 우수 사례: 제네릭 활용
export function createNode<T extends InfraNodeType>(
  type: T,
  data: NodeDataMap[T]
): Node<NodeDataMap[T]>
```

#### 3.2.2 React 패턴 준수
```typescript
// useCallback 활용
const handleNodeClick = useCallback((nodeId: string) => {
  // ...
}, [dependencies]);

// memo 활용
export const Header = memo(function Header(props: HeaderProps) {
  // ...
});

// Context 분리
<NodeEditingProvider onNodeDataUpdate={updateNodeData}>
  {children}
</NodeEditingProvider>
```

#### 3.2.3 보안 감사 시스템
**파일**: `src/lib/parser/securityAuditor.ts`

```
기능:
- OWASP 취약점 탐지
- 네트워크 구성 검증
- 암호화 누락 경고
- 접근 제어 분석
- 자동 권장사항 생성
```

### 3.3 확장 가능성

#### 3.3.1 데이터베이스 연동
```
현재 상태:
- 34개 인프라 컴포넌트 정의
- 카테고리별 분류 (6개)
- 메타데이터 (아이콘, 설명, 티어, 존)

확장 가능:
- 커스텀 컴포넌트 추가
- 템플릿 저장/공유
- 사용자별 설정
```

#### 3.3.2 비교 뷰 아키텍처
```
강점:
- 패널 상태 완전 격리
- Diff 계산 최적화 (useMemo)
- 동기화/독립 모드 전환
- 복사/이동 지원
```

---

## 4. 종합 분석 및 권장사항

### 4.1 우선순위 매트릭스

```
영향도 높음 │ P0: useInfraState 분리   P1: 타입 안전성 강화
           │ P0: 테스트 인프라 구축    P1: 에러 처리 통합
───────────┼─────────────────────────────────────────────
영향도 낮음 │ P2: 중복 코드 제거       P3: 문서화
           │ P2: 성능 최적화          P3: 설정 외부화
           │
           └──────────────────────────────────────────────
                    구현 난이도 낮음        구현 난이도 높음
```

### 4.2 기술 부채 점수

| 영역 | 현재 | 목표 | 갭 |
|------|------|------|-----|
| 타입 안전성 | 40% | 90% | 50% |
| 테스트 커버리지 | 4% | 60% | 56% |
| 코드 복잡도 | 높음 | 중간 | 개선필요 |
| 문서화 | 30% | 70% | 40% |
| 에러 처리 | 불균일 | 일관됨 | 통합필요 |

### 4.3 종합 권장사항

1. **단기 (1-2주)**: useInfraState 분할, any 제거 시작
2. **중기 (3-4주)**: 테스트 인프라, 에러 처리 통합
3. **장기 (5-8주)**: 성능 최적화, 문서화 완성

---

## 5. PR 기반 개선 플랜

### Stream A: 코드 품질 (병렬 가능)

#### PR-A1: useInfraState 분할
**난이도**: 높음 | **영향도**: 높음 | **의존성**: 없음

```
목표: 614줄 단일 훅 → 5개 특화 훅

생성 파일:
├── src/hooks/useNodes.ts          # 노드 CRUD
├── src/hooks/useEdges.ts          # 엣지 CRUD
├── src/hooks/useHistory.ts        # Undo/Redo
├── src/hooks/usePromptParser.ts   # LLM 파싱
└── src/hooks/useInfraState.ts     # 조합 훅 (기존 인터페이스 유지)

검증:
- 기존 API 호환성 유지
- page.tsx 변경 없이 동작
- 각 훅 독립 테스트 가능
```

#### PR-A2: 타입 안전성 강화 - Phase 1 (컴포넌트)
**난이도**: 중간 | **영향도**: 높음 | **의존성**: 없음

```
목표: 컴포넌트 내 any 89회 → 0회

대상:
├── src/components/nodes/*.tsx
├── src/components/edges/*.tsx
├── src/components/panels/*.tsx
└── src/components/contextMenu/*.tsx

작업:
1. InfraNodeData 제네릭화
2. 이벤트 핸들러 타입 명시
3. props 인터페이스 강화
```

#### PR-A3: 타입 안전성 강화 - Phase 2 (훅/유틸)
**난이도**: 중간 | **영향도**: 높음 | **의존성**: PR-A2

```
목표: 훅/유틸 내 any 223회 → 0회

대상:
├── src/hooks/*.ts
├── src/lib/**/*.ts
└── src/app/api/**/*.ts

작업:
1. 제네릭 타입 도입
2. 유니온 타입으로 대체
3. 타입 가드 추가
```

### Stream B: 테스트 인프라 (병렬 가능)

#### PR-B1: 테스트 환경 구축
**난이도**: 중간 | **영향도**: 높음 | **의존성**: 없음

```
목표: 테스트 기반 인프라 구축

생성 파일:
├── jest.config.ts
├── jest.setup.ts
├── __mocks__/
│   ├── @xyflow/react.ts
│   ├── framer-motion.ts
│   └── next/navigation.ts
└── src/test-utils/
    ├── render.tsx           # 커스텀 render
    ├── mockData.ts          # 테스트 데이터
    └── mockHandlers.ts      # MSW 핸들러

도구:
- Jest + React Testing Library
- MSW (Mock Service Worker)
```

#### PR-B2: 훅 단위 테스트
**난이도**: 높음 | **영향도**: 높음 | **의존성**: PR-B1, PR-A1

```
목표: 핵심 훅 테스트 커버리지 80%

생성 파일:
├── src/hooks/__tests__/
│   ├── useNodes.test.ts
│   ├── useEdges.test.ts
│   ├── useHistory.test.ts
│   ├── useComparisonMode.test.ts
│   └── useContextMenu.test.ts

테스트 케이스:
- 노드 CRUD 전체 시나리오
- 히스토리 경계 조건
- Race condition 시뮬레이션
```

#### PR-B3: 컴포넌트 테스트
**난이도**: 중간 | **영향도**: 중간 | **의존성**: PR-B1

```
목표: 핵심 컴포넌트 테스트 커버리지 60%

생성 파일:
├── src/components/__tests__/
│   ├── nodes/BaseNode.test.tsx
│   ├── panels/PromptPanel.test.tsx
│   ├── contextMenu/ComponentPicker.test.tsx
│   └── comparison/ComparisonView.test.tsx

테스트 케이스:
- 렌더링 스냅샷
- 사용자 인터랙션
- 조건부 렌더링
```

### Stream C: 안정성 개선 (순차)

#### PR-C1: 에러 처리 통합
**난이도**: 중간 | **영향도**: 높음 | **의존성**: 없음

```
목표: 일관된 에러 처리 패턴 적용

생성 파일:
├── src/lib/errors/
│   ├── AppError.ts          # 기본 에러 클래스
│   ├── ParseError.ts        # 파싱 에러
│   ├── NetworkError.ts      # 네트워크 에러
│   └── ValidationError.ts   # 검증 에러
├── src/hooks/useErrorHandler.ts
└── src/components/shared/ErrorBoundary.tsx

패턴:
try {
  // 작업
} catch (error) {
  throw new ParseError('프롬프트 파싱 실패', { cause: error });
}
```

#### PR-C2: LLM 폴백 메커니즘
**난이도**: 높음 | **영향도**: 높음 | **의존성**: PR-C1

```
목표: LLM 실패 시 안정적 폴백

수정 파일:
└── src/lib/parser/llmParser.ts

구현:
1. 재시도 로직 (3회, 지수 백오프)
2. 타임아웃 처리 (30초)
3. 템플릿 기반 폴백
4. 오프라인 모드 지원

폴백 체인:
LLM API → 재시도 → 로컬 템플릿 → 기본 구조
```

#### PR-C3: Race Condition 해결
**난이도**: 높음 | **영향도**: 중간 | **의존성**: PR-A1

```
목표: 상태 업데이트 안전성 확보

구현:
1. AbortController 활용
2. 요청 취소 메커니즘
3. 낙관적 업데이트 + 롤백
4. 상태 머신 도입 (XState 고려)

수정 파일:
├── src/hooks/usePromptParser.ts
└── src/hooks/useHistory.ts
```

### Stream D: 성능 최적화 (병렬 가능)

#### PR-D1: 메모이제이션 최적화
**난이도**: 중간 | **영향도**: 중간 | **의존성**: 없음

```
목표: 불필요한 리렌더링 제거

작업:
1. React.memo 적용 확대
2. useMemo/useCallback 의존성 검토
3. 컨텍스트 분리

도구:
- React DevTools Profiler
- why-did-you-render
```

#### PR-D2: 번들 최적화
**난이도**: 중간 | **영향도**: 중간 | **의존성**: 없음

```
목표: 초기 로드 시간 30% 감소

작업:
1. 동적 import 활용
2. 코드 스플리팅
3. 트리 쉐이킹 검증

대상:
- TemplateGallery (lazy load)
- ComparisonView (lazy load)
- Admin 페이지 (별도 번들)
```

### Stream E: 개발자 경험 (병렬 가능)

#### PR-E1: 설정 외부화
**난이도**: 낮음 | **영향도**: 낮음 | **의존성**: 없음

```
목표: 매직 넘버 제거, 설정 중앙화

생성 파일:
└── src/config/
    ├── constants.ts         # 상수
    ├── animation.ts         # 애니메이션 설정
    └── layout.ts            # 레이아웃 설정

예시:
export const ANIMATION_CONFIG = {
  duration: 500,
  easing: 'easeInOut',
  particleCount: 10,
} as const;
```

#### PR-E2: 개발 문서화
**난이도**: 낮음 | **영향도**: 중간 | **의존성**: 없음

```
목표: 개발자 온보딩 시간 단축

생성 파일:
├── docs/
│   ├── ARCHITECTURE.md      # 아키텍처 설명
│   ├── CONTRIBUTING.md      # 기여 가이드
│   ├── HOOKS.md             # 훅 API 문서
│   └── COMPONENTS.md        # 컴포넌트 카탈로그
└── .storybook/              # Storybook 설정 (선택)
```

---

## 6. 병렬 처리 다이어그램

```
시간 ──────────────────────────────────────────────────────────────────────▶

Week 1                    Week 2                    Week 3-4
┌────────────────────────┬────────────────────────┬────────────────────────┐
│                        │                        │                        │
│  Stream A (타입/구조)   │                        │                        │
│  ┌───────┐             │  ┌───────┐             │  ┌───────┐             │
│  │PR-A1  │─────────────┼─▶│PR-A3  │             │  │ 완료  │             │
│  │(분할) │             │  │(타입2)│             │  │       │             │
│  └───────┘             │  └───────┘             │  └───────┘             │
│      ↓ 병렬            │      ↓                 │                        │
│  ┌───────┐             │      │                 │                        │
│  │PR-A2  │─────────────┼──────┘                 │                        │
│  │(타입1)│             │                        │                        │
│  └───────┘             │                        │                        │
│                        │                        │                        │
│  Stream B (테스트)      │                        │                        │
│  ┌───────┐             │  ┌───────┐  ┌───────┐ │                        │
│  │PR-B1  │─────────────┼─▶│PR-B2  │─▶│PR-B3  │ │                        │
│  │(환경) │             │  │(훅)   │  │(컴포) │ │                        │
│  └───────┘             │  └───────┘  └───────┘ │                        │
│                        │                        │                        │
│  Stream C (안정성)      │                        │                        │
│  ┌───────┐             │  ┌───────┐             │  ┌───────┐             │
│  │PR-C1  │─────────────┼─▶│PR-C2  │─────────────┼─▶│PR-C3  │             │
│  │(에러) │             │  │(폴백) │             │  │(Race) │             │
│  └───────┘             │  └───────┘             │  └───────┘             │
│                        │                        │                        │
│  Stream D (성능) ────── │ ─────────────────────  │ ───────────────────── │
│  ┌───────┐  ┌───────┐ │                        │                        │
│  │PR-D1  │  │PR-D2  │ │                        │                        │
│  │(메모) │  │(번들) │ │                        │                        │
│  └───────┘  └───────┘ │                        │                        │
│      ↑ 병렬 ↑          │                        │                        │
│                        │                        │                        │
│  Stream E (DX) ─────── │ ────────────────────── │                        │
│  ┌───────┐  ┌───────┐ │                        │                        │
│  │PR-E1  │  │PR-E2  │ │                        │                        │
│  │(설정) │  │(문서) │ │                        │                        │
│  └───────┘  └───────┘ │                        │                        │
│      ↑ 병렬 ↑          │                        │                        │
│                        │                        │                        │
└────────────────────────┴────────────────────────┴────────────────────────┘

병렬 그룹 Week 1:
- PR-A1, PR-A2 (타입 작업)
- PR-B1 (테스트 환경)
- PR-C1 (에러 처리)
- PR-D1, PR-D2 (성능)
- PR-E1, PR-E2 (DX)

의존성 체인:
- PR-A1 → PR-A3 (타입 Phase 2는 분할 후)
- PR-A2 → PR-A3 (타입 Phase 2는 Phase 1 후)
- PR-B1 → PR-B2 → PR-B3 (테스트 순차)
- PR-C1 → PR-C2 → PR-C3 (안정성 순차)
- PR-A1 → PR-C3 (Race condition은 분할 후)
```

---

## 7. 검증 체크리스트

### PR 머지 전 필수 확인

```
□ 타입 검사 통과 (npm run type-check)
□ 린트 통과 (npm run lint)
□ 기존 테스트 통과 (npm test)
□ 새 테스트 추가됨 (해당 PR 범위)
□ 빌드 성공 (npm run build)
□ 개발 서버 정상 동작 (npm run dev)
```

### 기능별 수동 테스트

```
인라인 편집:
□ 노드 더블클릭 → 입력창 활성화
□ Enter → 저장 + Spec 업데이트
□ Escape → 취소

컨텍스트 메뉴:
□ 캔버스 우클릭 → 노드 추가
□ 노드 우클릭 → 삭제/복제
□ 엣지 우클릭 → 노드 삽입

비교 뷰:
□ Compare 버튼 → 화면 분할
□ 한쪽 수정 → Diff 표시
□ 패널 스왑 동작
□ 비교 종료 → 단일 뷰 복귀

애니메이션:
□ 시나리오 선택 → 애니메이션 재생
□ 속도 조절 동작
□ 일시정지/재개

프롬프트 파싱:
□ 한국어 입력 → 다이어그램 생성
□ 영어 입력 → 다이어그램 생성
□ 템플릿 매칭 동작
```

---

## 부록: Claude 인스턴스 참고사항

### 이 문서 활용법

1. **작업 시작 전**: 해당 PR 섹션의 목표/파일/검증 확인
2. **의존성 확인**: 병렬 처리 다이어그램에서 선행 PR 확인
3. **완료 후**: 검증 체크리스트 수행

### 주요 파일 위치

```
핵심 훅:     src/hooks/useInfraState.ts (분할 대상)
타입 정의:   src/types/index.ts
파싱 로직:   src/lib/parser/
애니메이션:  src/lib/animation/
DB 스키마:   prisma/schema.prisma
```

### 코드 스타일

```
- kebab-case: 노드 타입 (web-server, load-balancer)
- camelCase: 함수/변수
- PascalCase: 컴포넌트/타입
- ConnectionSpec: source/target 사용 (from/to 아님)
```

### 주의사항

```
1. useSearchParams는 Suspense로 감싸야 함
2. React Flow는 ReactFlowProvider 필요
3. 타입 가드 isInfraNodeData 활용 권장
4. any 사용 시 TODO 주석 필수
```

---

*이 문서는 2026-02-06 기준 프로젝트 상태를 반영합니다.*
*개선 작업 진행 시 해당 PR 섹션을 업데이트해 주세요.*
