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

## Agent Output Rules

**IMPORTANT**: Every agent MUST produce a written document when completing a non-trivial task.

1. **Always write results to `docs/plans/`** — After completing analysis, review, or planning work, write a structured document to `docs/plans/YYYY-MM-DD-<descriptive-name>.md`.
2. **Document format** — Include: date, participants (which agents), executive summary, detailed findings, and actionable next steps.
3. **Never deliver results only verbally** — Verbal summaries are fine for communication, but the authoritative output must be a file that persists across sessions.
4. **Naming convention**: `docs/plans/YYYY-MM-DD-<kebab-case-topic>.md` (e.g., `2026-02-20-comprehensive-project-review.md`)
5. **Cross-reference** — If the document proposes a roadmap or plan, link to relevant source files and prior documents.

## Feedback Workflow

1. `@pessimist` — Risk/problem analysis
2. `@optimist` — Opportunity/strength analysis
3. Synthesize findings and prioritize
4. Create PR-level execution plan
5. **Write consolidated report** to `docs/plans/YYYY-MM-DD-<topic>.md`
