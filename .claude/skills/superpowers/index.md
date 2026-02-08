# Superpowers Skills Index

## Overview
AI 에이전트를 위한 개발 워크플로우 스킬 모음입니다.

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| [TDD](./tdd.md) | `/tdd` | RED-GREEN-REFACTOR 테스트 주도 개발 |
| [Debugging](./systematic-debugging.md) | `/debug` | 4단계 체계적 디버깅 |
| [Brainstorming](./brainstorming.md) | `/brainstorm` | 소크라테스식 설계 정제 |
| [Parallel Agents](./parallel-agents.md) | `/parallel` | 병렬 에이전트 작업 분배 |
| [Writing Plans](./writing-plans.md) | `/plan` | 실행 가능한 계획 수립 |
| [Verification](./verification.md) | `/verify` | 완료 전 검증 |

## Quick Reference

### Development Workflow
```
1. /brainstorm [기능]     → 요구사항 정제
2. /plan [기능]           → 단계별 계획 수립
3. /parallel [작업들]     → 병렬 작업 분배
4. /tdd [기능]            → RED-GREEN-REFACTOR
5. /verify                → 완료 전 검증
```

### Debugging Workflow
```
1. /debug [이슈]          → 증상 수집
                          → 가설 수립
                          → 가설 검증
                          → 근본 원인 해결
```

## Integration with InfraFlow Agents

```
Superpowers Skill          InfraFlow Agent
─────────────────          ───────────────
brainstorming         ←──→ Pessimist + Optimist
writing-plans         ←──→ Planner Agent
verification          ←──→ InfraDataAgent
```

## Configuration

이 스킬들은 `.claude/CLAUDE.md`에서 활성화됩니다:

```markdown
## Superpowers 스킬 활성화

모든 개발 작업에 적용:
- TDD: 새 기능에 테스트 먼저 작성
- 체계적 디버깅: 4단계 분석 적용
- 병렬 에이전트: Frontend/Backend 동시 개발
```

## Source

Based on [obra/superpowers](https://github.com/obra/superpowers)
