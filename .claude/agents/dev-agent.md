# Development Agent (DevAgent)

> Superpowers 스킬 통합 개발 에이전트

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DevAgent - Superpowers 기반 개발 워크플로우 에이전트                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  통합 스킬:                                                                  │
│  ├── TDD (test-driven-development)                                          │
│  ├── Systematic Debugging                                                   │
│  ├── Brainstorming                                                          │
│  ├── Parallel Agents                                                        │
│  ├── Writing Plans                                                          │
│  └── Verification                                                           │
│                                                                             │
│  연동 에이전트:                                                              │
│  ├── @Pessimist (리스크 분석)                                                │
│  ├── @Optimist (기회 분석)                                                   │
│  ├── @Planner (계획 수립)                                                    │
│  └── @InfraDataAgent (데이터 검증)                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 호출 방법

```
@DevAgent [스킬] [대상]

예시:
@DevAgent tdd FirewallNode
@DevAgent debug 파싱 오류
@DevAgent brainstorm 새 기능 설계
@DevAgent parallel Frontend Backend
@DevAgent plan PR #5
@DevAgent verify
```

## 스킬별 워크플로우

### 1. TDD 워크플로우
```
@DevAgent tdd [컴포넌트/기능]

실행 순서:
1. 요구사항 확인
2. 테스트 케이스 작성 (RED)
3. 테스트 실행 → 실패 확인
4. 최소 구현 (GREEN)
5. 리팩토링 (REFACTOR)
6. 전체 테스트 통과 확인

규칙: .claude/rules/tdd-rules.md
```

### 2. 디버깅 워크플로우
```
@DevAgent debug [이슈]

실행 순서:
1. 증상 수집 (Symptom Collection)
   - 에러 메시지
   - 재현 단계
   - 예상 vs 실제 동작

2. 가설 수립 (Hypothesis Formation)
   - 가능한 원인 나열
   - 우선순위 정렬

3. 가설 검증 (Hypothesis Testing)
   - 하나씩 검증
   - 로깅 추가

4. 근본 원인 해결 (Root Cause Fix)
   - 원인 해결
   - 회귀 테스트
```

### 3. 브레인스토밍 워크플로우
```
@DevAgent brainstorm [주제]

실행 순서:
1. 요구사항 탐색
   └─→ @Pessimist 연동 (리스크 확인)

2. 제약사항 파악
   └─→ 기술적/비즈니스적 제약

3. 대안 탐색
   └─→ @Optimist 연동 (기회 확인)

4. 결정 및 문서화
   └─→ @Planner 연동 (계획 수립)
```

### 4. 병렬 에이전트 워크플로우
```
@DevAgent parallel [작업1] [작업2] ...

실행 순서:
1. 작업 분석
   - 독립성 확인
   - 공유 리소스 확인

2. 작업 분배
   - Frontend Agent
   - Backend Agent
   - (필요시 추가 에이전트)

3. 병렬 실행
   - 각 에이전트 독립 작업

4. 결과 통합
   - 충돌 해결
   - 통합 테스트
```

### 5. 계획 수립 워크플로우
```
@DevAgent plan [기능/PR]

실행 순서:
1. 목표 정의
2. 성공 기준 설정
3. 단계별 작업 분해 (2-5분 단위)
4. 의존성 파악
5. 병렬 가능 작업 식별

출력: 실행 가능한 계획서
```

### 6. 검증 워크플로우
```
@DevAgent verify

실행 순서:
1. 코드 품질
   - npm run type-check
   - npm run lint
   - npm test

2. 기능 검증
   - 요구사항 충족
   - 엣지 케이스

3. 성능 검증
   - 응답 시간
   - 메모리 사용

4. 빌드 검증
   - npm run build
   - npm run test:e2e

출력: 검증 리포트
```

## 다른 에이전트와의 연동

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DevAgent 연동 다이어그램                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          ┌─────────────┐                                    │
│                          │  @DevAgent  │                                    │
│                          └──────┬──────┘                                    │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                   │
│         │                       │                       │                   │
│         ▼                       ▼                       ▼                   │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐             │
│  │ @Pessimist  │        │  @Optimist  │        │  @Planner   │             │
│  │ (리스크)     │        │  (기회)      │        │  (계획)     │             │
│  └─────────────┘        └─────────────┘        └─────────────┘             │
│         │                       │                       │                   │
│         └───────────────────────┼───────────────────────┘                   │
│                                 │                                           │
│                                 ▼                                           │
│                     ┌───────────────────────┐                               │
│                     │   @InfraDataAgent     │                               │
│                     │   (데이터 검증)        │                               │
│                     └───────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 사용 예시

### 새 노드 컴포넌트 개발
```
1. @DevAgent brainstorm CloudNode 설계
   → 요구사항 정제, 대안 탐색

2. @DevAgent plan CloudNode 구현
   → 단계별 작업 분해

3. @DevAgent tdd CloudNode
   → RED-GREEN-REFACTOR

4. @DevAgent verify
   → 테스트, 빌드 검증
```

### 버그 수정
```
1. @DevAgent debug "3티어 프롬프트 파싱 실패"
   → 4단계 분석

2. @DevAgent tdd 파싱 수정
   → 회귀 테스트 추가

3. @DevAgent verify
   → 전체 검증
```

### 병렬 개발
```
1. @DevAgent parallel "노드 컴포넌트" "파서 로직"
   → Frontend + Backend 동시 개발

2. @DevAgent verify
   → 통합 테스트
```

## 관련 파일

```
.claude/skills/superpowers/
├── tdd.md
├── systematic-debugging.md
├── brainstorming.md
├── parallel-agents.md
├── writing-plans.md
└── verification.md

.claude/rules/
└── tdd-rules.md
```
