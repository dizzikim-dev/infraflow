# InfraFlow - AI 인프라 시각화 플랫폼

## 프로젝트 비전

> **프롬프트 한 줄로 인프라 아키텍처를 시각화하고, 데이터 흐름을 애니메이션으로 보여주는 플랫폼**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   사용자 입력                              시각화 결과                   │
│   ───────────                              ───────────                   │
│                                                                         │
│   "VDI + 내부망 LLM 연동하는      ───▶    ┌─────────────────────────┐  │
│    인프라 보여줘"                         │  🔄 애니메이션 다이어그램  │  │
│                                           │  ├─ 보안장비 연결        │  │
│   "3티어 웹 아키텍처에           ───▶    │  ├─ 네트워크 토폴로지    │  │
│    WAF 붙인 구조"                         │  ├─ 데이터 흐름 경로     │  │
│                                           │  └─ 정책/규칙 표시       │  │
│   "클라우드 하이브리드           ───▶    └─────────────────────────┘  │
│    아키텍처 보여줘"                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 핵심 목표
1. **자연어 → 인프라 다이어그램**: 프롬프트로 복잡한 아키텍처 생성
2. **애니메이션 데이터 흐름**: 실시간으로 데이터가 어떻게 흐르는지 시각화
3. **보안 정책 시각화**: 방화벽, ACL, 라우팅 정책 등을 시각적으로 표현
4. **인터랙티브 편집**: 생성된 다이어그램을 드래그앤드롭으로 수정

---

## 핵심 기능 정의

### 1. 인프라 구성요소 라이브러리

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        구성요소 카테고리                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔒 보안 장비              🌐 네트워크 장비          🖥️ 컴퓨팅/서버      │
│  ─────────────            ───────────────          ─────────────        │
│  • Firewall               • Router                 • Web Server         │
│  • WAF                    • Switch (L2/L3)         • App Server         │
│  • IDS/IPS                • Load Balancer          • DB Server          │
│  • VPN Gateway            • SD-WAN                 • Container          │
│  • NAC                    • DNS                    • VM                 │
│  • DLP                    • CDN                    • Kubernetes         │
│                                                                         │
│  ☁️ 클라우드 서비스        📦 스토리지              🔐 인증/접근         │
│  ────────────────         ─────────                ──────────           │
│  • AWS VPC                • SAN/NAS                • LDAP/AD            │
│  • Azure VNet             • Object Storage         • SSO                │
│  • GCP Network            • Backup                 • MFA                │
│  • Private Cloud          • Cache (Redis)          • IAM                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. 데이터 흐름 애니메이션

```
흐름 유형:
├── Request Flow (요청)     ───▶ 파란색 점선 이동
├── Response Flow (응답)    ◀─── 녹색 점선 이동
├── Sync/Replication        ◀──▶ 주황색 양방향
├── Blocked/Denied          ──✕── 빨간색 차단 표시
└── Encrypted               ═══▶ 굵은 실선 (자물쇠 아이콘)
```

### 3. 정책 시각화

```
┌─────────────────────────────────────────────────────────────────────────┐
│  정책 레이어 표시 예시                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [Internet]                                                            │
│       │                                                                 │
│       │  ┌─────────────────────────────────┐                           │
│       │  │ 🔒 Policy: Allow HTTPS (443)    │                           │
│       │  │    Deny: All other ports        │                           │
│       │  └─────────────────────────────────┘                           │
│       ▼                                                                 │
│   [Firewall] ──────▶ [WAF] ──────▶ [Load Balancer]                     │
│                        │                                                │
│                        │  ┌─────────────────────────────────┐          │
│                        │  │ 🛡️ WAF Rules:                   │          │
│                        │  │    • SQL Injection Block        │          │
│                        │  │    • XSS Prevention             │          │
│                        │  │    • Rate Limiting: 100/min     │          │
│                        │  └─────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 기술 스택 (제안)

### Frontend
| 기술 | 용도 | 이유 |
|------|------|------|
| **React/Next.js** | UI 프레임워크 | 컴포넌트 기반, SSR 지원 |
| **React Flow** | 다이어그램 렌더링 | 노드/엣지 기반, 인터랙티브 |
| **Framer Motion** | 애니메이션 | 선언적 애니메이션, 성능 |
| **D3.js** | 데이터 시각화 | 복잡한 흐름 표현 |
| **Tailwind CSS** | 스타일링 | 빠른 개발, 일관성 |

### Backend
| 기술 | 용도 | 이유 |
|------|------|------|
| **Python/FastAPI** | API 서버 | 빠른 개발, 타입 힌트 |
| **LLM (Claude/GPT)** | 프롬프트 해석 | 자연어 → 구조화 데이터 |
| **LangChain** | LLM 오케스트레이션 | 체인 구성, 프롬프트 관리 |
| **PostgreSQL** | 데이터 저장 | 템플릿, 사용자 데이터 |

### 인프라 (배포)
| 기술 | 용도 | 이유 |
|------|------|------|
| **Vercel** | Frontend 배포 | Next.js 최적화 |
| **Docker** | 컨테이너화 | 일관된 환경 |
| **Railway/Render** | Backend 배포 | 간편한 배포 |

---

## 에이전트 역할 정의

### 1. Prompt Parser Agent (프롬프트 해석)
**역할**: 사용자 자연어 입력을 구조화된 인프라 스펙으로 변환
```
입력: "3티어 웹 아키텍처에 WAF랑 CDN 붙여줘"
출력: {
  components: [CDN, WAF, LB, WebServer, AppServer, DBServer],
  connections: [...],
  zones: [DMZ, Internal, DB],
  policies: [...]
}
```

### 2. Diagram Generator Agent (다이어그램 생성)
**역할**: 구조화된 스펙을 시각적 레이아웃으로 변환
```
입력: 구조화된 인프라 스펙
출력: {
  nodes: [{id, type, position, style}],
  edges: [{source, target, animated, style}],
  layout: "hierarchical" | "circular" | "custom"
}
```

### 3. Animation Controller Agent (애니메이션 제어)
**역할**: 데이터 흐름 시나리오를 애니메이션 시퀀스로 변환
```
입력: "사용자 요청이 DB까지 가는 과정 보여줘"
출력: {
  sequence: [
    {from: "User", to: "CDN", delay: 0, type: "request"},
    {from: "CDN", to: "WAF", delay: 500, type: "request"},
    ...
  ]
}
```

### 4. Policy Visualizer Agent (정책 시각화)
**역할**: 보안 정책, ACL, 라우팅 규칙을 시각적 요소로 변환
```
입력: "방화벽 정책 보여줘"
출력: {
  policyOverlays: [
    {target: "firewall", rules: [...], position: "tooltip"}
  ]
}
```

---

## 피드백 에이전트 (유지)

### Pessimist Agent (비관적 검토)
**역할**: 리스크, 문제점, 기술적 한계 분석
```
[Pessimist Agent]
검토 대상: {기능/설계/코드}
질문:
1. 이것이 실패한다면, 가장 큰 이유는?
2. 성능 병목은 어디서 발생할까?
3. 사용자가 불편해할 부분은?
출력: {리스크 목록, 대응 방안}
```

### Optimist Agent (낙관적 검토)
**역할**: 기회, 확장 가능성, 차별화 포인트 분석
```
[Optimist Agent]
검토 대상: {기능/설계/코드}
질문:
1. 이 기능이 사용자에게 주는 가장 큰 가치는?
2. 확장 가능한 방향은?
3. 경쟁 제품 대비 강점은?
출력: {기회 목록, 권장 방향}
```

### Feedback Analyzer Agent (피드백 분석)
**역할**: 비관/낙관 피드백 종합, 우선순위화
```
[Feedback Analyzer Agent]
입력: {비관 피드백, 낙관 피드백}
출력: {종합 평가, P0/P1/P2 우선순위, 의존성 맵}
```

### Planner Agent (실행 계획)
**역할**: PR 단위 실행 계획 수립
```
[Planner Agent]
입력: {피드백 분석 결과}
출력: {PR 목록, 병렬 스트림, 마일스톤}
```

---

## 데이터 관리 에이전트

### Infrastructure Data Agent (인프라 데이터 관리)
**역할**: 인프라 장비/솔루션 데이터 관리 전담
**호출**: `@InfraDataAgent` 또는 `@infra-data`

```
[Infrastructure Data Agent]
담당:
├── 장비 데이터 CRUD (추가/수정/삭제)
├── 4-파일 동기화 (타입, DB, 패턴, 문서)
├── 데이터 품질 검증
└── 문서 최신화

관련 파일:
├── src/types/infra.ts           # 타입 정의
├── src/lib/data/infrastructureDB.ts  # 장비 데이터베이스
├── src/lib/parser/patterns.ts   # 파싱 패턴
└── docs/INFRASTRUCTURE_COMPONENTS.md  # 현황 문서
```

#### 주요 명령
```
# 장비 추가
@InfraDataAgent: add security siem "SIEM" "SIEM 시스템"

# 데이터 검증
@InfraDataAgent: validate all

# 동기화 확인
@InfraDataAgent: check sync

# 현황 리포트
@InfraDataAgent: report summary
```

#### 적용 규칙
- `INFRA-DATA-001`: 타입 정의 필수
- `INFRA-DATA-002`: 데이터베이스 완전성
- `INFRA-DATA-003`: 파싱 패턴 등록
- `INFRA-DATA-004`: 4-파일 동기화
- `INFRA-DATA-005`: ID 네이밍 (kebab-case)
- `INFRA-DATA-006`: 한/영 이중 언어
- `INFRA-DATA-007`: 카테고리 분류
- `INFRA-DATA-008`: 티어 배치

상세 규칙: `.claude/rules/infra-data-rules.md`
에이전트 정의: `.claude/agents/infra-data-agent.md`

---

## 개발 로드맵

### Phase 1: Foundation (MVP)
```
목표: 기본 다이어그램 생성 + 정적 렌더링

PR #1: 프로젝트 셋업
├── Next.js + TypeScript 초기화
├── React Flow 연동
├── 기본 UI 레이아웃
└── 예상: 1-2일

PR #2: 컴포넌트 라이브러리
├── 인프라 노드 컴포넌트 (10개)
├── 연결선 스타일 정의
├── 아이콘 시스템
└── 예상: 2-3일

PR #3: LLM 프롬프트 파서
├── 프롬프트 → JSON 변환
├── 기본 템플릿 5개
├── API 엔드포인트
└── 예상: 2-3일

PR #4: 다이어그램 렌더링
├── JSON → React Flow 변환
├── 자동 레이아웃
├── 기본 인터랙션
└── 예상: 2-3일
```

### Phase 2: Animation (핵심 기능)
```
목표: 데이터 흐름 애니메이션 구현

PR #5: 애니메이션 엔진
├── 엣지 애니메이션 (점 이동)
├── 시퀀스 컨트롤러
├── 재생/일시정지/속도 조절
└── 예상: 3-4일

PR #6: 흐름 시나리오
├── 요청/응답 흐름
├── 에러/차단 흐름
├── 복제/동기화 흐름
└── 예상: 2-3일

PR #7: 정책 오버레이
├── 노드 클릭 시 정책 표시
├── 호버 툴팁
├── 정책 편집 UI
└── 예상: 2-3일
```

### Phase 3: Intelligence (고도화)
```
목표: LLM 고도화 + 사용자 경험 향상

PR #8: 스마트 프롬프트
├── 맥락 이해 개선
├── 후속 질문 처리
├── 다이어그램 수정 명령
└── 예상: 3-4일

PR #9: 템플릿 시스템
├── 사전 정의 아키텍처
├── 사용자 템플릿 저장
├── 공유 기능
└── 예상: 2-3일

PR #10: 내보내기
├── PNG/SVG 다운로드
├── PDF 보고서
├── 공유 링크
└── 예상: 2-3일
```

---

## 병렬 처리 다이어그램

```
시간 ─────────────────────────────────────────────────────────▶

Phase 1: Foundation              Phase 2: Animation      Phase 3
┌────────────────────────────┐  ┌───────────────────┐  ┌─────────┐
│                            │  │                   │  │         │
│  Stream A (Frontend)       │  │                   │  │         │
│  ┌──────┐  ┌──────┐       │  │ ┌──────┐         │  │ ┌──────┐│
│  │PR #1 │─▶│PR #2 │───────┼──┼▶│PR #5 │─────────┼──┼▶│PR #8 ││
│  └──────┘  └──────┘       │  │ └──────┘         │  │ └──────┘│
│                            │  │     │            │  │         │
│  Stream B (Backend)        │  │     ▼            │  │         │
│  ┌──────┐  ┌──────┐       │  │ ┌──────┐ ┌──────┐│  │ ┌──────┐│
│  │PR #3 │─▶│PR #4 │───────┼──┼▶│PR #6 │▶│PR #7 ││──┼▶│PR #9 ││
│  └──────┘  └──────┘       │  │ └──────┘ └──────┘│  │ └──────┘│
│                            │  │                   │  │         │
│  병렬: PR#1-2 ∥ PR#3-4    │  │                   │  │  PR#10 │
│                            │  │                   │  │         │
└────────────────────────────┘  └───────────────────┘  └─────────┘
       약 1주                         약 1주               약 1주
```

---

## 작업 규칙 (Work Rules)

### 코드 작성 규칙

1. **파일 구조**
```
src/
├── components/
│   ├── nodes/           # 인프라 노드 컴포넌트
│   ├── edges/           # 연결선 컴포넌트
│   ├── panels/          # 패널 UI
│   └── shared/          # 공통 컴포넌트
├── lib/
│   ├── parser/          # 프롬프트 파서
│   ├── layout/          # 레이아웃 엔진
│   └── animation/       # 애니메이션 엔진
├── hooks/               # 커스텀 훅
├── types/               # TypeScript 타입
└── api/                 # API 라우트
```

2. **네이밍 규칙**
   - 컴포넌트: PascalCase (`FirewallNode.tsx`)
   - 함수/훅: camelCase (`useAnimationController.ts`)
   - 상수: UPPER_SNAKE_CASE (`DEFAULT_NODE_STYLE`)
   - 타입: PascalCase + 접미사 (`InfraNodeProps`, `FlowEdgeType`)

3. **커밋 메시지**
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
style: 스타일/포맷팅
docs: 문서 수정
test: 테스트 추가
```

### 문서 작성 규칙

1. **다이어그램**
   - ASCII 다이어그램: 마크다운 문서 내
   - 인터랙티브: React Flow 사용
   - 박스 문자: `┌ ┐ └ ┘ │ ─ ├ ┤ ┬ ┴ ┼`

2. **피드백 리포트 저장**
```
reports/
├── {YYYY-MM-DD}_{주제}_feedback.md
└── ...
```

---

## 주요 참조 문서

### 기존 문서 (레거시 - 참고용)
- `docs/` - 기존 VDI 제안 문서들 (아키텍처 패턴 참고)
- `context.txt` - 초기 요구사항

### 새 프로젝트 문서
- `src/` - 소스 코드
- `reports/` - 피드백 리포트
- `docs/INFRASTRUCTURE_COMPONENTS.md` - 인프라 장비 현황 문서

### 에이전트 및 규칙
- `.claude/agents/infra-data-agent.md` - 인프라 데이터 에이전트
- `.claude/rules/infra-data-rules.md` - 인프라 데이터 관리 규칙

---

## 다음 단계 (즉시 실행)

### 오늘 시작
1. [ ] **PR #1**: Next.js + React Flow 프로젝트 초기화
2. [ ] **PR #3**: LLM 프롬프트 파서 프로토타입 (병렬)

### 이번 주
3. [ ] **PR #2**: 기본 노드 컴포넌트 5개
4. [ ] **PR #4**: 다이어그램 렌더링 기본 구현

---

## 자주 사용하는 명령

```
# 프롬프트 파서 테스트
@PromptParser: "3티어 웹 아키텍처" 파싱해줘

# 다이어그램 생성
@DiagramGenerator: 이 스펙으로 다이어그램 만들어줘

# 애니메이션 시나리오
@AnimationController: 요청 흐름 애니메이션 시퀀스 만들어줘

# 피드백 워크플로우
@Pessimist: 현재 설계의 리스크 분석해줘
@Optimist: 확장 가능성 분석해줘
@Planner: PR 단위로 계획 세워줘

# 인프라 데이터 관리
@InfraDataAgent: validate all          # 전체 데이터 검증
@InfraDataAgent: check sync            # 동기화 확인
@InfraDataAgent: report summary        # 현황 리포트
@InfraDataAgent: info firewall         # 장비 정보 조회
```

---

## 통합 스킬 시스템

> Superpowers + UI UX Pro Max 스킬이 통합되어 있습니다.

### Superpowers 스킬 (개발 워크플로우)

| 스킬 | 명령어 | 설명 |
|------|--------|------|
| TDD | `/tdd` | RED-GREEN-REFACTOR 테스트 주도 개발 |
| Debugging | `/debug` | 4단계 체계적 디버깅 |
| Brainstorming | `/brainstorm` | 소크라테스식 설계 정제 |
| Parallel Agents | `/parallel` | 병렬 에이전트 작업 분배 |
| Writing Plans | `/plan` | 실행 가능한 계획 수립 |
| Verification | `/verify` | 완료 전 검증 |

**적용 규칙**:
- 모든 새 기능에 TDD 적용 (테스트 먼저 작성)
- 버그 발생 시 4단계 체계적 디버깅 사용
- 복잡한 기능은 브레인스토밍으로 시작
- Frontend/Backend 독립 작업은 병렬 에이전트 활용

### UI UX Pro Max 스킬 (디자인 시스템)

| 스킬 | 명령어 | 설명 |
|------|--------|------|
| Design System | `/design-system` | 완전한 디자인 시스템 생성 |
| UI Styles | `/ui-style` | 67개 UI 스타일 적용 |
| Color Palettes | `/color-palette` | 96개 색상 팔레트 적용 |

**InfraFlow 디자인 프리셋**:
```
스타일: Dark Mode + Minimalism + AI Native
팔레트: Tech Infrastructure Dark
폰트: Inter + JetBrains Mono
```

### 스킬 + 에이전트 통합 매핑

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         스킬 ↔ 에이전트 통합                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Superpowers Skill           InfraFlow Agent          UI UX Pro Max        │
│  ─────────────────           ───────────────          ─────────────        │
│                                                                             │
│  /brainstorm          ←───→  @Pessimist               (해당없음)            │
│                              @Optimist                                      │
│                                                                             │
│  /plan                ←───→  @Planner                 (해당없음)            │
│                                                                             │
│  /tdd                 ←───→  @InfraDataAgent          (해당없음)            │
│  /verify                     (테스트 검증)                                   │
│                                                                             │
│  /parallel            ←───→  Frontend Agent           /ui-style            │
│                              Backend Agent            /color-palette       │
│                                                                             │
│  (해당없음)           ←───→  @DiagramGenerator        /design-system       │
│                              (노드/엣지 스타일)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 통합 개발 워크플로우

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          새 기능 개발 워크플로우                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣ 기능 요청 수신                                                          │
│     │                                                                       │
│     ▼                                                                       │
│  2️⃣ /brainstorm ─────────────────────────────────────────┐                 │
│     │  • @Pessimist + @Optimist 통합 분석                  │                 │
│     │  • 소크라테스식 요구사항 정제                         │                 │
│     ▼                                             ◀────────┘                 │
│  3️⃣ /plan                                                                   │
│     │  • PR 단위 계획 수립                                                   │
│     │  • 2-5분 단위 작업 분해                                                │
│     ▼                                                                       │
│  4️⃣ /parallel (해당 시)                                                     │
│     │  ┌─────────────────┬─────────────────┐                                │
│     │  │ Frontend Agent  │ Backend Agent   │                                │
│     │  │ + /ui-style     │ + /tdd          │                                │
│     │  └────────┬────────┴────────┬────────┘                                │
│     ▼           │                 │                                          │
│  5️⃣ /tdd ◀─────┴─────────────────┘                                          │
│     │  • RED: 실패 테스트 작성                                               │
│     │  • GREEN: 최소 구현                                                    │
│     │  • REFACTOR: 개선                                                      │
│     ▼                                                                       │
│  6️⃣ /verify                                                                 │
│     │  • 테스트 통과 확인                                                    │
│     │  • 디자인 시스템 준수 검증                                             │
│     │  • 빌드 성공 확인                                                      │
│     ▼                                                                       │
│  7️⃣ 완료 및 커밋                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 스킬 파일 위치

```
.claude/skills/
├── superpowers/
│   ├── index.md                 # 스킬 인덱스
│   ├── tdd.md                   # TDD 스킬
│   ├── systematic-debugging.md  # 디버깅 스킬
│   ├── brainstorming.md         # 브레인스토밍 스킬
│   ├── parallel-agents.md       # 병렬 에이전트 스킬
│   ├── writing-plans.md         # 계획 수립 스킬
│   └── verification.md          # 검증 스킬
└── ui-ux-pro-max/
    ├── index.md                 # 스킬 인덱스
    ├── design-system.md         # 디자인 시스템 스킬
    ├── ui-styles.md             # UI 스타일 스킬
    └── color-palettes.md        # 색상 팔레트 스킬
```

### 자주 사용하는 통합 명령

```
# 개발 워크플로우
/brainstorm [주제]        # 브레인스토밍 시작
/plan [기능]              # 계획 수립
/parallel [작업들]        # 병렬 작업 분배
/tdd [기능]               # TDD 사이클 시작
/debug [이슈]             # 체계적 디버깅
/verify                   # 완료 전 검증

# UI/UX 워크플로우
/design-system            # 디자인 시스템 생성
/ui-style [스타일]        # UI 스타일 적용
/color-palette [테마]     # 색상 팔레트 적용

# 통합 사용 예시
/brainstorm 새로운 Cloud 노드 추가
/plan Cloud 노드 컴포넌트 구현
/tdd CloudNode 컴포넌트
/ui-style dark-mode
/verify
```

---

*이 문서는 InfraFlow 프로젝트의 메인 규칙 문서입니다.*
*다른 Claude 세션에서도 이 문서를 참조하여 작업을 이어갈 수 있습니다.*
