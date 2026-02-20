# InfraFlow Agents

## Official Subagents (YAML frontmatter, auto-discovered)

| Agent | Role | Tools | Model |
|-------|------|-------|-------|
| `pessimist` | Risk and problem analysis from devil's advocate perspective | Read, Grep, Glob | sonnet |
| `optimist` | Opportunity and value analysis from positive perspective | Read, Grep, Glob | sonnet |
| `security-reviewer` | Security architecture, threat analysis, OWASP Top 10 | Read, Grep, Glob, Bash | sonnet |
| `infra-data` | Infrastructure component data CRUD with 4-file sync | Read, Edit, Write, Grep, Glob, Bash | inherit |
| `design-reviewer` | Design system compliance verification | Read, Grep, Glob | sonnet |
| `vendor-catalog-crawler` | Vendor catalog crawling + architecture-centric data structuring | Read, Edit, Write, Grep, Glob, Bash, WebFetch | inherit |

## Feedback Workflow

1. `@pessimist` — Risk/problem analysis
2. `@optimist` — Opportunity/strength analysis
3. Synthesize findings and prioritize
4. Create PR-level execution plan
