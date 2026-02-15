# InfraFlow - AI Infrastructure Visualization Platform

> Prompt-driven infrastructure architecture visualization with animated data flows.

## Build & Test Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npx tsc --noEmit     # Type check
npx vitest run       # Unit tests
npx vitest run --coverage  # With coverage
npm run lint         # ESLint
```

## Code Rules

- **Language**: TypeScript strict, Next.js App Router
- **Naming**: Components `PascalCase.tsx`, hooks `camelCase.ts`, constants `UPPER_SNAKE_CASE`, types `PascalCase` + suffix
- **Commits**: `feat:` / `fix:` / `refactor:` / `style:` / `docs:` / `test:`
- **Styling**: Tailwind CSS with design tokens (no hardcoded colors). See `.claude/rules/design-system-rules.md`
- **TDD**: Write test first, then implement. See `.claude/rules/tdd-rules.md`

## Verification Loop (IMPORTANT)

After every code change, run:
```bash
npx tsc --noEmit && npx vitest run
```
Do NOT declare work complete until both pass.

## Key Architecture

```
src/
├── components/nodes/    # Infra node components (React Flow)
├── components/edges/    # Edge/connection components
├── components/panels/   # UI panels (prompt, sidebar, control)
├── lib/parser/          # Prompt -> infra spec parser
├── lib/data/            # Infrastructure database
├── lib/layout/          # Auto-layout engine
├── lib/animation/       # Animation engine
├── lib/export/          # Export (Terraform, K8s, PlantUML)
├── hooks/               # Custom React hooks
├── types/               # TypeScript types (infra.ts)
└── app/api/             # API routes
```

## Infrastructure Data Changes (MUST)

When adding/modifying/deleting infrastructure components, update ALL 4 files:

1. `src/types/infra.ts` - Type definition
2. `src/lib/data/infrastructureDB.ts` - Component data
3. `src/lib/parser/patterns.ts` - Parsing patterns
4. `docs/INFRASTRUCTURE_COMPONENTS.md` - Documentation

Rules: `.claude/rules/infra-data-rules.md`

## Node Categories & Colors

| Category | Color | Border Class |
|----------|-------|--------------|
| Security | Red #ef4444 | `border-infra-node-security` |
| Network | Blue #3b82f6 | `border-infra-node-network` |
| Compute | Green #22c55e | `border-infra-node-compute` |
| Cloud | Purple #8b5cf6 | `border-infra-node-cloud` |
| Storage | Amber #f59e0b | `border-infra-node-storage` |
| Auth | Pink #ec4899 | `border-infra-node-auth` |

## Flow Animation Types

| Type | Color | Style |
|------|-------|-------|
| Request | #60a5fa | Forward dashed |
| Response | #4ade80 | Reverse dashed |
| Blocked | #f87171 | Stop + X mark |
| Encrypted | #a78bfa | Bold solid |
| Sync | #fb923c | Bidirectional |

## Reference Documents

- `docs/reference/project-vision.md` - Vision, goals, component library
- `docs/reference/tech-stack.md` - Tech stack, agent roles
- `docs/reference/development-roadmap.md` - Phase 1-3 roadmap
- `docs/reference/skill-agent-integration.md` - Skill/agent integration workflows
