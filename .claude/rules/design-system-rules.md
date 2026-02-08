# Design System Rules

> UI UX Pro Max 기반 디자인 시스템 규칙

## 규칙 ID 체계

| ID | 규칙명 | 중요도 |
|----|--------|--------|
| DS-001 | 색상 토큰 사용 | P0 (필수) |
| DS-002 | 노드 카테고리 색상 | P0 (필수) |
| DS-003 | 다크모드 우선 | P0 (필수) |
| DS-004 | 대비율 준수 | P0 (필수) |
| DS-005 | 타이포그래피 일관성 | P1 (권장) |
| DS-006 | 여백 스케일 사용 | P1 (권장) |
| DS-007 | 애니메이션 일관성 | P1 (권장) |
| DS-008 | 컴포넌트 스타일 준수 | P0 (필수) |

---

## DS-001: 색상 토큰 사용

**규칙**: 하드코딩된 색상값 대신 CSS 변수 또는 Tailwind 토큰을 사용한다.

```tsx
// ❌ 잘못된 방식
<div style={{ background: '#1e293b' }}>
<div className="bg-[#1e293b]">

// ✅ 올바른 방식
<div className="bg-infra-bg-secondary">
<div style={{ background: 'var(--infra-bg-secondary)' }}>
```

**토큰 참조**: `.claude/templates/infraflow-design-system.md`

---

## DS-002: 노드 카테고리 색상

**규칙**: 인프라 노드는 카테고리에 맞는 색상을 사용한다.

| 카테고리 | 색상 | 클래스 |
|----------|------|--------|
| Security | Red | `border-infra-node-security` |
| Network | Blue | `border-infra-node-network` |
| Compute | Green | `border-infra-node-compute` |
| Cloud | Purple | `border-infra-node-cloud` |
| Storage | Amber | `border-infra-node-storage` |
| Auth | Pink | `border-infra-node-auth` |

```tsx
// 노드 컴포넌트 예시
const FirewallNode = () => (
  <div className="infra-node infra-node-security">
    <FirewallIcon className="text-infra-node-security" />
    <span>Firewall</span>
  </div>
);
```

---

## DS-003: 다크모드 우선

**규칙**: 모든 UI 요소는 다크모드를 기본으로 설계한다.

```
배경 색상:
├── bg-primary: #0f172a (캔버스)
├── bg-secondary: #1e293b (카드, 노드)
├── bg-tertiary: #334155 (입력 필드)
└── bg-hover: #475569 (호버 상태)

텍스트 색상:
├── text-primary: #f8fafc (주요 텍스트)
├── text-secondary: #e2e8f0 (부제목)
├── text-muted: #94a3b8 (힌트)
└── text-subtle: #64748b (비활성화)
```

---

## DS-004: 대비율 준수

**규칙**: WCAG AA 기준 (4.5:1) 이상의 대비율을 유지한다.

```
✅ 충족 조합:
- #f8fafc on #0f172a → 15.8:1
- #f8fafc on #1e293b → 12.1:1
- #94a3b8 on #0f172a → 6.3:1

⚠️ 대형 텍스트만 가능 (3:1):
- #3b82f6 on #1e293b → 4.2:1
- #8b5cf6 on #1e293b → 3.8:1
```

**도구**: https://webaim.org/resources/contrastchecker/

---

## DS-005: 타이포그래피 일관성

**규칙**: 정의된 폰트 패밀리와 크기만 사용한다.

```
폰트 패밀리:
├── UI 전반: Inter (font-sans)
└── 코드/기술: JetBrains Mono (font-mono)

폰트 크기:
├── text-xs: 12px (배지, 메타)
├── text-sm: 14px (노드 레이블)
├── text-base: 16px (본문)
├── text-lg: 18px (섹션 제목)
├── text-xl: 20px (패널 제목)
└── text-2xl: 24px (페이지 제목)
```

---

## DS-006: 여백 스케일 사용

**규칙**: 4px 기반 여백 스케일을 사용한다.

```
여백 스케일:
├── space-1: 4px
├── space-2: 8px
├── space-3: 12px
├── space-4: 16px (기본 패딩)
├── space-6: 24px
├── space-8: 32px
└── space-12: 48px
```

```tsx
// ❌ 잘못된 방식
<div className="p-[13px] m-[7px]">

// ✅ 올바른 방식
<div className="p-4 m-2">
```

---

## DS-007: 애니메이션 일관성

**규칙**: 정의된 트랜지션 속도와 이징을 사용한다.

```
트랜지션:
├── fast: 150ms ease
├── base: 200ms ease (기본)
└── slow: 300ms ease

애니메이션:
├── flow-dash: 흐름 점선 이동
├── fade-in: 페이드 인
└── pulse-slow: 상태 펄스
```

```tsx
// ❌ 잘못된 방식
<div style={{ transition: '0.3s' }}>

// ✅ 올바른 방식
<div className="transition-all duration-base">
<div className="transition-colors duration-fast">
```

---

## DS-008: 컴포넌트 스타일 준수

**규칙**: 정의된 컴포넌트 클래스를 사용한다.

### 노드 컴포넌트
```tsx
<div className="infra-node infra-node-{category}">
  {/* 노드 내용 */}
</div>
```

### 버튼
```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
```

### 입력 필드
```tsx
<input className="input-default" />
<input className="prompt-input" />
```

### 글래스 패널
```tsx
<div className="glass-panel">
  {/* 패널 내용 */}
</div>
```

---

## 안티패턴 (피해야 할 것)

```
❌ 하드코딩된 색상값 사용
❌ 7개 이상의 액센트 색상 사용
❌ 4.5:1 미만의 대비율
❌ 비표준 폰트 크기 (13px, 17px 등)
❌ 비표준 여백 (5px, 11px 등)
❌ 과도한 그림자/블러 효과
❌ 0.5초 이상의 트랜지션
❌ 일관성 없는 모서리 둥글기
```

---

## 체크리스트

### 컴포넌트 생성 시
- [ ] 색상 토큰 사용
- [ ] 카테고리 색상 적용 (노드)
- [ ] 대비율 확인
- [ ] 폰트 스케일 준수
- [ ] 여백 스케일 준수
- [ ] 트랜지션 설정
- [ ] 호버/포커스 상태

### 코드 리뷰 시
- [ ] 하드코딩된 색상 없음
- [ ] 디자인 토큰 사용
- [ ] 접근성 준수
- [ ] 다크모드 호환
