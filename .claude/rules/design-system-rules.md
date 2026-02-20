---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# Design System Rules

> UI/UX design system rules based on Dark Mode + Minimalism + AI Native preset.

## Rule IDs

| ID | Rule | Priority |
|----|------|----------|
| DS-001 | Use color tokens | P0 (Required) |
| DS-002 | Node category colors | P0 (Required) |
| DS-003 | Dark mode first | P0 (Required) |
| DS-004 | Contrast ratio compliance | P0 (Required) |
| DS-005 | Typography consistency | P1 (Recommended) |
| DS-006 | Spacing scale | P1 (Recommended) |
| DS-007 | Animation consistency | P1 (Recommended) |
| DS-008 | Component style compliance | P0 (Required) |

---

## DS-001: Use Color Tokens

Use CSS variables or Tailwind tokens instead of hardcoded color values.

```tsx
// Wrong
<div style={{ background: '#1e293b' }}>
<div className="bg-[#1e293b]">

// Correct
<div className="bg-infra-bg-secondary">
<div style={{ background: 'var(--infra-bg-secondary)' }}>
```

## DS-002: Node Category Colors

Infrastructure nodes must use their category color:

| Category | Color | Class |
|----------|-------|-------|
| Security | Red #ef4444 | `border-infra-node-security` |
| Network | Blue #3b82f6 | `border-infra-node-network` |
| Compute | Green #22c55e | `border-infra-node-compute` |
| Cloud | Purple #8b5cf6 | `border-infra-node-cloud` |
| Storage | Amber #f59e0b | `border-infra-node-storage` |
| Auth | Pink #ec4899 | `border-infra-node-auth` |

## DS-003: Dark Mode First

All UI elements default to dark mode:

```
Backgrounds: #0f172a (primary) → #1e293b (secondary) → #334155 (tertiary) → #475569 (hover)
Text: #f8fafc (primary) → #e2e8f0 (secondary) → #94a3b8 (muted) → #64748b (subtle)
```

## DS-004: Contrast Ratio

Maintain WCAG AA minimum (4.5:1 for normal text, 3:1 for large text):

```
Pass: #f8fafc on #0f172a → 15.8:1
Pass: #f8fafc on #1e293b → 12.1:1
Pass: #94a3b8 on #0f172a → 6.3:1
Large text only: #3b82f6 on #1e293b → 4.2:1
```

## DS-005: Typography

```
Font families: Inter (UI), JetBrains Mono (code)
Allowed sizes: 12px / 14px / 16px / 18px / 20px / 24px only
No non-standard sizes (13px, 17px, etc.)
```

## DS-006: Spacing Scale

Use 4px-based spacing scale only:

```
4 / 8 / 12 / 16 / 24 / 32 / 48px
Use: p-1, p-2, p-3, p-4, p-6, p-8, p-12
Never: p-[5px], m-[11px], p-[13px]
```

## DS-007: Animation

```
Fast: 150ms ease
Base: 200ms ease (default)
Slow: 300ms ease
Never exceed 500ms for any transition
```

## DS-008: Component Styles

```tsx
// Nodes
<div className="infra-node infra-node-{category}">

// Buttons
<button className="btn-primary">    // Primary action
<button className="btn-secondary">  // Secondary action
<button className="btn-ghost">      // Tertiary action

// Inputs
<input className="input-default" />
<input className="prompt-input" />

// Panels
<div className="glass-panel">
```

## Anti-Patterns

- Hardcoded color values
- More than 7 accent colors
- Contrast ratio below 4.5:1
- Non-standard font sizes or spacing
- Transitions over 500ms
- Inconsistent border radius
