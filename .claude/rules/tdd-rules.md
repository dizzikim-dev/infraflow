# TDD Rules (Test-Driven Development)

> Superpowers 기반 테스트 주도 개발 규칙

## 규칙 ID 체계

| ID | 규칙명 | 중요도 |
|----|--------|--------|
| TDD-001 | 테스트 먼저 작성 | P0 (필수) |
| TDD-002 | 한 번에 하나의 테스트 | P0 (필수) |
| TDD-003 | 실패 확인 후 구현 | P0 (필수) |
| TDD-004 | 최소 구현 원칙 | P1 (권장) |
| TDD-005 | 리팩토링 후 테스트 | P0 (필수) |
| TDD-006 | 테스트 명명 규칙 | P1 (권장) |
| TDD-007 | 테스트 독립성 | P1 (권장) |

---

## TDD-001: 테스트 먼저 작성

**규칙**: 모든 새로운 기능은 테스트 코드를 먼저 작성한 후 구현한다.

```
순서:
1. 요구사항 분석
2. 테스트 케이스 작성 (RED)
3. 테스트 실행 → 실패 확인
4. 구현 코드 작성 (GREEN)
5. 리팩토링 (REFACTOR)
```

**예시**:
```typescript
// ❌ 잘못된 순서
function parsePrompt(prompt: string) { ... }
// 테스트 없이 구현

// ✅ 올바른 순서
// 1. 먼저 테스트 작성
describe('parsePrompt', () => {
  it('should parse 3-tier architecture', () => {
    const result = parsePrompt('3티어 아키텍처');
    expect(result.components).toContain('web-server');
  });
});

// 2. 테스트 실패 확인 후 구현
function parsePrompt(prompt: string) { ... }
```

---

## TDD-002: 한 번에 하나의 테스트

**규칙**: 한 번에 하나의 테스트 케이스만 작성하고 통과시킨다.

```
❌ 잘못된 방식:
- 10개의 테스트를 한 번에 작성
- 모든 테스트를 통과시키려고 시도

✅ 올바른 방식:
- 테스트 1 작성 → 실패 → 구현 → 통과
- 테스트 2 작성 → 실패 → 구현 → 통과
- 반복...
```

---

## TDD-003: 실패 확인 후 구현

**규칙**: 테스트가 예상대로 실패하는 것을 확인한 후에만 구현을 시작한다.

**이유**:
- 테스트가 올바르게 작성되었는지 확인
- 테스트가 실제로 검증하는지 확인
- 우연히 통과하는 테스트 방지

```bash
# 1. 테스트 실행
npm test

# 2. 실패 확인 (RED)
FAIL  src/lib/parser/__tests__/parsePrompt.test.ts
  ✕ should parse 3-tier architecture

# 3. 이제 구현 시작
```

---

## TDD-004: 최소 구현 원칙

**규칙**: 테스트를 통과하는 가장 간단한 코드를 작성한다.

```typescript
// ❌ 과잉 구현
function parsePrompt(prompt: string) {
  const patterns = loadAllPatterns();
  const nlp = initializeNLP();
  const ast = buildAbstractSyntaxTree(prompt);
  // ... 100줄의 코드
}

// ✅ 최소 구현
function parsePrompt(prompt: string) {
  if (prompt.includes('3티어')) {
    return { components: ['web-server', 'app-server', 'db-server'] };
  }
  return { components: [] };
}
```

**원칙**: 더 많은 테스트가 추가되면 자연스럽게 구현이 일반화된다.

---

## TDD-005: 리팩토링 후 테스트

**규칙**: 리팩토링 후에는 반드시 모든 테스트를 실행한다.

```bash
# 리팩토링 전
npm test  # 모든 테스트 통과 확인

# 리팩토링 수행
# (코드 구조 개선, 중복 제거, 네이밍 개선 등)

# 리팩토링 후
npm test  # 모든 테스트 여전히 통과해야 함
```

---

## TDD-006: 테스트 명명 규칙

**규칙**: 테스트명은 행동을 명확히 설명해야 한다.

```typescript
// ❌ 불명확한 테스트명
it('test1', () => { ... });
it('parsePrompt works', () => { ... });

// ✅ 명확한 테스트명
it('should parse 3-tier architecture prompt', () => { ... });
it('should return empty components for unknown prompt', () => { ... });
it('should throw error when prompt is empty', () => { ... });
```

**패턴**: `should [행동] when [조건]`

---

## TDD-007: 테스트 독립성

**규칙**: 각 테스트는 다른 테스트에 의존하지 않아야 한다.

```typescript
// ❌ 의존적인 테스트
let sharedState;

it('test 1', () => {
  sharedState = createState();
});

it('test 2', () => {
  // sharedState에 의존 - 위험!
  sharedState.modify();
});

// ✅ 독립적인 테스트
it('test 1', () => {
  const state = createState();
  // ...
});

it('test 2', () => {
  const state = createState();
  state.modify();
  // ...
});
```

---

## InfraFlow 적용

### 테스트 구조
```
src/
├── lib/
│   ├── parser/
│   │   ├── __tests__/
│   │   │   ├── parsePrompt.test.ts
│   │   │   └── patterns.test.ts
│   │   ├── parsePrompt.ts
│   │   └── patterns.ts
│   └── animation/
│       ├── __tests__/
│       │   └── animationEngine.test.ts
│       └── animationEngine.ts
└── components/
    └── nodes/
        └── __tests__/
            └── FirewallNode.test.tsx
```

### 테스트 도구
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
```

### 실행 명령
```bash
# 유닛 테스트
npm test

# 특정 파일 테스트
npm test parsePrompt

# 워치 모드
npm test -- --watch

# 커버리지
npm test -- --coverage
```

---

## 체크리스트

### RED Phase
- [ ] 테스트 케이스 작성
- [ ] 테스트 실행
- [ ] 실패 확인 (예상된 이유로)
- [ ] 에러 메시지가 명확한가?

### GREEN Phase
- [ ] 최소 구현 작성
- [ ] 테스트 통과 확인
- [ ] 다른 테스트 깨지지 않음

### REFACTOR Phase
- [ ] 중복 제거
- [ ] 네이밍 개선
- [ ] 구조 개선
- [ ] 모든 테스트 통과 확인
