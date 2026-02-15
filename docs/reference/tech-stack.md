# InfraFlow - Tech Stack & Agent Roles

## Frontend
| 기술 | 용도 | 이유 |
|------|------|------|
| React/Next.js | UI 프레임워크 | 컴포넌트 기반, SSR 지원 |
| React Flow | 다이어그램 렌더링 | 노드/엣지 기반, 인터랙티브 |
| Framer Motion | 애니메이션 | 선언적 애니메이션, 성능 |
| D3.js | 데이터 시각화 | 복잡한 흐름 표현 |
| Tailwind CSS | 스타일링 | 빠른 개발, 일관성 |

## Backend
| 기술 | 용도 | 이유 |
|------|------|------|
| Next.js API Routes | API 서버 | 풀스택 통합 |
| LLM (Claude/GPT) | 프롬프트 해석 | 자연어 → 구조화 데이터 |
| PostgreSQL + Prisma | 데이터 저장 | 템플릿, 사용자 데이터 |

## 배포
| 기술 | 용도 |
|------|------|
| Vercel | Frontend 배포 |
| Docker | 컨테이너화 |

## Agent Roles

### Prompt Parser Agent
사용자 자연어 입력 → 구조화된 인프라 스펙 (components, connections, zones, policies)

### Diagram Generator Agent
구조화된 스펙 → React Flow 노드/엣지 + 자동 레이아웃

### Animation Controller Agent
데이터 흐름 시나리오 → 애니메이션 시퀀스 (from, to, delay, type)

### Policy Visualizer Agent
보안 정책/ACL/라우팅 → 시각적 오버레이 (tooltip, overlay)
