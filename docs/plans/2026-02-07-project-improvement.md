# InfraFlow 프로젝트 개선 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** InfraFlow v0.1.0 → v1.0.0 릴리즈를 위한 품질 개선 및 안정화

**Architecture:** 현재 MVP 이상으로 구현된 상태에서 코드 품질, 테스트 커버리지, 성능을 개선하여 프로덕션 레벨 달성

**Tech Stack:** Next.js 16, React 19, TypeScript 5, React Flow 12, Vitest 4, Prisma 6

---

## 현재 상태 요약

| 항목 | 현재 | 목표 |
|------|------|------|
| 테스트 커버리지 | ~30-40% | 60%+ |
| TypeScript 오류 | 35개 | 0개 |
| 코드 중복률 | 15% | 5% 미만 |
| 빌드 상태 | ✅ 성공 | ✅ 유지 |
| 테스트 | 209개 통과 | 300개+ |

---

## Phase 1: 즉시 수정 (Critical Fixes)

### Task 1.1: TypeScript 테스트 Mock 오류 수정

**Files:**
- Modify: `src/__tests__/hooks/useEdges.test.ts`
- Modify: `src/__tests__/hooks/useNodes.test.ts`

**Step 1: useEdges 테스트 mock 타입 수정**

```typescript
// src/__tests__/hooks/useEdges.test.ts
// 기존 잘못된 mock
vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    getEdges: vi.fn(),
    setEdges: vi.fn(),
  }),
}));

// 수정된 mock - 올바른 타입 시그니처
vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    getEdges: vi.fn(() => []),
    setEdges: vi.fn((edges: Edge[] | ((edges: Edge[]) => Edge[])) => {}),
    getNodes: vi.fn(() => []),
    setNodes: vi.fn((nodes: Node[] | ((nodes: Node[]) => Node[])) => {}),
  }),
}));
```

**Step 2: 테스트 실행하여 실패 확인**

Run: `cd /Users/hyunkikim/dev/경기도의회\ VDI\ Openclaw\ 구축/infraflow && npm test -- src/__tests__/hooks/useEdges.test.ts`

**Step 3: useNodes 테스트 mock 타입 수정**

```typescript
// src/__tests__/hooks/useNodes.test.ts
// 동일한 패턴 적용
```

**Step 4: 테스트 통과 확인**

Run: `npm test -- src/__tests__/hooks/`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/__tests__/hooks/*.test.ts
git commit -m "fix: correct mock types in hook tests"
```

---

### Task 1.2: BaseNode 테스트 PolicyRule 타입 수정

**Files:**
- Modify: `src/__tests__/components/nodes/BaseNode.test.tsx`

**Step 1: PolicyRule 타입 확인**

Run: `grep -n "interface PolicyRule" src/types/infra.ts`

**Step 2: 테스트 데이터 타입 수정**

```typescript
// 기존 잘못된 타입
const mockPolicy = {
  id: 'test',
  type: 'allow',
  // ...
};

// 수정 - 정확한 PolicyRule 타입 사용
import type { PolicyRule } from '@/types/infra';

const mockPolicy: PolicyRule = {
  id: 'test-policy',
  type: 'ALLOW',  // 대문자 enum
  source: '*',
  destination: 'internal',
  port: 443,
  protocol: 'HTTPS',
  action: 'ALLOW',
  priority: 1,
};
```

**Step 3: 테스트 실행**

Run: `npm test -- src/__tests__/components/nodes/BaseNode.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/__tests__/components/nodes/BaseNode.test.tsx
git commit -m "fix: correct PolicyRule types in BaseNode tests"
```

---

### Task 1.3: TypeScript 전체 오류 확인

**Step 1: 타입 체크 실행**

Run: `cd /Users/hyunkikim/dev/경기도의회\ VDI\ Openclaw\ 구축/infraflow && npx tsc --noEmit`
Expected: 0 errors

**Step 2: 남은 오류 수정 (있는 경우)**

각 오류별로 수정 후 개별 커밋

---

## Phase 2: 테스트 커버리지 향상

### Task 2.1: 애니메이션 엔진 테스트 추가 (현재 0%)

**Files:**
- Create: `src/__tests__/lib/animation/animationEngine.test.ts`
- Reference: `src/lib/animation/animationEngine.ts`

**Step 1: 테스트 파일 생성 및 기본 테스트 작성**

```typescript
// src/__tests__/lib/animation/animationEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAnimationSequence,
  AnimationEngine,
  type AnimationStep
} from '@/lib/animation/animationEngine';

describe('AnimationEngine', () => {
  describe('createAnimationSequence', () => {
    it('should create empty sequence for empty input', () => {
      const sequence = createAnimationSequence([]);
      expect(sequence.steps).toEqual([]);
      expect(sequence.duration).toBe(0);
    });

    it('should create sequence with correct timing', () => {
      const steps: AnimationStep[] = [
        { from: 'node1', to: 'node2', delay: 0, duration: 500, type: 'request' },
        { from: 'node2', to: 'node3', delay: 500, duration: 500, type: 'request' },
      ];
      const sequence = createAnimationSequence(steps);
      expect(sequence.steps).toHaveLength(2);
      expect(sequence.duration).toBe(1000);
    });
  });
});
```

**Step 2: 테스트 실행 - 실패 확인 (RED)**

Run: `npm test -- src/__tests__/lib/animation/animationEngine.test.ts`
Expected: FAIL (함수가 없거나 export 안 됨)

**Step 3: animationEngine.ts에서 필요한 함수 export 확인/추가**

```typescript
// src/lib/animation/animationEngine.ts
// 필요시 export 추가
export function createAnimationSequence(steps: AnimationStep[]) {
  // ...
}
```

**Step 4: 테스트 통과 확인 (GREEN)**

Run: `npm test -- src/__tests__/lib/animation/animationEngine.test.ts`
Expected: PASS

**Step 5: 추가 테스트 케이스 작성**

- `should handle blocked flow type`
- `should handle encrypted flow type`
- `should calculate particle positions`

**Step 6: Commit**

```bash
git add src/__tests__/lib/animation/animationEngine.test.ts
git commit -m "test: add animation engine unit tests"
```

---

### Task 2.2: intelligentParser 테스트 추가 (현재 낮은 커버리지)

**Files:**
- Create: `src/__tests__/lib/parser/intelligentParser.test.ts`
- Reference: `src/lib/parser/intelligentParser.ts`

**Step 1: 기본 테스트 작성**

```typescript
import { describe, it, expect } from 'vitest';
import { IntelligentParser } from '@/lib/parser/intelligentParser';

describe('IntelligentParser', () => {
  const parser = new IntelligentParser();

  describe('parse', () => {
    it('should parse Korean infrastructure prompt', () => {
      const result = parser.parse('3티어 웹 아키텍처');
      expect(result.components).toContain('web-server');
      expect(result.components).toContain('app-server');
      expect(result.components).toContain('db-server');
    });

    it('should parse English infrastructure prompt', () => {
      const result = parser.parse('3-tier web architecture');
      expect(result.components.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown prompt', () => {
      const result = parser.parse('random nonsense text');
      expect(result.components).toEqual([]);
    });
  });
});
```

**Step 2-6: RED-GREEN-REFACTOR 사이클 반복**

---

### Task 2.3: 컴포넌트 테스트 추가

**Files:**
- Create: `src/__tests__/components/panels/PromptPanel.test.tsx`
- Create: `src/__tests__/components/panels/AnimationControlPanel.test.tsx`

**각 패널 컴포넌트에 대해:**
1. 렌더링 테스트
2. 사용자 인터랙션 테스트
3. 상태 변경 테스트

---

## Phase 3: 코드 리팩토링

### Task 3.1: infrastructureDB.ts 분할 (1,519줄 → 모듈화)

**Files:**
- Modify: `src/lib/data/infrastructureDB.ts`
- Create: `src/lib/data/components/securityComponents.ts`
- Create: `src/lib/data/components/networkComponents.ts`
- Create: `src/lib/data/components/computeComponents.ts`
- Create: `src/lib/data/components/cloudComponents.ts`
- Create: `src/lib/data/components/storageComponents.ts`
- Create: `src/lib/data/components/authComponents.ts`
- Create: `src/lib/data/components/index.ts`

**Step 1: 현재 구조 분석**

Run: `wc -l src/lib/data/infrastructureDB.ts`
Expected: ~1519 lines

**Step 2: 카테고리별 컴포넌트 추출**

```typescript
// src/lib/data/components/securityComponents.ts
import type { InfraComponent } from '@/types/infra';

export const securityComponents: InfraComponent[] = [
  {
    id: 'firewall',
    name: 'Firewall',
    nameKo: '방화벽',
    category: 'security',
    // ...
  },
  // WAF, IDS/IPS, VPN Gateway, NAC, DLP
];
```

**Step 3: 인덱스 파일로 통합**

```typescript
// src/lib/data/components/index.ts
import { securityComponents } from './securityComponents';
import { networkComponents } from './networkComponents';
// ...

export const allComponents = [
  ...securityComponents,
  ...networkComponents,
  ...computeComponents,
  ...cloudComponents,
  ...storageComponents,
  ...authComponents,
];
```

**Step 4: infrastructureDB.ts 리팩토링**

```typescript
// src/lib/data/infrastructureDB.ts
import { allComponents } from './components';

export const infrastructureDB = {
  components: allComponents,
  // 기존 로직 유지
};
```

**Step 5: 테스트 실행**

Run: `npm test`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/data/
git commit -m "refactor: split infrastructureDB into category modules"
```

---

### Task 3.2: Parser 모듈 중복 제거

**Files:**
- Modify: `src/lib/parser/UnifiedParser.ts`
- Modify: `src/lib/parser/intelligentParser.ts`
- Modify: `src/lib/parser/patterns.ts`

**Step 1: 중복 패턴 식별**

Run: `grep -rn "3티어" src/lib/parser/`

**Step 2: 공통 패턴을 patterns.ts로 통합**

**Step 3: UnifiedParser에서 공통 패턴 import**

**Step 4: 테스트 및 커밋**

---

## Phase 4: 성능 최적화

### Task 4.1: React 컴포넌트 메모이제이션

**Files:**
- Modify: `src/components/nodes/BaseNode.tsx`
- Modify: `src/components/edges/AnimatedEdge.tsx`

**Step 1: BaseNode에 React.memo 적용**

```typescript
// 기존
export function BaseNode(props: BaseNodeProps) { ... }

// 최적화
export const BaseNode = React.memo(function BaseNode(props: BaseNodeProps) {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data &&
         prevProps.selected === nextProps.selected;
});
```

**Step 2: 성능 프로파일링**

Run: `npm run build && npm run start`
브라우저 DevTools → Performance 탭 확인

---

### Task 4.2: Bundle 크기 최적화

**Step 1: Bundle 분석**

Run: `npm run build` (output size 확인)

**Step 2: 동적 import 적용**

```typescript
// 대형 컴포넌트 lazy loading
const SecurityAuditPanel = dynamic(
  () => import('@/components/panels/SecurityAuditPanel'),
  { ssr: false }
);
```

---

## Phase 5: 접근성 개선

### Task 5.1: ARIA 레이블 추가

**Files:**
- Modify: `src/components/nodes/BaseNode.tsx`
- Modify: `src/components/panels/*.tsx`

**Step 1: 노드에 ARIA 속성 추가**

```typescript
<div
  role="button"
  aria-label={`${data.label} 인프라 노드`}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

---

### Task 5.2: 키보드 네비게이션

**Files:**
- Modify: `src/components/shared/FlowCanvas.tsx`

**Step 1: 키보드 이벤트 핸들러 추가**

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Tab':
      focusNextNode();
      break;
    case 'Enter':
      selectCurrentNode();
      break;
    case 'Delete':
      deleteSelectedNode();
      break;
  }
};
```

---

## Phase 6: 문서화 및 정리

### Task 6.1: 미커밋 파일 정리

**Step 1: Git 상태 확인**

Run: `git status`

**Step 2: 논리적 단위로 커밋**

```bash
# 테스트 파일
git add src/__tests__/
git commit -m "test: add comprehensive test suite"

# 관리자 기능
git add src/app/admin/
git commit -m "feat: add admin interface for component management"

# API 라우트
git add src/app/api/
git commit -m "feat: add REST API endpoints"

# 훅
git add src/hooks/
git commit -m "feat: add custom hooks for state management"
```

---

### Task 6.2: CHANGELOG 작성

**Files:**
- Create: `CHANGELOG.md`

```markdown
# Changelog

## [0.1.0] - 2026-02-07

### Added
- 24개 인프라 컴포넌트 라이브러리
- 5가지 데이터 흐름 애니메이션
- LLM 통합 (Claude, OpenAI)
- 6가지 내보내기 형식 (PNG, SVG, PDF, Kubernetes, Terraform, PlantUML)
- 관리자 인터페이스
- 보안 감사 패널
- 플러그인 시스템
```

---

## 실행 우선순위

| 우선순위 | Phase | 예상 시간 |
|----------|-------|----------|
| P0 | Phase 1: TypeScript 오류 수정 | 1-2시간 |
| P0 | Phase 2: 테스트 커버리지 향상 | 3-4시간 |
| P1 | Phase 3: 코드 리팩토링 | 2-3시간 |
| P2 | Phase 4: 성능 최적화 | 1-2시간 |
| P2 | Phase 5: 접근성 개선 | 1-2시간 |
| P1 | Phase 6: 문서화 및 정리 | 1시간 |

---

## 완료 기준

- [ ] TypeScript 오류 0개
- [ ] 테스트 커버리지 60% 이상
- [ ] 빌드 성공
- [ ] 모든 테스트 통과
- [ ] 미커밋 파일 정리 완료
- [ ] CHANGELOG 작성 완료
