# Test-Driven Development (TDD) Skill

## Overview
RED-GREEN-REFACTOR 사이클을 따르는 테스트 주도 개발 스킬입니다.

## Activation
- `/tdd [기능명]` 명령으로 활성화
- 새로운 기능 구현 시 자동 제안

## Workflow

### 1. RED Phase (실패하는 테스트 작성)
```
목표: 구현할 기능의 예상 동작을 테스트로 정의

단계:
1. 테스트 파일 생성 또는 기존 파일에 추가
2. 실패하는 테스트 케이스 작성
3. 테스트 실행하여 실패 확인
4. 실패 메시지가 명확한지 확인
```

### 2. GREEN Phase (최소 구현)
```
목표: 테스트를 통과하는 최소한의 코드 작성

단계:
1. 테스트를 통과시키는 가장 간단한 코드 작성
2. 테스트 실행하여 통과 확인
3. 다른 테스트가 깨지지 않았는지 확인
```

### 3. REFACTOR Phase (개선)
```
목표: 코드 품질 개선 (동작 유지)

단계:
1. 중복 제거
2. 네이밍 개선
3. 구조 개선
4. 테스트 재실행하여 통과 확인
```

## Rules

### MUST DO
- 테스트 먼저 작성 (구현 전)
- 한 번에 하나의 테스트만 작성
- 테스트가 실패하는 것을 확인한 후 구현
- 리팩토링 후 반드시 테스트 실행

### MUST NOT
- 테스트 없이 코드 작성
- 여러 기능을 한 번에 테스트
- 테스트를 통과시키기 위해 테스트 수정
- 리팩토링 중 새 기능 추가

## InfraFlow 적용

### 테스트 대상
```
src/
├── lib/parser/          # 프롬프트 파서 로직
│   └── __tests__/
├── lib/layout/          # 레이아웃 엔진
│   └── __tests__/
├── lib/animation/       # 애니메이션 엔진
│   └── __tests__/
└── components/
    └── __tests__/       # 컴포넌트 테스트
```

### 테스트 도구
- Jest + React Testing Library (컴포넌트)
- Vitest (유닛 테스트)
- Playwright (E2E)

## Example

```typescript
// RED: 실패하는 테스트
describe('parseInfraPrompt', () => {
  it('should parse 3-tier architecture prompt', () => {
    const result = parseInfraPrompt('3티어 웹 아키텍처');
    expect(result.components).toContain('web-server');
    expect(result.components).toContain('app-server');
    expect(result.components).toContain('db-server');
  });
});

// GREEN: 최소 구현
function parseInfraPrompt(prompt: string) {
  if (prompt.includes('3티어')) {
    return {
      components: ['web-server', 'app-server', 'db-server']
    };
  }
  return { components: [] };
}

// REFACTOR: 개선
function parseInfraPrompt(prompt: string): InfraSpec {
  const patterns = detectPatterns(prompt);
  return buildSpec(patterns);
}
```
