# UI UX Pro Max - Color Palettes Skill

## Overview
96개 색상 팔레트 중 InfraFlow에 적합한 팔레트를 선택하고 적용합니다.

## Activation
- `/color-palette [팔레트명]` 명령으로 활성화
- 디자인 시스템 생성 시 자동 적용

## InfraFlow Color Palette

### Primary Palette: Tech Infrastructure Dark

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tech Infrastructure Dark Palette                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Background Gradient                                                │
│  ┌─────────┬─────────┬─────────┬─────────┐                         │
│  │ #0f172a │ #1e293b │ #334155 │ #475569 │                         │
│  │ Primary │Secondary│Tertiary │ Hover   │                         │
│  └─────────┴─────────┴─────────┴─────────┘                         │
│                                                                     │
│  Accent Colors (Node Categories)                                    │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐     │
│  │ #ef4444 │ #3b82f6 │ #22c55e │ #8b5cf6 │ #f59e0b │ #ec4899 │     │
│  │Security │ Network │ Compute │ Cloud   │ Storage │  Auth   │     │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘     │
│                                                                     │
│  Flow Animation Colors                                              │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐               │
│  │ #60a5fa │ #4ade80 │ #f87171 │ #a78bfa │ #fb923c │               │
│  │ Request │Response │ Blocked │Encrypted│  Sync   │               │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘               │
│                                                                     │
│  Text & UI                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┐                         │
│  │ #f8fafc │ #e2e8f0 │ #94a3b8 │ #64748b │                         │
│  │ Primary │Secondary│ Muted   │ Subtle  │                         │
│  └─────────┴─────────┴─────────┴─────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Semantic Colors

```
Status Colors
─────────────
Success  : #22c55e (Green 500)  → 연결됨, 정상, 활성
Warning  : #f59e0b (Amber 500)  → 주의, 부하 높음
Error    : #ef4444 (Red 500)    → 오류, 차단됨, 장애
Info     : #3b82f6 (Blue 500)   → 정보, 선택됨

Interactive Colors
──────────────────
Hover    : #475569 (Slate 600)  → 마우스 오버
Focus    : #3b82f6 (Blue 500)   → 포커스 링
Active   : #1d4ed8 (Blue 700)   → 클릭/활성
Disabled : #334155 (Slate 700)  → 비활성화
```

### Color Usage Guidelines

```
┌─────────────────────────────────────────────────────────────────────┐
│  Color Usage Matrix                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Component          Primary     Border      Text        Icon        │
│  ────────────────   ──────────  ──────────  ──────────  ──────────  │
│  Canvas Background  #0f172a     -           -           -           │
│  Sidebar            #1e293b     #334155     #f8fafc     #94a3b8     │
│  Node (Security)    #1e293b     #ef4444     #f8fafc     #ef4444     │
│  Node (Network)     #1e293b     #3b82f6     #f8fafc     #3b82f6     │
│  Node (Compute)     #1e293b     #22c55e     #f8fafc     #22c55e     │
│  Node (Cloud)       #1e293b     #8b5cf6     #f8fafc     #8b5cf6     │
│  Node (Storage)     #1e293b     #f59e0b     #f8fafc     #f59e0b     │
│  Button Primary     #3b82f6     -           #ffffff     #ffffff     │
│  Button Secondary   #334155     #475569     #f8fafc     #f8fafc     │
│  Input              #334155     #475569     #f8fafc     -           │
│  Tooltip            #1e293bcc   #ffffff1a   #f8fafc     -           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Accessibility Compliance

```
Contrast Ratios (WCAG AA: 4.5:1 required)
─────────────────────────────────────────
#f8fafc on #0f172a  →  15.8:1  ✅
#f8fafc on #1e293b  →  12.1:1  ✅
#94a3b8 on #0f172a  →   6.3:1  ✅
#94a3b8 on #1e293b  →   4.8:1  ✅
#64748b on #0f172a  →   4.0:1  ⚠️ (Large text only)

Node Colors on #1e293b
──────────────────────
#ef4444 (Security)  →   4.6:1  ✅
#3b82f6 (Network)   →   4.2:1  ⚠️ (Large text only)
#22c55e (Compute)   →   5.8:1  ✅
#8b5cf6 (Cloud)     →   3.8:1  ⚠️ (Large text only)
#f59e0b (Storage)   →   6.5:1  ✅
```

### CSS Variables Export

```css
:root {
  /* Background */
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

  /* Node Category Light (for fills) */
  --infra-node-security-light: #fef2f2;
  --infra-node-network-light: #eff6ff;
  --infra-node-compute-light: #f0fdf4;
  --infra-node-cloud-light: #f5f3ff;
  --infra-node-storage-light: #fffbeb;
  --infra-node-auth-light: #fdf2f8;

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
  --infra-text-subtle: #64748b;

  /* Border */
  --infra-border-default: #334155;
  --infra-border-hover: #475569;
  --infra-border-focus: #3b82f6;

  /* Status */
  --infra-status-success: #22c55e;
  --infra-status-warning: #f59e0b;
  --infra-status-error: #ef4444;
  --infra-status-info: #3b82f6;
}
```

### Tailwind Palette Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        infra: {
          bg: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
            hover: '#475569',
          },
          node: {
            security: '#ef4444',
            network: '#3b82f6',
            compute: '#22c55e',
            cloud: '#8b5cf6',
            storage: '#f59e0b',
            auth: '#ec4899',
          },
          flow: {
            request: '#60a5fa',
            response: '#4ade80',
            blocked: '#f87171',
            encrypted: '#a78bfa',
            sync: '#fb923c',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#e2e8f0',
            muted: '#94a3b8',
            subtle: '#64748b',
          },
        },
      },
    },
  },
};
```

### Usage Examples

```tsx
// Node with category color
<div className="bg-infra-bg-secondary border-infra-node-security">
  <span className="text-infra-text-primary">Firewall</span>
</div>

// Flow animation
<path
  stroke="var(--infra-flow-request)"
  className="animate-flow"
/>

// Status indicator
<Badge className="bg-infra-status-success text-white">
  Connected
</Badge>
```
