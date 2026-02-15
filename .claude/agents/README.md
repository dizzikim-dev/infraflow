# InfraFlow Agents

## Official Subagents (YAML frontmatter, auto-discovered)

| Agent | Role | Tools | Model |
|-------|------|-------|-------|
| `pessimist` | 비관적 리스크/문제점 분석 | Read, Grep, Glob | sonnet |
| `optimist` | 낙관적 기회/가치 분석 | Read, Grep, Glob | sonnet |
| `security-reviewer` | 보안 아키텍처/위협 분석 | Read, Grep, Glob, Bash | sonnet |
| `infra-data` | 인프라 장비 데이터 CRUD | Read, Edit, Write, Grep, Glob, Bash | inherit |
| `design-reviewer` | 디자인 시스템 준수 검증 | Read, Grep, Glob | sonnet |

## Reference Documents (`_reference/`)

Non-subagent files kept for reference:

- `architecture.md` - 아키텍처 설계 프롬프트
- `document.md` - 문서/시각화 프롬프트
- `meeting.md` - 미팅 준비 프롬프트
- `isp-alignment.md` - ISP 정합성 프롬프트
- `tech-review.md` - 기술 검토 프롬프트
- `feedback-analyzer.md` - 피드백 종합 분석
- `planner.md` - 실행 계획 수립
- `dev-agent.md` - 개발 에이전트

## Feedback Workflow

1. `@pessimist` - 리스크/문제점 분석
2. `@optimist` - 기회/장점 분석
3. 종합 분석 및 우선순위화
4. PR 단위 실행 계획 수립
