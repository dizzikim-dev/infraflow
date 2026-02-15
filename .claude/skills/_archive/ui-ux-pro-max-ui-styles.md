# UI UX Pro Max - UI Styles Skill

## Overview
67개 UI 스타일 중 InfraFlow에 적합한 스타일을 선택하고 적용합니다.

## Activation
- `/ui-style [스타일명]` 명령으로 활성화
- 컴포넌트 생성 시 자동 적용

## Recommended Styles for InfraFlow

### Primary: Dark Mode + Minimalism
```
┌─────────────────────────────────────────────────────────────┐
│  Dark Mode + Minimalism                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  특징:                                                      │
│  • 어두운 배경 (#0f172a ~ #1e293b)                          │
│  • 깔끔한 라인과 형태                                       │
│  • 최소한의 장식                                            │
│  • 높은 대비의 액센트 색상                                  │
│  • 정보 밀도 최적화                                         │
│                                                             │
│  적용 이유:                                                 │
│  • 인프라 모니터링 도구의 표준                              │
│  • 장시간 사용 시 눈 피로 감소                              │
│  • 노드/엣지 색상이 잘 돋보임                               │
│  • 전문적인 느낌                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Secondary: AI Native UI
```
┌─────────────────────────────────────────────────────────────┐
│  AI Native UI                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  특징:                                                      │
│  • 채팅/프롬프트 중심 인터페이스                            │
│  • 자연스러운 상호작용                                      │
│  • 점진적 정보 공개                                         │
│  • 컨텍스트 인식 UI                                         │
│                                                             │
│  적용 영역:                                                 │
│  • 프롬프트 입력 패널                                       │
│  • AI 응답 표시 영역                                        │
│  • 제안/자동완성 UI                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Accent: Glassmorphism (제한적 사용)
```
┌─────────────────────────────────────────────────────────────┐
│  Glassmorphism (Accent Only)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  특징:                                                      │
│  • 반투명 배경                                              │
│  • 블러 효과                                                │
│  • 미묘한 테두리                                            │
│                                                             │
│  적용 영역 (제한적):                                        │
│  • 툴팁                                                     │
│  • 모달/오버레이                                            │
│  • 정책 표시 패널                                           │
│                                                             │
│  CSS:                                                       │
│  background: rgba(30, 41, 59, 0.8);                        │
│  backdrop-filter: blur(12px);                               │
│  border: 1px solid rgba(255, 255, 255, 0.1);               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Style Application by Component

### Canvas Area (다이어그램 영역)
```
스타일: Dark Mode + Minimalism
├── 배경: #0f172a (Slate 900)
├── 그리드: subtle dots (#334155)
├── 노드: 카테고리별 색상 테두리
└── 엣지: 깔끔한 곡선
```

### Sidebar (사이드바)
```
스타일: Dark Mode
├── 배경: #1e293b (Slate 800)
├── 구분선: #334155 (Slate 700)
├── 호버: #334155
└── 선택: Primary Blue 강조
```

### Prompt Panel (프롬프트 패널)
```
스타일: AI Native UI
├── 입력창: 둥근 모서리, 미묘한 테두리
├── 제안 목록: 자연스러운 애니메이션
├── 전송 버튼: Primary Blue
└── 히스토리: 컴팩트 카드
```

### Policy Overlay (정책 오버레이)
```
스타일: Glassmorphism
├── 배경: rgba(30, 41, 59, 0.85)
├── 블러: 12px
├── 테두리: rgba(255, 255, 255, 0.1)
└── 그림자: xl
```

### Control Panel (컨트롤 패널)
```
스타일: Minimalism
├── 버튼: 아이콘 + 툴팁
├── 슬라이더: 미니멀 디자인
├── 토글: 깔끔한 스위치
└── 배지: 작고 명확한
```

## Style Tokens

### Tailwind Config Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // InfraFlow Custom Colors
        'infra-bg': {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        'infra-node': {
          security: '#ef4444',
          network: '#3b82f6',
          compute: '#22c55e',
          cloud: '#8b5cf6',
          storage: '#f59e0b',
          auth: '#ec4899',
        },
        'infra-flow': {
          request: '#60a5fa',
          response: '#4ade80',
          blocked: '#f87171',
          encrypted: '#a78bfa',
          sync: '#fb923c',
        },
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glow-security': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-network': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-compute': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-cloud': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
  },
};
```

## Component Examples

### Node Component
```tsx
// Dark Mode + Minimalism 스타일 적용
const InfraNode = ({ type, label, icon }) => (
  <div className={cn(
    // Base
    "min-w-[120px] p-4 rounded-lg",
    "bg-infra-bg-secondary border",
    "shadow-md transition-all duration-200",
    // Hover
    "hover:shadow-lg hover:scale-105",
    // Category-specific
    type === 'security' && "border-infra-node-security shadow-glow-security",
    type === 'network' && "border-infra-node-network shadow-glow-network",
    type === 'compute' && "border-infra-node-compute shadow-glow-compute",
    type === 'cloud' && "border-infra-node-cloud shadow-glow-cloud",
  )}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-slate-50">{label}</span>
    </div>
  </div>
);
```

### Prompt Input
```tsx
// AI Native UI 스타일 적용
const PromptInput = () => (
  <div className="relative">
    <input
      type="text"
      placeholder="인프라 아키텍처를 설명해주세요..."
      className={cn(
        "w-full px-4 py-3 pr-12",
        "bg-infra-bg-tertiary rounded-full",
        "border border-slate-600",
        "text-slate-50 placeholder:text-slate-500",
        "focus:outline-none focus:border-blue-500",
        "transition-all duration-200"
      )}
    />
    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full">
      <SendIcon className="w-4 h-4 text-white" />
    </button>
  </div>
);
```

### Policy Tooltip
```tsx
// Glassmorphism 스타일 적용
const PolicyTooltip = ({ rules }) => (
  <div className={cn(
    "absolute p-4 rounded-xl",
    "bg-slate-800/85 backdrop-blur-glass",
    "border border-white/10",
    "shadow-xl"
  )}>
    <h4 className="text-sm font-semibold text-slate-50 mb-2">
      Policy Rules
    </h4>
    <ul className="space-y-1">
      {rules.map(rule => (
        <li key={rule.id} className="text-sm text-slate-300">
          {rule.description}
        </li>
      ))}
    </ul>
  </div>
);
```
