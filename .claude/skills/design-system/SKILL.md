---
name: design-system
description: "InfraFlow 디자인 시스템 생성 및 관리. 색상, 타이포그래피, 여백, 컴포넌트 스타일 정의."
user-invocable: true
---

## Design System: $ARGUMENTS

### InfraFlow Design Tokens

#### Colors
```css
/* Background (Dark Mode) */
--infra-bg-primary: #0f172a;
--infra-bg-secondary: #1e293b;
--infra-bg-tertiary: #334155;
--infra-bg-hover: #475569;

/* Node Categories */
--infra-node-security: #ef4444;
--infra-node-network: #3b82f6;
--infra-node-compute: #22c55e;
--infra-node-cloud: #8b5cf6;
--infra-node-storage: #f59e0b;
--infra-node-auth: #ec4899;

/* Flow Animation */
--infra-flow-request: #60a5fa;
--infra-flow-response: #4ade80;
--infra-flow-blocked: #f87171;
--infra-flow-encrypted: #a78bfa;
--infra-flow-sync: #fb923c;

/* Text */
--infra-text-primary: #f8fafc;
--infra-text-secondary: #e2e8f0;
--infra-text-muted: #94a3b8;
```

#### Typography
- UI: Inter (font-sans)
- Code: JetBrains Mono (font-mono)
- Sizes: 12/14/16/18/20/24px

#### Spacing
- 4px-based scale: 4/8/12/16/24/32/48px

#### Transitions
- Fast: 150ms, Base: 200ms, Slow: 300ms

### Component Patterns
- Nodes: `infra-node infra-node-{category}`
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`
- Inputs: `input-default`, `prompt-input`
- Panels: `glass-panel`

### Accessibility
- WCAG AA contrast ratio (4.5:1 minimum)
- Focus indicators on interactive elements
- Keyboard navigation support
