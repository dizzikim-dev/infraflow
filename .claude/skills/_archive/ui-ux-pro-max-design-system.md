# UI UX Pro Max - Design System Skill

## Overview
AI 기반 디자인 시스템 생성 및 관리 스킬입니다.

## Activation
- `/design-system` 명령으로 활성화
- UI 작업 시 자동 적용

## Design System Structure

### 1. Foundation
```
Design System
├── Colors (색상)
├── Typography (타이포그래피)
├── Spacing (여백)
├── Shadows (그림자)
├── Border Radius (모서리)
└── Breakpoints (반응형)
```

### 2. Components
```
Components
├── Atoms (원자)
│   ├── Button
│   ├── Input
│   ├── Icon
│   └── Badge
├── Molecules (분자)
│   ├── Card
│   ├── FormField
│   └── Tooltip
└── Organisms (유기체)
    ├── Header
    ├── Sidebar
    └── DataTable
```

## InfraFlow Design System

### Color Palette
```css
/* Primary - Infrastructure Blue */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-900: #1e3a8a;

/* Node Category Colors */
--color-security: #ef4444;     /* Red - 보안장비 */
--color-network: #3b82f6;      /* Blue - 네트워크 */
--color-compute: #22c55e;      /* Green - 서버/컴퓨팅 */
--color-cloud: #8b5cf6;        /* Purple - 클라우드 */
--color-storage: #f59e0b;      /* Amber - 스토리지 */
--color-auth: #ec4899;         /* Pink - 인증/접근 */

/* Flow Animation Colors */
--color-flow-request: #60a5fa;  /* Light Blue */
--color-flow-response: #4ade80; /* Light Green */
--color-flow-blocked: #f87171;  /* Light Red */
--color-flow-encrypted: #a78bfa;/* Light Purple */
--color-flow-sync: #fb923c;     /* Light Orange */

/* Background (Dark Mode) */
--color-bg-primary: #0f172a;    /* Slate 900 */
--color-bg-secondary: #1e293b;  /* Slate 800 */
--color-bg-tertiary: #334155;   /* Slate 700 */

/* Text */
--color-text-primary: #f8fafc;  /* Slate 50 */
--color-text-secondary: #94a3b8;/* Slate 400 */
--color-text-muted: #64748b;    /* Slate 500 */

/* Border */
--color-border: #334155;        /* Slate 700 */
--color-border-focus: #3b82f6;  /* Primary 500 */
```

### Typography
```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Size */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weight */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Height */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Shadows
```css
/* Dark Mode Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6);

/* Glow Effects (for nodes) */
--glow-security: 0 0 20px rgba(239, 68, 68, 0.3);
--glow-network: 0 0 20px rgba(59, 130, 246, 0.3);
--glow-compute: 0 0 20px rgba(34, 197, 94, 0.3);
--glow-cloud: 0 0 20px rgba(139, 92, 246, 0.3);
```

### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
--radius-2xl: 1rem;    /* 16px */
--radius-full: 9999px;
```

## Node Component Styles

### Base Node Style
```typescript
const baseNodeStyle = {
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  minWidth: '120px',
  boxShadow: 'var(--shadow-md)',
};
```

### Category-Specific Styles
```typescript
const nodeStyles = {
  security: {
    ...baseNodeStyle,
    borderColor: 'var(--color-security)',
    boxShadow: 'var(--glow-security)',
  },
  network: {
    ...baseNodeStyle,
    borderColor: 'var(--color-network)',
    boxShadow: 'var(--glow-network)',
  },
  compute: {
    ...baseNodeStyle,
    borderColor: 'var(--color-compute)',
    boxShadow: 'var(--glow-compute)',
  },
  cloud: {
    ...baseNodeStyle,
    borderColor: 'var(--color-cloud)',
    boxShadow: 'var(--glow-cloud)',
  },
  storage: {
    ...baseNodeStyle,
    borderColor: 'var(--color-storage)',
  },
};
```

## Edge Styles

### Static Edge
```typescript
const staticEdgeStyle = {
  stroke: 'var(--color-border)',
  strokeWidth: 2,
};
```

### Animated Edge
```typescript
const animatedEdgeStyles = {
  request: {
    stroke: 'var(--color-flow-request)',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'dash 0.5s linear infinite',
  },
  response: {
    stroke: 'var(--color-flow-response)',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'dash 0.5s linear infinite reverse',
  },
  blocked: {
    stroke: 'var(--color-flow-blocked)',
    strokeWidth: 3,
    strokeDasharray: '10,10',
  },
  encrypted: {
    stroke: 'var(--color-flow-encrypted)',
    strokeWidth: 3,
  },
};
```

## Anti-Patterns to Avoid

```
❌ 밝은 배경에 밝은 텍스트
❌ 너무 많은 색상 사용 (7개 이상)
❌ 일관성 없는 여백
❌ 너무 작은 폰트 (12px 미만)
❌ 낮은 대비 (4.5:1 미만)
❌ 과도한 그림자/효과
❌ 불필요한 애니메이션
```
