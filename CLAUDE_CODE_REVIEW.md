# InfraFlow 코드 리뷰 및 개선 계획

> **작성일**: 2026-02-05
> **목적**: 프로젝트 코드 리뷰, 비효율적/불필요한 요소 식별, 개선 PR 계획
> **대상**: InfraFlow - AI 인프라 시각화 플랫폼

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [비관적 관점 분석 (문제점)](#2-비관적-관점-분석-문제점)
3. [낙관적 관점 분석 (강점)](#3-낙관적-관점-분석-강점)
4. [Claude 종합 분석](#4-claude-종합-분석)
5. [개선 PR 계획 (병렬 처리 가능)](#5-개선-pr-계획-병렬-처리-가능)
6. [구현 우선순위](#6-구현-우선순위)
7. [참고 자료](#7-참고-자료)

---

## 1. 프로젝트 개요

### 1.1 기본 정보

| 항목 | 값 |
|------|-----|
| **버전** | 0.1.0-alpha |
| **프레임워크** | Next.js 16.1.6 (App Router) |
| **언어** | TypeScript 5 (Strict Mode) |
| **총 코드 라인** | ~7,906 lines (src/) |
| **파일 수** | 45개 TypeScript/TSX 파일 |

### 1.2 기술 스택

```
Frontend: React 19, @xyflow/react 12, Framer Motion 12
Styling: Tailwind CSS 4
Export: html2canvas, jsPDF
Build: Next.js Turbopack
```

### 1.3 디렉토리 구조

```
src/
├── app/                    # Next.js App Router (2 files)
├── components/             # UI 컴포넌트 (27 files)
│   ├── nodes/              # 인프라 노드 컴포넌트
│   ├── edges/              # 연결선 컴포넌트
│   ├── panels/             # UI 패널
│   └── shared/             # 공통 컴포넌트
├── hooks/                  # React 커스텀 훅 (2 files)
├── lib/                    # 비즈니스 로직 (19 files)
│   ├── animation/          # 애니메이션 엔진
│   ├── parser/             # 프롬프트 파서
│   ├── layout/             # 레이아웃 엔진
│   ├── templates/          # 템플릿 관리
│   ├── export/             # 내보내기 유틸
│   ├── data/               # 인프라 DB
│   ├── design/             # 디자인 토큰
│   └── llm/                # LLM 연동
└── types/                  # TypeScript 타입 (2 files)
```

---

## 2. 비관적 관점 분석 (문제점)

### 2.1 성능 이슈 (Performance Issues)

#### P1. Canvas Key Remounting (심각도: HIGH)
**파일**: `src/app/page.tsx:322`

```typescript
// 문제: 노드/엣지 변경 시 전체 캔버스 리마운트
key={`${nodes.length}-${edges.length}`}
```

**영향**:
- 대형 다이어그램에서 심각한 성능 저하
- 애니메이션 끊김, 메모리 스파이크
- React Flow 인스턴스 완전 재생성

**해결**:
- key prop 제거 또는 고정 ID 사용
- 노드/엣지 상태를 prop으로 전달

---

#### P2. JSON 기반 Deep Clone (심각도: MEDIUM)
**파일**: `src/components/shared/FlowCanvas.tsx:68-69`

```typescript
// 비효율적: 매번 전체 객체 직렬화/역직렬화
nodes: JSON.parse(JSON.stringify(nodes)),
edges: JSON.parse(JSON.stringify(edges)),
```

**영향**:
- O(n) 복잡도로 300ms마다 실행
- 대형 그래프에서 CPU 스파이크
- 비직렬화 가능 데이터 손실

**해결**:
- immer.js 또는 structural sharing 사용
- 변경된 부분만 복사하는 얕은 복사 전략

---

#### P3. 대형 인프라 DB (심각도: MEDIUM)
**파일**: `src/lib/data/infrastructureDB.ts` (1,519 lines)

**영향**:
- 전체 DB가 번들에 포함 (57KB)
- Tree-shaking 불가
- 5개 컴포넌트만 사용해도 전체 로드

**해결**:
- 카테고리별 분리 (securityDB, networkDB 등)
- Dynamic import로 필요시 로드

---

### 2.2 코드 품질 이슈 (Code Quality)

#### Q1. 파서 패턴 중복 (심각도: HIGH)
**파일**: `smartParser.ts` + `promptParser.ts`

```typescript
// smartParser.ts (lines 65-84)
const nodeTypePatterns = [
  { pattern: /firewall|방화벽|fw/i, type: 'firewall', label: 'Firewall' },
  // ... 14개 패턴
];

// promptParser.ts (lines 63-84) - 거의 동일!
const componentPatterns = [
  { pattern: /user|사용자|유저/i, type: 'user', label: 'User' },
  // ... 15개 패턴
];
```

**영향**:
- DRY 원칙 위반
- 한 곳 수정 시 다른 곳 누락 위험
- 유지보수 악몽

**해결**:
- 공통 patterns 파일 생성
- 단일 소스 진실 (Single Source of Truth)

---

#### Q2. 미구현 기능 (Dead Code)
**파일**: `src/lib/parser/smartParser.ts:284-296`

```typescript
// 항상 실패 반환하는 함수
function handleModifyCommand(...): SmartParseResult {
  return {
    success: false,
    error: '수정 기능은 아직 구현 중입니다...',
  };
}
```

**해결**: 제거하거나 구현 완료

---

#### Q3. 일관성 없는 에러 핸들링
**전체 코드베이스**

```typescript
// 문제 1: 사용자 피드백 없음 (page.tsx:139)
} catch (error) {
  console.error('Failed to parse prompt:', error);
  // 사용자는 모름!
}

// 문제 2: 데이터 손실 (templateManager.ts:192-198)
} catch {
  return []; // 조용한 실패 - 사용자 템플릿 손실!
}
```

**해결**:
- Toast/Snackbar로 사용자 알림
- 에러 바운더리 추가
- 에러 로깅 서비스 연동 (Sentry)

---

### 2.3 타입 안전성 이슈 (Type Safety)

#### T1. Index Signature 남용
**파일**: `src/types/infra.ts:87`

```typescript
export interface InfraNodeData {
  label: string;
  category: NodeCategory | 'external' | 'zone';
  nodeType: InfraNodeType;
  // ...
  [key: string]: unknown; // 타입 검사 무력화!
}
```

**영향**:
- 임의 속성 할당 가능
- IDE 자동완성 무의미
- 런타임 에러 가능성

**해결**:
- Index signature 제거
- 명시적 optional 속성 정의

---

#### T2. Type Assertion (as) 남용
**여러 파일**

```typescript
// page.tsx:178
const data = node.data as InfraNodeData; // undefined 가능!

// layoutEngine.ts:312
zone: data.zone as string | undefined, // 불필요한 assertion
```

**해결**:
- Type guard 함수 작성
- 런타임 검증 추가

---

### 2.4 아키텍처 이슈

#### A1. page.tsx 거대 컴포넌트 (500 lines)
**파일**: `src/app/page.tsx`

- 18개의 useState 호출
- 비즈니스 로직 + UI 렌더링 혼재
- 템플릿/애니메이션/내보내기 모두 처리

**해결**:
- 커스텀 훅으로 상태 로직 분리
- 하위 컴포넌트로 UI 분할

---

#### A2. 글로벌 싱글톤 (AnimationEngine)
**파일**: `src/lib/animation/animationEngine.ts:280-288`

```typescript
let engineInstance: AnimationEngine | null = null;

export function getAnimationEngine(): AnimationEngine {
  if (!engineInstance) {
    engineInstance = new AnimationEngine();
  }
  return engineInstance;
}
```

**영향**:
- 테스트 어려움
- React StrictMode에서 이중 생성
- 메모리 누수 가능

---

### 2.5 보안 이슈

#### S1. 입력 검증 부재
**파일**: `src/app/page.tsx:104`

```typescript
const handlePromptSubmit = useCallback(async (prompt: string) => {
  // 검증 없음!
  const result = smartParse(prompt, {...});
```

**필요한 검증**:
- 프롬프트 길이 제한
- 특수문자 이스케이프
- Rate limiting

---

#### S2. localStorage 무제한 사용
**파일**: `src/lib/templates/templateManager.ts`

- 크기 제한 없음 (5MB 한도)
- 에러 처리 불완전
- 민감 데이터 암호화 없음

---

### 2.6 테스트 부재 (CRITICAL)

- **0개** 테스트 파일
- 단위 테스트 없음
- 통합 테스트 없음
- E2E 테스트 없음

---

## 3. 낙관적 관점 분석 (강점)

### 3.1 아키텍처 강점

#### ✅ 명확한 관심사 분리
```
lib/
├── parser/     → 프롬프트 파싱
├── animation/  → 애니메이션 로직
├── layout/     → 레이아웃 알고리즘
├── templates/  → 템플릿 관리
└── export/     → 내보내기 기능
```
각 모듈이 독립적으로 테스트/확장 가능

#### ✅ 지능형 파서 시스템
- 문맥 인식 파싱 (이전 대화 기억)
- 한국어/영어 이중 언어 지원
- 신뢰도 점수 제공
- 스마트 삽입 위치 감지 ("뒤에", "사이에", "앞에")

#### ✅ 확장 가능한 템플릿 시스템
- 14개 사전 정의 템플릿
- 경기도의회 특화 템플릿 (VDI, OpenClaw)
- 키워드 기반 자동 제안

---

### 3.2 코드 품질 강점

#### ✅ TypeScript Strict Mode
- 엄격한 타입 검사 활성화
- Discriminated Union 타입 적극 활용
- 인터페이스 기반 설계

#### ✅ React Best Practices
- `memo()` 사용한 컴포넌트 최적화
- `useCallback`으로 함수 메모이제이션
- `useRef`로 비반응형 값 관리
- 적절한 cleanup in useEffect

#### ✅ 일관된 네이밍
- `smartParse()`, `generateFlowSequence()` - 명확한 의도
- kebab-case 노드 타입 (`load-balancer`, `app-server`)
- 파일명과 export 일치

---

### 3.3 UX/UI 강점

#### ✅ Framer Motion 통합
- 부드러운 진입/퇴장 애니메이션
- Spring 물리 기반 전환
- AnimatePresence로 언마운트 애니메이션

#### ✅ 다크 모드 디자인
- 카테고리별 색상 코딩
- Glassmorphism 효과
- 적절한 대비율

#### ✅ Node Detail Panel
- 4탭 인터페이스 (개요, 기능, 정책, 기술정보)
- 24개 인프라 컴포넌트 상세 정보
- 한국어 설명 완비

---

### 3.4 보존해야 할 기능

| 기능 | 가치 | 보존 이유 |
|------|------|----------|
| **SmartParser** | 핵심 | 자연어 → 다이어그램 변환의 핵심 |
| **Template System** | 높음 | 도메인 특화 템플릿 (VDI, 국회) |
| **Animation Engine** | 높음 | 데이터 흐름 시각화 교육 가치 |
| **Node Detail Panel** | 높음 | 인프라 학습 자료 가치 |
| **Undo/Redo** | 중간 | 전문 편집 경험 |
| **Export 기능** | 중간 | PNG/SVG/PDF 다양한 포맷 |

---

## 4. Claude 종합 분석

### 4.1 핵심 문제 요약

| 카테고리 | 심각 | 중간 | 낮음 | 총계 |
|----------|------|------|------|------|
| 성능 | 1 | 3 | 1 | 5 |
| 코드 품질 | 2 | 3 | 2 | 7 |
| 타입 안전성 | 1 | 2 | 0 | 3 |
| 아키텍처 | 1 | 2 | 1 | 4 |
| 보안 | 0 | 2 | 2 | 4 |
| 테스트 | 1 | 0 | 0 | 1 |
| **총계** | **6** | **12** | **6** | **24** |

### 4.2 즉시 수정 필요 (Production 전)

1. **Canvas key remounting 제거** - 성능 심각
2. **입력 검증 추가** - 보안 위험
3. **파서 패턴 통합** - 유지보수 위험
4. **Error Boundary 추가** - 안정성
5. **사용자 에러 피드백** - UX

### 4.3 불필요한 요소 식별

| 요소 | 위치 | 조치 |
|------|------|------|
| `handleModifyCommand` | smartParser.ts:284 | 제거 또는 구현 |
| 중복 파서 패턴 | promptParser + smartParser | 통합 |
| 300ms 인위적 지연 | page.tsx:108 | 제거 |
| 미사용 props (color) | BaseNode.tsx | 제거 |
| public/ SVG 파일들 | /public | 사용 여부 확인 후 정리 |

### 4.4 개선 기회

| 영역 | 현재 | 개선 후 | 예상 효과 |
|------|------|---------|----------|
| 번들 크기 | ~300KB | ~200KB | 로딩 속도 30%↑ |
| 히스토리 성능 | JSON clone | Immer | CPU 사용량 50%↓ |
| 컴포넌트 크기 | 500 lines | <200 lines | 가독성 60%↑ |
| 테스트 커버리지 | 0% | 60%+ | 안정성 대폭 향상 |

---

## 5. 개선 PR 계획 (병렬 처리 가능)

### 5.1 PR 의존성 다이어그램

```
                    ┌─────────────────┐
                    │  PR-00: Setup   │
                    │   Test Infra    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐
│   PR-01       │  │    PR-02       │  │    PR-03       │
│ Performance   │  │  Code Quality  │  │  Type Safety   │
│   Fixes       │  │    Cleanup     │  │  Improvements  │
└───────┬───────┘  └───────┬────────┘  └───────┬────────┘
        │                  │                    │
        └──────────────────┼────────────────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │      PR-04         │
                 │ Architecture Refactor │
                 └─────────┬──────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   PR-05    │  │   PR-06    │  │   PR-07    │
    │  Testing   │  │  Security  │  │   DX/UX    │
    │   Suite    │  │  Hardening │  │Improvements│
    └────────────┘  └────────────┘  └────────────┘
```

### 5.2 Phase 1: 병렬 실행 가능 (독립적)

#### PR-00: 테스트 인프라 설정
**담당**: 별도 작업자
**예상 시간**: 2-3시간
**파일**: 신규 생성

```
변경사항:
- [ ] vitest 설치 및 설정
- [ ] vitest.config.ts 생성
- [ ] src/__tests__/ 디렉토리 구조 생성
- [ ] CI/CD 테스트 파이프라인 추가
- [ ] package.json scripts 추가

생성 파일:
├── vitest.config.ts
├── src/__tests__/
│   ├── setup.ts
│   └── utils/
│       └── testUtils.ts
└── .github/workflows/test.yml (옵션)
```

---

#### PR-01: 성능 최적화
**담당**: 별도 작업자
**예상 시간**: 3-4시간
**의존성**: 없음

```
변경사항:
- [ ] page.tsx: key prop 제거/수정 (line 322)
- [ ] FlowCanvas.tsx: JSON.stringify → immer 전환
- [ ] FlowCanvas.tsx: 히스토리 디바운스 최적화
- [ ] infrastructureDB.ts: 카테고리별 분리

파일:
├── src/app/page.tsx
├── src/components/shared/FlowCanvas.tsx
└── src/lib/data/
    ├── infrastructureDB.ts → index.ts (re-export)
    ├── securityDB.ts (신규)
    ├── networkDB.ts (신규)
    ├── computeDB.ts (신규)
    └── storageDB.ts (신규)

테스트:
- 100개 노드 렌더링 성능 측정
- 메모리 사용량 비교
```

---

#### PR-02: 코드 품질 개선
**담당**: 별도 작업자
**예상 시간**: 2-3시간
**의존성**: 없음

```
변경사항:
- [ ] 파서 패턴 통합 (smartParser + promptParser)
- [ ] Dead code 제거 (handleModifyCommand 등)
- [ ] Magic numbers → 상수 추출
- [ ] 300ms 인위적 지연 제거

파일:
├── src/lib/parser/
│   ├── patterns.ts (신규 - 통합 패턴)
│   ├── smartParser.ts (수정)
│   └── promptParser.ts (수정)
├── src/lib/constants.ts (신규)
└── src/app/page.tsx

상수 파일 예시:
export const HISTORY_DEBOUNCE_MS = 300;
export const ANIMATION_SPEED_MIN = 0.25;
export const ANIMATION_SPEED_MAX = 4;
export const MAX_HISTORY_SIZE = 50;
```

---

#### PR-03: 타입 안전성 강화
**담당**: 별도 작업자
**예상 시간**: 2-3시간
**의존성**: 없음

```
변경사항:
- [ ] Index signature 제거 및 명시적 속성 정의
- [ ] Type guard 함수 추가
- [ ] as assertion → 타입 가드로 교체

파일:
├── src/types/infra.ts
├── src/types/guards.ts (신규)
├── src/app/page.tsx
└── src/lib/layout/layoutEngine.ts

Type Guard 예시:
// src/types/guards.ts
export function isInfraNodeData(data: unknown): data is InfraNodeData {
  return (
    data !== null &&
    typeof data === 'object' &&
    'label' in data &&
    'nodeType' in data &&
    'category' in data
  );
}

export function isValidTier(tier: unknown): tier is TierType {
  return ['external', 'dmz', 'internal', 'data'].includes(tier as string);
}
```

---

### 5.3 Phase 2: 아키텍처 리팩토링

#### PR-04: 컴포넌트 분리
**담당**: 1명
**예상 시간**: 4-5시간
**의존성**: PR-01, PR-02, PR-03

```
변경사항:
- [ ] page.tsx 상태 로직 → useInfraState 훅 분리
- [ ] UI 섹션별 하위 컴포넌트 분리
- [ ] Modal 관리 통합

파일:
├── src/hooks/
│   ├── useInfraState.ts (신규)
│   ├── useModalManager.ts (신규)
│   └── index.ts (수정)
├── src/components/
│   ├── layout/
│   │   ├── Header.tsx (신규)
│   │   └── EmptyState.tsx (신규)
│   └── modals/
│       └── ModalManager.tsx (신규)
└── src/app/page.tsx (대폭 축소)

목표:
- page.tsx: 500 lines → 150 lines
- 각 컴포넌트: < 200 lines
```

---

### 5.4 Phase 3: 병렬 실행 가능 (독립적)

#### PR-05: 테스트 스위트
**담당**: 별도 작업자
**예상 시간**: 4-5시간
**의존성**: PR-00, PR-04

```
변경사항:
- [ ] 파서 단위 테스트
- [ ] 레이아웃 엔진 테스트
- [ ] 컴포넌트 렌더 테스트
- [ ] 훅 테스트

파일:
├── src/__tests__/
│   ├── lib/
│   │   ├── parser/
│   │   │   ├── smartParser.test.ts
│   │   │   └── promptParser.test.ts
│   │   ├── layout/
│   │   │   └── layoutEngine.test.ts
│   │   └── animation/
│   │       └── animationEngine.test.ts
│   ├── components/
│   │   ├── nodes/
│   │   │   └── BaseNode.test.tsx
│   │   └── panels/
│   │       └── NodeDetailPanel.test.tsx
│   └── hooks/
│       ├── useAnimation.test.ts
│       └── useInfraState.test.ts

목표 커버리지: 60%+
```

---

#### PR-06: 보안 강화
**담당**: 별도 작업자
**예상 시간**: 2-3시간
**의존성**: PR-02

```
변경사항:
- [ ] 입력 검증 유틸 추가
- [ ] localStorage 안전한 래퍼 구현
- [ ] Error Boundary 추가
- [ ] 에러 사용자 피드백 시스템

파일:
├── src/lib/utils/
│   ├── validation.ts (신규)
│   └── safeStorage.ts (신규)
├── src/components/
│   ├── ErrorBoundary.tsx (신규)
│   └── Toast.tsx (신규)
└── src/app/page.tsx

검증 함수 예시:
// src/lib/utils/validation.ts
export const MAX_PROMPT_LENGTH = 2000;

export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: string
} {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: '프롬프트를 입력해주세요.' };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `최대 ${MAX_PROMPT_LENGTH}자까지 입력 가능합니다.` };
  }
  return { valid: true };
}
```

---

#### PR-07: DX/UX 개선
**담당**: 별도 작업자
**예상 시간**: 2-3시간
**의존성**: PR-04

```
변경사항:
- [ ] 로딩 상태 개선 (Skeleton)
- [ ] 에러 메시지 한글화 완성
- [ ] 키보드 단축키 안내 추가
- [ ] 접근성 개선 (ARIA)

파일:
├── src/components/shared/
│   ├── Skeleton.tsx (신규)
│   └── KeyboardShortcuts.tsx (신규)
├── src/components/panels/
│   └── PromptPanel.tsx (수정)
└── src/lib/i18n/
    └── messages.ts (신규 - 메시지 통합)
```

---

### 5.5 PR 요약 테이블

| PR | 이름 | 예상 시간 | 의존성 | 병렬 가능 |
|----|------|----------|--------|----------|
| PR-00 | 테스트 인프라 | 2-3h | 없음 | ✅ |
| PR-01 | 성능 최적화 | 3-4h | 없음 | ✅ |
| PR-02 | 코드 품질 | 2-3h | 없음 | ✅ |
| PR-03 | 타입 안전성 | 2-3h | 없음 | ✅ |
| PR-04 | 아키텍처 | 4-5h | 01,02,03 | ❌ |
| PR-05 | 테스트 | 4-5h | 00,04 | ✅ |
| PR-06 | 보안 | 2-3h | 02 | ✅ |
| PR-07 | DX/UX | 2-3h | 04 | ✅ |

**총 예상 시간**:
- 순차 실행: ~25시간
- 병렬 실행 (Phase별): ~15시간

---

## 6. 구현 우선순위

### 6.1 즉시 (Today)
- [ ] PR-01: Canvas key 문제 수정
- [ ] PR-06: 입력 검증 추가

### 6.2 이번 주
- [ ] PR-00: 테스트 인프라
- [ ] PR-02: 파서 패턴 통합
- [ ] PR-03: 타입 안전성

### 6.3 다음 주
- [ ] PR-04: 아키텍처 리팩토링
- [ ] PR-05: 테스트 스위트
- [ ] PR-07: DX/UX 개선

---

## 7. 참고 자료

### 7.1 관련 파일 경로

```bash
# 핵심 수정 대상
src/app/page.tsx                           # 메인 페이지 (500 lines)
src/components/shared/FlowCanvas.tsx       # 캔버스 (207 lines)
src/lib/parser/smartParser.ts              # 스마트 파서 (490 lines)
src/lib/parser/promptParser.ts             # 기본 파서 (133 lines)
src/lib/data/infrastructureDB.ts           # 인프라 DB (1519 lines)
src/types/infra.ts                         # 타입 정의 (166 lines)
```

### 7.2 코드 리뷰 체크리스트

PR 리뷰 시 확인사항:
- [ ] TypeScript strict 에러 없음
- [ ] 새로운 any/unknown 타입 없음
- [ ] console.log 제거됨
- [ ] 한글 주석/메시지 일관성
- [ ] 기존 기능 회귀 없음
- [ ] 번들 크기 증가 최소화

### 7.3 성능 측정 기준

```typescript
// 성능 테스트 시나리오
const scenarios = {
  small: { nodes: 10, edges: 15 },
  medium: { nodes: 50, edges: 80 },
  large: { nodes: 100, edges: 200 },
};

// 측정 항목
- 초기 렌더링 시간 (FCP)
- 노드 드래그 시 FPS
- 히스토리 저장 시간
- 메모리 사용량 (heap size)
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-02-05 | 1.0 | 최초 작성 | Claude Opus 4.5 |

---

> **Note**: 이 문서는 다른 Claude 인스턴스가 프로젝트를 이어받을 때 참고할 수 있도록 작성되었습니다.
> 각 PR은 독립적으로 작업 가능하며, 의존성이 명시된 경우 해당 PR 완료 후 진행하세요.
