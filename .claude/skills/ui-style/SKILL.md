---
name: ui-style
description: "InfraFlow UI style application. Dark Mode, Minimalism, AI Native, Glassmorphism."
user-invocable: true
---

## UI Style Application: $ARGUMENTS

### Available Styles

#### Primary: Dark Mode + Minimalism
- Dark background (#0f172a ~ #1e293b)
- Clean lines and shapes
- Minimal decoration
- High contrast accent colors
- Optimized information density

#### Secondary: AI Native UI
- Chat/prompt-centered interface
- Natural interaction patterns
- Progressive information disclosure
- Context-aware UI

#### Accent: Glassmorphism (limited use)
- Semi-transparent background: `rgba(30, 41, 59, 0.85)`
- Backdrop blur: `backdrop-blur-[12px]`
- Subtle border: `border border-white/10`
- Use only for: tooltips, modals, overlays

### Style by Component Area

| Area | Style | Background |
|------|-------|------------|
| Canvas | Dark Mode + Minimal | #0f172a |
| Sidebar | Dark Mode | #1e293b |
| Prompt Panel | AI Native | Tertiary |
| Policy Overlay | Glassmorphism | rgba |
| Control Panel | Minimalism | Transparent |

### Tailwind Token Usage
```tsx
// Node: bg-infra-bg-secondary border-infra-node-{category}
// Text: text-infra-text-primary, text-infra-text-muted
// Flow: stroke: var(--infra-flow-request)
```
