# InfraFlow - Development Roadmap

## Phase 1: Foundation (MVP)

| PR | 내용 | 스트림 |
|----|------|--------|
| #1 | Next.js + TypeScript + React Flow 초기화 | Frontend |
| #2 | 인프라 노드 컴포넌트 라이브러리 (10개) | Frontend |
| #3 | LLM 프롬프트 파서 프로토타입 | Backend |
| #4 | 다이어그램 렌더링 + 자동 레이아웃 | Backend |

## Phase 2: Animation (핵심 기능)

| PR | 내용 | 의존성 |
|----|------|--------|
| #5 | 애니메이션 엔진 (엣지 애니메이션, 시퀀스 컨트롤러) | PR #2 |
| #6 | 흐름 시나리오 (요청/응답/에러/차단) | PR #5 |
| #7 | 정책 오버레이 (노드 클릭 시 정책 표시) | PR #6 |

## Phase 3: Intelligence (고도화)

| PR | 내용 | 의존성 |
|----|------|--------|
| #8 | 스마트 프롬프트 (맥락 이해, 후속 질문) | PR #4 |
| #9 | 템플릿 시스템 (사전 정의/사용자/공유) | PR #4 |
| #10 | 내보내기 (PNG/SVG/PDF/공유 링크) | PR #4 |

## 병렬 처리

- Phase 1: PR#1-2 (Frontend) || PR#3-4 (Backend) 병렬
- Phase 2: PR#5 → PR#6 → PR#7 순차
- Phase 3: PR#8, PR#9, PR#10 각각 독립
