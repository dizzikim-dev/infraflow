---
paths:
  - "src/components/**/*.tsx"
  - "src/hooks/**/*.ts"
---

# Frontend Rules

- React 19: `useRef`는 초기값 필수 (`useRef<T>(undefined)`)
- 디자인 토큰 사용, 하드코딩 색상 금지 (DS-001)
- Tailwind 동적 클래스는 safelist 등록 필수
- 노드 컴포넌트는 `infra-node infra-node-{category}` 클래스 사용 (DS-002)
- WCAG AA 대비율 4.5:1 이상 유지 (DS-004)
- 여백은 4px 기반 스케일만 사용 (DS-006)
- 트랜지션은 300ms 이하 (DS-007)
- React Flow 노드는 `NodeProps` 타입 사용
