# InfraFlow Design System

> AI 인프라 시각화 플랫폼을 위한 완전한 디자인 시스템

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         InfraFlow Design System                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  스타일: Dark Mode + Minimalism + AI Native                                 │
│  팔레트: Tech Infrastructure Dark                                           │
│  폰트: Inter + JetBrains Mono                                               │
│                                                                             │
│  기반 스킬:                                                                  │
│  • UI UX Pro Max - Design System                                            │
│  • UI UX Pro Max - UI Styles                                                │
│  • UI UX Pro Max - Color Palettes                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Color System

### 1.1 Background Colors (Dark Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0f172a` | 캔버스 배경, 메인 영역 |
| `bg-secondary` | `#1e293b` | 사이드바, 카드, 노드 |
| `bg-tertiary` | `#334155` | 입력 필드, 호버 상태 |
| `bg-hover` | `#475569` | 호버, 활성 상태 |

### 1.2 Node Category Colors

| Category | Color | Hex | Usage |
|----------|-------|-----|-------|
| Security | Red | `#ef4444` | 방화벽, WAF, IDS/IPS |
| Network | Blue | `#3b82f6` | 라우터, 스위치, LB |
| Compute | Green | `#22c55e` | 서버, 컨테이너, VM |
| Cloud | Purple | `#8b5cf6` | AWS, Azure, GCP |
| Storage | Amber | `#f59e0b` | SAN, NAS, 백업 |
| Auth | Pink | `#ec4899` | LDAP, SSO, IAM |

### 1.3 Flow Animation Colors

| Flow Type | Color | Hex | Animation |
|-----------|-------|-----|-----------|
| Request | Light Blue | `#60a5fa` | 순방향 점선 이동 |
| Response | Light Green | `#4ade80` | 역방향 점선 이동 |
| Blocked | Light Red | `#f87171` | X 표시 + 정지 |
| Encrypted | Light Purple | `#a78bfa` | 굵은 실선 |
| Sync | Light Orange | `#fb923c` | 양방향 이동 |

### 1.4 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#f8fafc` | 제목, 주요 텍스트 |
| `text-secondary` | `#e2e8f0` | 부제목, 레이블 |
| `text-muted` | `#94a3b8` | 설명, 힌트 |
| `text-subtle` | `#64748b` | 비활성화, 메타 정보 |

### 1.5 Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Success | Green | `#22c55e` |
| Warning | Amber | `#f59e0b` |
| Error | Red | `#ef4444` |
| Info | Blue | `#3b82f6` |

---

## 2. Typography

### 2.1 Font Families

```css
/* Sans-serif: UI 전반 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace: 코드, 기술 정보 */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### 2.2 Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | 배지, 메타 정보 |
| `text-sm` | 14px | 노드 레이블, 버튼 |
| `text-base` | 16px | 본문, 입력 |
| `text-lg` | 18px | 섹션 제목 |
| `text-xl` | 20px | 패널 제목 |
| `text-2xl` | 24px | 페이지 제목 |
| `text-3xl` | 30px | 히어로 텍스트 |

### 2.3 Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | 본문 |
| `font-medium` | 500 | 레이블, 버튼 |
| `font-semibold` | 600 | 제목, 강조 |
| `font-bold` | 700 | 히어로, 숫자 |

---

## 3. Spacing

### 3.1 Spacing Scale

| Token | Size | Usage |
|-------|------|-------|
| `space-1` | 4px | 최소 간격 |
| `space-2` | 8px | 인라인 요소 간격 |
| `space-3` | 12px | 컴팩트 패딩 |
| `space-4` | 16px | 기본 패딩 |
| `space-5` | 20px | 카드 패딩 |
| `space-6` | 24px | 섹션 간격 |
| `space-8` | 32px | 큰 섹션 간격 |
| `space-10` | 40px | 레이아웃 간격 |
| `space-12` | 48px | 페이지 간격 |
| `space-16` | 64px | 대형 간격 |

---

## 4. Shadows & Effects

### 4.1 Box Shadows (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | 미묘한 깊이 |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | 카드, 노드 |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | 모달, 드롭다운 |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.6)` | 오버레이 |

### 4.2 Glow Effects (Node Category)

| Category | Glow |
|----------|------|
| Security | `0 0 20px rgba(239, 68, 68, 0.3)` |
| Network | `0 0 20px rgba(59, 130, 246, 0.3)` |
| Compute | `0 0 20px rgba(34, 197, 94, 0.3)` |
| Cloud | `0 0 20px rgba(139, 92, 246, 0.3)` |
| Storage | `0 0 20px rgba(245, 158, 11, 0.3)` |

### 4.3 Glassmorphism (제한적 사용)

```css
.glass {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 5. Border & Radius

### 5.1 Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `radius-sm` | 4px | 배지, 태그 |
| `radius-md` | 6px | 버튼, 입력 |
| `radius-lg` | 8px | 카드, 노드 |
| `radius-xl` | 12px | 모달, 패널 |
| `radius-2xl` | 16px | 대형 카드 |
| `radius-full` | 9999px | 원형, 알약 |

### 5.2 Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `border-default` | `#334155` | 기본 테두리 |
| `border-hover` | `#475569` | 호버 상태 |
| `border-focus` | `#3b82f6` | 포커스 상태 |

---

## 6. Component Styles

### 6.1 Infrastructure Node

```tsx
// 기본 노드 스타일
const baseNodeStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '16px',
  minWidth: '120px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
};

// 카테고리별 확장
const categoryStyles = {
  security: {
    borderColor: '#ef4444',
    boxShadow: '0 0 20px rgba(239,68,68,0.3)',
  },
  network: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 20px rgba(59,130,246,0.3)',
  },
  compute: {
    borderColor: '#22c55e',
    boxShadow: '0 0 20px rgba(34,197,94,0.3)',
  },
  cloud: {
    borderColor: '#8b5cf6',
    boxShadow: '0 0 20px rgba(139,92,246,0.3)',
  },
  storage: {
    borderColor: '#f59e0b',
    boxShadow: '0 0 20px rgba(245,158,11,0.3)',
  },
  auth: {
    borderColor: '#ec4899',
    boxShadow: '0 0 20px rgba(236,72,153,0.3)',
  },
};
```

### 6.2 Edge Styles

```tsx
// 정적 엣지
const staticEdgeStyle = {
  stroke: '#334155',
  strokeWidth: 2,
};

// 애니메이션 엣지
const animatedEdgeStyles = {
  request: {
    stroke: '#60a5fa',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'dash 0.5s linear infinite',
  },
  response: {
    stroke: '#4ade80',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'dash 0.5s linear infinite reverse',
  },
  blocked: {
    stroke: '#f87171',
    strokeWidth: 3,
  },
  encrypted: {
    stroke: '#a78bfa',
    strokeWidth: 3,
  },
  sync: {
    stroke: '#fb923c',
    strokeWidth: 2,
    strokeDasharray: '10,5',
  },
};
```

### 6.3 Button Styles

```tsx
// Primary Button
const primaryButton = {
  background: '#3b82f6',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 500,
  hover: {
    background: '#2563eb',
  },
};

// Secondary Button
const secondaryButton = {
  background: '#334155',
  color: '#f8fafc',
  border: '1px solid #475569',
  padding: '8px 16px',
  borderRadius: '6px',
  hover: {
    background: '#475569',
  },
};

// Ghost Button
const ghostButton = {
  background: 'transparent',
  color: '#94a3b8',
  padding: '8px 16px',
  borderRadius: '6px',
  hover: {
    background: '#334155',
    color: '#f8fafc',
  },
};
```

### 6.4 Input Styles

```tsx
const inputStyle = {
  background: '#334155',
  color: '#f8fafc',
  border: '1px solid #475569',
  borderRadius: '6px',
  padding: '8px 12px',
  placeholder: {
    color: '#64748b',
  },
  focus: {
    borderColor: '#3b82f6',
    outline: 'none',
    boxShadow: '0 0 0 2px rgba(59,130,246,0.2)',
  },
};
```

---

## 7. Animation

### 7.1 Transitions

```css
/* 기본 트랜지션 */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 7.2 Keyframes

```css
/* 흐름 애니메이션 */
@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

/* 펄스 애니메이션 (상태 표시) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 페이드 인 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## 8. Responsive Breakpoints

| Token | Size | Usage |
|-------|------|-------|
| `sm` | 640px | 모바일 랜드스케이프 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크탑 |
| `xl` | 1280px | 표준 데스크탑 |
| `2xl` | 1536px | 대형 모니터 |

---

## 9. Anti-Patterns (피해야 할 것)

```
❌ 밝은 배경에 밝은 텍스트 (낮은 대비)
❌ 7개 이상의 액센트 색상 사용
❌ 일관성 없는 여백/패딩
❌ 12px 미만의 폰트 크기
❌ 4.5:1 미만의 대비율
❌ 과도한 그림자/블러 효과
❌ 불필요한 애니메이션
❌ 비표준 border-radius 조합
```

---

## 10. Usage Examples

### 10.1 Node Component

```tsx
import { cn } from '@/lib/utils';

const InfraNode = ({ type, label, icon, selected }) => (
  <div className={cn(
    // Base
    "min-w-[120px] p-4 rounded-lg",
    "bg-infra-bg-secondary border",
    "shadow-md transition-all duration-200",
    // Hover
    "hover:shadow-lg hover:scale-105",
    // Selected
    selected && "ring-2 ring-blue-500",
    // Category
    type === 'security' && "border-infra-node-security shadow-glow-security",
    type === 'network' && "border-infra-node-network shadow-glow-network",
    type === 'compute' && "border-infra-node-compute shadow-glow-compute",
    type === 'cloud' && "border-infra-node-cloud shadow-glow-cloud",
    type === 'storage' && "border-infra-node-storage",
    type === 'auth' && "border-infra-node-auth",
  )}>
    <div className="flex items-center gap-2">
      <span className={cn("text-lg", `text-infra-node-${type}`)}>{icon}</span>
      <span className="text-sm font-medium text-infra-text-primary">{label}</span>
    </div>
  </div>
);
```

### 10.2 Prompt Panel

```tsx
const PromptPanel = () => (
  <div className="bg-infra-bg-secondary border border-slate-700 rounded-xl p-4">
    <div className="relative">
      <input
        type="text"
        placeholder="인프라 아키텍처를 설명해주세요..."
        className={cn(
          "w-full px-4 py-3 pr-12",
          "bg-infra-bg-tertiary rounded-full",
          "border border-slate-600",
          "text-infra-text-primary placeholder:text-slate-500",
          "focus:outline-none focus:border-blue-500",
          "transition-all duration-200"
        )}
      />
      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
        <SendIcon className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
);
```

---

*이 디자인 시스템은 UI UX Pro Max 스킬을 기반으로 InfraFlow에 최적화되었습니다.*
