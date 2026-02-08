# Writing Plans Skill

## Overview
작업을 2-5분 단위의 실행 가능한 단계로 분해합니다.

## Activation
- `/plan [기능]` 명령으로 활성화
- 복잡한 작업 시작 전 자동 제안

## Plan Structure

### Header
```markdown
# Plan: [기능명]

## Goal
[달성하려는 최종 목표 - 1-2문장]

## Success Criteria
- [ ] [검증 가능한 기준 1]
- [ ] [검증 가능한 기준 2]
- [ ] [검증 가능한 기준 3]

## Prerequisites
- [필요한 선행 조건]
- [필요한 도구/라이브러리]
- [필요한 정보/접근권한]
```

### Steps
```markdown
## Steps

### Step 1: [제목] (예상: 3분)
**목표**: [이 단계의 목표]
**파일**: `path/to/file.ts`
**작업**:
1. [구체적 작업 1]
2. [구체적 작업 2]
**완료 기준**: [어떻게 완료를 확인하는가]

### Step 2: [제목] (예상: 5분)
...
```

### Dependencies
```markdown
## Dependencies

┌────────┐     ┌────────┐     ┌────────┐
│ Step 1 │────▶│ Step 2 │────▶│ Step 4 │
└────────┘     └────────┘     └────────┘
                    │
                    ▼
               ┌────────┐
               │ Step 3 │ (병렬 가능)
               └────────┘
```

## Plan Types

### 1. Feature Plan (기능 개발)
```markdown
# Plan: [새 기능명]

## Steps
1. 테스트 작성 (TDD RED)
2. 최소 구현 (TDD GREEN)
3. 리팩토링 (TDD REFACTOR)
4. 통합 테스트
5. 문서 업데이트
```

### 2. Bug Fix Plan (버그 수정)
```markdown
# Plan: Fix [버그 설명]

## Steps
1. 재현 확인
2. 근본 원인 분석
3. 수정 구현
4. 회귀 테스트
5. 검증
```

### 3. Refactor Plan (리팩토링)
```markdown
# Plan: Refactor [대상]

## Steps
1. 현재 상태 테스트 확인
2. 변경 계획 수립
3. 점진적 변경 (테스트 유지)
4. 정리 및 문서화
```

## InfraFlow 적용

### PR 단위 계획
```markdown
# Plan: PR #5 - 애니메이션 엔진

## Goal
데이터 흐름을 시각적으로 보여주는 애니메이션 시스템 구현

## Success Criteria
- [ ] 엣지를 따라 점이 이동하는 애니메이션
- [ ] 재생/일시정지/속도 조절 가능
- [ ] 5개 이상 노드에서 60fps 유지

## Steps

### Step 1: 애니메이션 타입 정의 (3분)
**파일**: `src/types/animation.ts`
**작업**:
1. AnimationSequence 타입 정의
2. AnimationStep 타입 정의
3. AnimationOptions 타입 정의

### Step 2: 애니메이션 훅 구현 (5분)
**파일**: `src/hooks/useAnimation.ts`
**작업**:
1. 시퀀스 상태 관리
2. 재생/일시정지 로직
3. 속도 조절 로직

### Step 3: 애니메이션 엣지 컴포넌트 (5분)
**파일**: `src/components/edges/AnimatedEdge.tsx`
**작업**:
1. Framer Motion 연동
2. 점 이동 애니메이션
3. 스타일 적용

### Step 4: 테스트 (3분)
**파일**: `src/hooks/__tests__/useAnimation.test.ts`
**작업**:
1. 시퀀스 실행 테스트
2. 일시정지/재개 테스트
3. 속도 조절 테스트

### Step 5: 통합 (2분)
**작업**:
1. 메인 Flow에 연결
2. E2E 테스트 실행
```

## Checklist

### 좋은 계획의 특징
```
✅ 각 단계가 2-5분 내 완료 가능
✅ 각 단계의 완료 기준이 명확
✅ 의존성이 명시됨
✅ 파일 경로가 구체적
✅ 병렬 가능 작업이 표시됨
```

### 나쁜 계획의 특징
```
❌ "구현한다" 같은 모호한 단계
❌ 30분 이상 걸리는 단일 단계
❌ 완료 기준 없음
❌ 파일 경로 없음
❌ 의존성 무시
```

## Example

```
/plan 새로운 WAF 노드 추가

# Plan: WAF 노드 컴포넌트 추가

## Goal
WAF(Web Application Firewall) 인프라 노드를 추가하여
보안 아키텍처 시각화 지원

## Success Criteria
- [ ] WAF 노드가 다이어그램에 렌더링됨
- [ ] "WAF" 프롬프트가 올바르게 파싱됨
- [ ] 보안 카테고리 스타일 적용됨

## Steps

### Step 1: 타입 추가 (2분)
**파일**: `src/types/infra.ts`
**작업**: InfraNodeType에 'waf' 추가
**완료 기준**: 타입 에러 없음

### Step 2: 데이터베이스 추가 (2분)
**파일**: `src/lib/data/infrastructureDB.ts`
**작업**: WAF 노드 데이터 추가
**완료 기준**: getNodeById('waf') 동작

### Step 3: 파싱 패턴 추가 (3분)
**파일**: `src/lib/parser/patterns.ts`
**작업**: WAF 관련 패턴 추가
**완료 기준**: parsePrompt('WAF 추가') 동작

### Step 4: 컴포넌트 생성 (5분)
**파일**: `src/components/nodes/WafNode.tsx`
**작업**: WAF 노드 컴포넌트 구현
**완료 기준**: 스토리북에서 렌더링 확인

### Step 5: 테스트 (3분)
**파일**: `src/__tests__/waf.test.ts`
**작업**: WAF 관련 테스트 추가
**완료 기준**: 모든 테스트 통과
```
