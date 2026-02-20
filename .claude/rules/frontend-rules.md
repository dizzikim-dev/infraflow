---
paths:
  - "src/components/**/*.tsx"
  - "src/hooks/**/*.ts"
---

# Frontend Rules

- React 19: `useRef` requires initial value (`useRef<T>(undefined)`)
- Use design tokens, no hardcoded colors (DS-001)
- Tailwind dynamic classes must be registered in safelist
- Node components use `infra-node infra-node-{category}` class (DS-002)
- WCAG AA contrast ratio 4.5:1 minimum (DS-004)
- Spacing uses 4px-based scale only (DS-006)
- Transitions must not exceed 300ms (DS-007)
- React Flow nodes use `NodeProps` type
- All user-facing text must be bilingual (English + Korean)
